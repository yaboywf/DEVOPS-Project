const fs = require('fs').promises;
const path = require('path');
const v8toIstanbul = require('v8-to-istanbul');
const reports = require('istanbul-reports');
const { createContext } = require('istanbul-lib-report');
const { createCoverageMap } = require('istanbul-lib-coverage');

const coverageDir = path.join(process.cwd(), 'coverage/temp');
const outputDir = path.join(process.cwd(), 'coverage/frontend');
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

      let pathname;
      try {
        pathname = entry.url.startsWith('http') || entry.url.startsWith('file://')
          ? new URL(entry.url).pathname
          : entry.url;
      } catch {
        pathname = entry.url;
      }

      if (pathname.match(/^\/[A-Za-z]:/)) {
        pathname = pathname.substring(1);
      }

      if (!pathname.endsWith(TARGET_FILE)) {
        console.log(`Skipping: ${pathname}`);
        continue;
      }

      console.log(`Processing coverage for: ${pathname}`);

      try {
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
    console.log('No coverage data was converted.');
    return;
  }

  // Create output folder
  await fs.mkdir(outputDir, { recursive: true });

  // Generate HTML + LCOV reports
  const context = createContext({ dir: outputDir, coverageMap });

  ['html', 'lcovonly'].forEach(type =>
    reports.create(type).execute(context)
  );

  console.log(`\nCoverage report generated for "${TARGET_FILE}" in:\n   ${outputDir}\n`);
}

convertCoverage();
