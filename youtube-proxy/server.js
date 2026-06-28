const express = require('express');
const cors = require('cors');
const youtubedl = require('youtube-dl-exec');
const https = require('https');
const urlModule = require('url');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());

// Memory cache to prevent hammering yt-dlp on every chunk request
const urlCache = new Map();

// Active FFmpeg processes map to prevent starting multiple for the same session
const activeFFmpeg = new Map();

async function getStreamUrl(videoId, height) {
  const now = Date.now();
  const cacheKey = `${videoId}_${height}`;
  if (urlCache.has(cacheKey)) {
    const cached = urlCache.get(cacheKey);
    if (now < cached.expiresAt) {
      console.log(`[Proxy] Using CACHED stream url for ${videoId} (${height})`);
      return cached.url;
    }
  }

  console.log(`[Proxy] Extracting NEW stream url for ${videoId} (${height})`);
  const url = `https://www.youtube.com/watch?v=${videoId}`;
  const format = height === 'Auto' ? 'best[ext=mp4]/best' : `best[ext=mp4][height<=${height}]/best[height<=${height}]/best`;
  
  const streamUrlRaw = await youtubedl(url, {
    getUrl: true,
    format: format,
    noWarnings: true,
    noCallHome: true,
    noCheckCertificate: true,
  });
  
  const streamUrl = streamUrlRaw.split('\n')[0].trim();
  
  urlCache.set(cacheKey, {
    url: streamUrl,
    expiresAt: now + (2 * 60 * 60 * 1000) // 2 hours
  });

  return streamUrl;
}

// Serve the HLS temporary chunks directory as static files
const hlsDir = path.join(__dirname, 'hls_tmp');
if (!fs.existsSync(hlsDir)) {
  fs.mkdirSync(hlsDir, { recursive: true });
}
app.use('/hls_data', express.static(hlsDir));

// On-the-Fly HLS Generation Endpoint
app.get('/hls/:videoId/playlist.m3u8', async (req, res) => {
  const videoId = req.params.videoId;
  let start = parseInt(req.query.start) || 0;
  let end = parseInt(req.query.end) || 0;
  let resume = parseInt(req.query.resume) || 0;
  let height = req.query.h || 'Auto';
  
  if (!videoId) return res.status(400).send('Missing id');
  if (end === 0) end = start + (2 * 60 * 60); // Default clip length 2 hours if not specified

  const duration = end - start;
  // Create a unique session ID based on video ID, start/end time, and height
  const sessionId = `${videoId}_${start}_${end}_${height}`;
  const sessionDir = path.join(hlsDir, sessionId);
  const playlistPath = path.join(sessionDir, 'playlist.m3u8');

  // If the playlist already exists, just redirect to the static file instantly!
  if (fs.existsSync(playlistPath)) {
    return res.redirect(`/hls_data/${sessionId}/playlist.m3u8`);
  }

  try {
    const streamUrl = await getStreamUrl(videoId, height);

    // Create session directory
    if (!fs.existsSync(sessionDir)) {
      fs.mkdirSync(sessionDir, { recursive: true });
    }

    // If FFmpeg is already running for this session, wait for the playlist to appear
    if (activeFFmpeg.has(sessionId)) {
      let attempts = 0;
      const checkInterval = setInterval(() => {
        if (fs.existsSync(playlistPath) && !activeFFmpeg.has(sessionId)) {
          clearInterval(checkInterval);
          return res.redirect(`/hls_data/${sessionId}/playlist.m3u8`);
        }
        attempts++;
        if (attempts > 120) { // 60 seconds timeout
          clearInterval(checkInterval);
          if (!res.headersSent) res.status(500).send('Timeout waiting for HLS playlist');
        }
      }, 500);
      return;
    }

    console.log(`[HLS] Starting FFmpeg for session: ${sessionId} (Start: ${start}s, Duration: ${duration}s)`);

    // Spawn FFmpeg to cut the segment and generate HLS chunks
    const ffmpeg = spawn('ffmpeg', [
      // Seek BEFORE input for fast seeking! (Very important for 48-hour videos)
      '-ss', start.toString(),
      '-i', streamUrl,
      // Stop after the duration is reached
      '-t', duration.toString(),
      // Copy codec, no re-encoding! Fast as lightning.
      '-c', 'copy',
      // HLS configurations
      '-f', 'hls',
      '-hls_time', '10', // 10 second chunks
      '-hls_list_size', '0', // Keep all chunks in the playlist
      '-hls_segment_filename', path.join(sessionDir, 'chunk_%03d.ts'),
      playlistPath
    ]);

    activeFFmpeg.set(sessionId, ffmpeg);

    ffmpeg.stderr.on('data', (data) => {
      // ffmpeg logs to stderr
      // console.log(`[FFmpeg] ${data.toString()}`);
    });

    ffmpeg.on('close', (code) => {
      console.log(`[HLS] FFmpeg finished for session ${sessionId} with code ${code}`);
      activeFFmpeg.delete(sessionId);
    });

    // Wait until the playlist file is generated and FFmpeg finishes
    let attempts = 0;
    const checkInterval = setInterval(() => {
      if (fs.existsSync(playlistPath) && !activeFFmpeg.has(sessionId)) {
        clearInterval(checkInterval);
        console.log(`[HLS] Playlist ready for ${sessionId}`);

        // Inject EXT-X-START to force native players to resume automatically
        if (resume > 0) {
          try {
            let content = fs.readFileSync(playlistPath, 'utf8');
            if (!content.includes('EXT-X-START')) {
              // Ensure resume offset is relative to the start of this proxy stream
              const offset = resume - start;
              if (offset > 0) {
                content = content.replace('#EXTM3U', `#EXTM3U\n#EXT-X-START:TIME-OFFSET=${offset},PRECISE=YES`);
                fs.writeFileSync(playlistPath, content);
                console.log(`[HLS] Injected resume offset ${offset}s into playlist`);
              }
            }
          } catch (err) {
            console.error(`[HLS] Failed to inject resume tag:`, err);
          }
        }

        return res.redirect(`/hls_data/${sessionId}/playlist.m3u8`);
      }
      attempts++;
      if (attempts > 120) { // 60 seconds timeout
        clearInterval(checkInterval);
        ffmpeg.kill(); // Kill the process if it timed out
        activeFFmpeg.delete(sessionId);
        if (!res.headersSent) res.status(500).send('Timeout waiting for HLS playlist');
      }
    }, 500);

  } catch (error) {
    console.error('[HLS] Failed to start stream:', error.message);
    if (!res.headersSent) {
      res.status(500).send('Failed to extract stream');
    }
  }
});

// Periodic Cleanup Cron: Delete sessions older than 2 hours to save disk space
setInterval(() => {
  console.log('[Cleanup] Running HLS temporary files cleanup...');
  const now = Date.now();
  if (fs.existsSync(hlsDir)) {
    const sessions = fs.readdirSync(hlsDir);
    sessions.forEach(session => {
      const sessionPath = path.join(hlsDir, session);
      const stats = fs.statSync(sessionPath);
      // If folder is older than 2 hours
      if (now - stats.mtimeMs > 2 * 60 * 60 * 1000) {
        console.log(`[Cleanup] Deleting stale session: ${session}`);
        fs.rmSync(sessionPath, { recursive: true, force: true });
      }
    });
  }
}, 30 * 60 * 1000); // Run every 30 mins

const PORT = process.env.PORT || 8085;
app.listen(PORT, () => {
  console.log(`🚀 Ad-Free YouTube Proxy running on port ${PORT} with On-the-Fly HLS`);
});
