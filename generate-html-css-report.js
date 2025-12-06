import fs from "fs";
import formatter from "stylelint-formatter-html";

const escapeHtml = (unsafe) => {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

const createReport = () => {
  const htmlResult = JSON.parse(fs.readFileSync("./html-css-test/html-results.json"));
  const cssJson = JSON.parse(fs.readFileSync("./html-css-test/css-results.json"));

  const cssReportHTML = formatter(cssJson);
  const htmlMessages = (htmlResult.results || []).flatMap(r => r.messages || []);

  const htmlErrors = htmlMessages
    .map( msg => `<li>Line ${msg.line ?? "?"}, Col ${msg.column ?? "?"}: ${escapeHtml(msg.message)} <a style="color: #a9a9a9;" href="${msg.ruleUrl}">(${msg.ruleId})</a></li>`)
    .join("");

  const htmlReportHTML = `
    <h2>HTML Validation Report</h2>
    <ul>${htmlErrors || "<li>No errors found</li>"}</ul>
  `;

  const finalHTML = `
  <html>
    <head>
      <title>Combined HTML + CSS Validation Report</title>
    </head>
    <body>
      <h1>Validation Summary</h1>
      ${htmlReportHTML}
      <hr/>
      <h2>CSS Validation Report</h2>
      ${cssReportHTML}
    </body>
  </html>
  `;

  fs.writeFileSync("validation-report.html", finalHTML, "utf8");
  console.log("Combined HTML report generated: validation-report.html");
};

createReport();
