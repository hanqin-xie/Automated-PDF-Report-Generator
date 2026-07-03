const path = require("path");
const config = require("./config");
const { createPool } = require("./db");
const {
  buildReportViewModel,
  loadDailySalesTrend,
  loadTopAccounts,
  loadWeeklyMetrics
} = require("./data");
const { renderHtml } = require("./renderHtml");
const { generatePdf } = require("./generatePdf");
const { sendReportEmail } = require("./sendEmail");

function getReportRange() {
  const end = new Date();
  const start = new Date(end);
  start.setDate(end.getDate() - 6);

  const formatter = new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    timeZone: config.reportTimezone,
    year: "numeric"
  });

  return `${formatter.format(start)} - ${formatter.format(end)}`;
}

async function generateReport() {
  const pool = createPool();

  try {
    const [metrics, trend, topAccounts] = await Promise.all([
      loadWeeklyMetrics(pool, config.paths.weeklySummarySql),
      loadDailySalesTrend(pool, config.paths.dailySalesTrendSql),
      loadTopAccounts(pool, config.paths.topAccountsSql)
    ]);
    const viewModel = buildReportViewModel(
      metrics,
      trend,
      topAccounts,
      config.companyName,
      getReportRange()
    );

    const chartScriptPath = path.join(
      __dirname,
      "..",
      "node_modules",
      "chart.js",
      "dist",
      "chart.umd.js"
    );

    const htmlPath = await renderHtml({
      templatePath: config.paths.template,
      cssPath: config.paths.css,
      outputPath: config.paths.htmlOutput,
      viewModel,
      chartScriptPath
    });

    const pdfPath = await generatePdf(htmlPath, config.paths.pdfOutput);

    return {
      htmlPath,
      pdfPath,
      reportRange: viewModel.reportRange
    };
  } finally {
    await pool.end();
  }
}

async function main() {
  const args = new Set(process.argv.slice(2));
  const generateOnly = args.has("--generate-only");
  const sendOnly = args.has("--send-only");

  if (generateOnly && sendOnly) {
    throw new Error("Use either --generate-only or --send-only, not both.");
  }

  if (sendOnly) {
    await sendReportEmail({
      apiKey: config.sendGridApiKey,
      from: config.emailFrom,
      to: config.emailTo,
      pdfPath: config.paths.pdfOutput,
      subject: `${config.companyName} Weekly Business Report`,
      companyName: config.companyName,
      reportRange: getReportRange()
    });

    console.log(`Email sent with attachment: ${config.paths.pdfOutput}`);
    return;
  }

  const result = await generateReport();
  console.log(`HTML report generated at: ${result.htmlPath}`);
  console.log(`PDF report generated at: ${result.pdfPath}`);

  if (!generateOnly) {
    await sendReportEmail({
      apiKey: config.sendGridApiKey,
      from: config.emailFrom,
      to: config.emailTo,
      pdfPath: result.pdfPath,
      subject: `${config.companyName} Weekly Business Report`,
      companyName: config.companyName,
      reportRange: result.reportRange
    });

    console.log(`Email sent to: ${config.emailTo.join(", ")}`);
  }
}

main().catch((error) => {
  console.error("Failed to generate weekly report.");
  console.error(error);
  process.exitCode = 1;
});
