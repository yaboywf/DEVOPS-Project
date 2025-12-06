import fs from "fs";
import { HtmlValidate } from "html-validate";
import stylelint from "stylelint";

const runValidators = async () => {
  // HTML Validation
  const html = fs.readFileSync("./public/index.html", "utf8");
  const htmlvalidate = new HtmlValidate();
  const htmlResult = await htmlvalidate.validateString(html);

  fs.writeFileSync("./html-css-test/html-results.json", JSON.stringify(htmlResult, null, 2));

  // CSS Validation
  const cssResult = await stylelint.lint({
    files: "./public/css/styles.css",
    formatter: "json"
  });

  fs.writeFileSync("./html-css-test/css-results.json", cssResult.output);

  console.log("HTML and CSS validation completed");
};

runValidators();
