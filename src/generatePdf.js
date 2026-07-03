const puppeteer = require("puppeteer");

async function generatePdf(htmlPath, pdfPath) {
  const browser = await puppeteer.launch({
    headless: true
  });

  try {
    const page = await browser.newPage();

    await page.goto(`file://${htmlPath}`, {
      waitUntil: "networkidle0"
    });

    await page.waitForFunction(() => window.__REPORT_READY__ === true);

    await page.pdf({
      path: pdfPath,
      format: "A4",
      printBackground: true,
      margin: {
        top: "12mm",
        right: "10mm",
        bottom: "12mm",
        left: "10mm"
      }
    });
  } finally {
    await browser.close();
  }

  return pdfPath;
}

module.exports = {
  generatePdf
};
