const fs = require("fs/promises");
const path = require("path");
const sendGridMail = require("@sendgrid/mail");

async function sendReportEmail({ apiKey, from, to, pdfPath, subject, companyName, reportRange }) {
  if (!apiKey) {
    throw new Error("SENDGRID_API_KEY is missing. Please set it in your .env file.");
  }

  if (!from || !to.length) {
    throw new Error("EMAIL_FROM or EMAIL_TO is missing. Please set them in your .env file.");
  }

  sendGridMail.setApiKey(apiKey);

  const attachment = await fs.readFile(pdfPath);

  await sendGridMail.send({
    to,
    from,
    subject,
    text: `${companyName} weekly report for ${reportRange} is attached.`,
    html: `
      <p>Hello team,</p>
      <p>Please find attached the latest weekly business report for <strong>${reportRange}</strong>.</p>
      <p>Generated automatically by the PDF report generator.</p>
    `,
    attachments: [
      {
        content: attachment.toString("base64"),
        filename: path.basename(pdfPath),
        type: "application/pdf",
        disposition: "attachment"
      }
    ]
  });
}

module.exports = {
  sendReportEmail
};
