const { YoutubeTranscript } = require('youtube-transcript');
async function test() {
  try {
    const transcript = await YoutubeTranscript.fetchTranscript('o-YmdaAvtgI'); // using a sample ID or just any
    console.log(transcript.slice(0, 5));
  } catch (e) {
    console.error(e);
  }
}
test();
