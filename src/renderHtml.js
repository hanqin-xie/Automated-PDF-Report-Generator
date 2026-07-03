const fs = require("fs/promises");
const path = require("path");
const Handlebars = require("handlebars");

async function renderHtml({ templatePath, cssPath, outputPath, viewModel, chartScriptPath }) {
  const [templateSource, styles] = await Promise.all([
    fs.readFile(templatePath, "utf8"),
    fs.readFile(cssPath, "utf8")
  ]);

  const template = Handlebars.compile(templateSource);
  const html = template({
    ...viewModel,
    chartScriptUrl: `file://${path.resolve(chartScriptPath)}`,
    styles
  });

  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, html, "utf8");

  return outputPath;
}

module.exports = {
  renderHtml
};
