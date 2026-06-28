const youtubedl = require('youtube-dl-exec');
async function test() {
  const url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'; // Never gonna give you up
  for (const h of ['360', '480', '720']) {
    try {
      const res = await youtubedl(url, {
        getUrl: true,
        format: `best[ext=mp4][height<=${h}]/best[height<=${h}]/best`,
      });
      console.log(`Height ${h}:`, res.split('\n')[0].substring(0, 50) + '...');
    } catch(e) {
      console.log(`Height ${h} failed:`, e.message.substring(0,50));
    }
  }
}
test();
