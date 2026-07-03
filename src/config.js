const path = require("path");
const dotenv = require("dotenv");

dotenv.config();

const projectRoot = path.resolve(__dirname, "..");
const outputDir = path.join(projectRoot, "output");

module.exports = {
  companyName: process.env.COMPANY_NAME || "Northstar Analytics",
  dataSource: process.env.DATA_SOURCE || "mock",
  databaseUrl: process.env.DATABASE_URL,
  emailFrom: process.env.EMAIL_FROM,
  emailTo: (process.env.EMAIL_TO || "")
    .split(",")
    .map((email) => email.trim())
    .filter(Boolean),
  outputDir,
  paths: {
    css: path.join(projectRoot, "assets", "report.css"),
    dailySalesTrendSql: path.join(projectRoot, "sql", "daily_sales_trend.sql"),
    htmlOutput: path.join(outputDir, "weekly-report.html"),
    pdfOutput: path.join(outputDir, "weekly-report.pdf"),
    topAccountsSql: path.join(projectRoot, "sql", "top_accounts.sql"),
    template: path.join(projectRoot, "templates", "weekly-report.hbs"),
    weeklySummarySql: path.join(projectRoot, "sql", "weekly_summary.sql")
  },
  reportTimezone: process.env.REPORT_TIMEZONE || "Asia/Singapore",
  puppeteerExecutablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
  shouldSendEmail: process.env.SEND_EMAIL === "true",
  sendGridApiKey: process.env.SENDGRID_API_KEY
};
