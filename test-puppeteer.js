const puppeteer = require('puppeteer-core');
(async () => {
  try {
    const browser = await puppeteer.launch({
      executablePath: '/usr/bin/google-chrome',
      headless: true
    });
    console.log("Success");
    await browser.close();
  } catch(e) {
    console.error(e);
  }
})();
