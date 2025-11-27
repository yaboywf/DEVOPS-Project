const fs = require('fs').promises;
const path = require('path');
const v8toIstanbul = require('v8-to-istanbul');
const reports = require('istanbul-reports');
const { createContext } = require('istanbul-lib-report');
const { createCoverageMap } = require('istanbul-lib-coverage');

const coverageDir = path.join(process.cwd(), 'coverage/temp'); // Playwright raw V8 coverage
const outputDir = path.join(process.cwd(), 'coverage/frontend'); // Final HTML report output

// Only include THIS file
const TARGET_FILE = 'dylan.js';

async function convertCoverage() {
  try {
    await fs.access(coverageDir);
  } catch {
    console.log('❌ No coverage data found.');
    return;
  }

  const coverageMap = createCoverageMap();
  const files = await fs.readdir(coverageDir);

  for (const file of files) {
    if (!file.endsWith('.json')) continue;

    const v8Coverage = JSON.parse(
      await fs.readFile(path.join(coverageDir, file), 'utf-8')
    );

    for (const entry of v8Coverage) {
      if (!entry.url || !entry.source) continue;

      // Normalize URL/path
      let pathname;
      try {
        pathname = entry.url.startsWith('http') || entry.url.startsWith('file://')
          ? new URL(entry.url).pathname
          : entry.url;
      } catch {
        pathname = entry.url;
      }

      // Fix Windows path: /C:/something → C:/something
      if (pathname.match(/^\/[A-Za-z]:/)) {
        pathname = pathname.substring(1);
      }

      // Ensure only "dylan.js" is processed
      if (!pathname.endsWith(TARGET_FILE)) {
        console.log(`Skipping (not dylan.js): ${pathname}`);
        continue;
      }

      console.log(`✔ Processing coverage for: ${pathname}`);

      try {
        // Important: prefix your actual public folder if needed
        const fullPath = path.join("public", pathname);

        const converter = v8toIstanbul(fullPath, 0, { source: entry.source });
        await converter.load();
        converter.applyCoverage(entry.functions);

        coverageMap.merge(converter.toIstanbul());
      } catch (err) {
        console.warn(`⚠ Skipping ${pathname}: ${err.message}`);
      }
    }
  }

  if (!Object.keys(coverageMap.data).length) {
    console.log('❌ No dylan.js coverage data was converted.');
    return;
  }

  // Create output folder
  await fs.mkdir(outputDir, { recursive: true });

  // Generate HTML + LCOV reports
  const context = createContext({ dir: outputDir, coverageMap });

  ['html', 'lcovonly'].forEach(type =>
    reports.create(type).execute(context)
  );

  console.log(`\n✅ Coverage report generated for "${TARGET_FILE}" in:\n   ${outputDir}\n`);
}

convertCoverage();
