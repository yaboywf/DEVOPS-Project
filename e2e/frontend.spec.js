import { test, expect } from '@playwright/test';
import './playwright-coverage.js'

const BASE_URL = 'http://localhost:5000';

test.use({
  launchOptions: {
    slowMo: 100  // small delay fixes many FF timing issues
  },
});

test('should load page', async ({ page }) => {
  await page.goto(BASE_URL, { waitUntil: "domcontentloaded" });
  await expect(page).toHaveTitle(/Chess Club Ranking System/);
});

test('should navigation to view ranking tab', async ({ page }) => {
  await page.goto(BASE_URL, { waitUntil: "domcontentloaded" });
  await page.click('button[onclick="showSection(\'view\')"]');

  const rankingSection = page.locator('#view-section');
  await expect(rankingSection).toBeVisible();

  await expect(rankingSection).toContainText('Chess Rankings');
  await expect(rankingSection.locator('table')).toBeVisible();
});

test("should show rankings table with default sort after successful load", async ({ page }) => {
  await page.goto(BASE_URL, { waitUntil: "domcontentloaded" });
  await page.click('button[onclick="showSection(\'view\')"]');

  const section = page.locator("#view-section");
  await expect(section).toBeVisible();

  await page.waitForSelector("td.loading", { state: "detached", timeout: 10000 });
  await page.waitForSelector('body[data-loaded="done"]');
  await expect(section.locator("#view-message")).toContainText("Showing");
  const rows = section.locator("#rankings-body tr");
  const count = await rows.count();
  expect(count).toBeGreaterThan(0);
  await expect(section.locator("table")).toBeVisible();

  for (let i = 0; i < count; i++) {
    await expect(rows.nth(i).locator("td").nth(2)).toHaveClass(/sorted-column/);
  }

  await page.waitForTimeout(5500);
  await expect(section.locator("#view-message")).toHaveCSS('display', 'none');
});

test('should show ranking table with explict rapid sort', async ({ page }) => {
  await page.goto(BASE_URL, { waitUntil: "domcontentloaded" });
  await page.click('button[onclick="showSection(\'view\')"]');

  const section = page.locator("#view-section");
  await expect(section).toBeVisible();

  await page.waitForSelector("td.loading", { state: "detached", timeout: 10000 });
  await page.waitForSelector('body[data-loaded="done"]');
  await expect(section.locator("#view-message")).toContainText("Showing");
  const rows = section.locator("#rankings-body tr");
  const count = await rows.count();
  expect(count).toBeGreaterThan(0);
  await expect(section.locator("table")).toBeVisible();

  for (let i = 0; i < count; i++) {
    await expect(rows.nth(i).locator("td").nth(2)).toHaveClass(/sorted-column/);
  }
})

test('should show ranking table with explict blitz sort', async ({ page }) => {
  // Navigate to view section
  await page.goto(BASE_URL, { waitUntil: "domcontentloaded" });
  await page.click('button[onclick="showSection(\'view\')"]');

  // Verify rankings section is visible
  const section = page.locator("#view-section");
  await expect(section).toBeVisible();

  // Change sort option to blitz
  await page.selectOption('#sort-by', 'blitz');

  // Verify table is loaded with blitz sorted column
  await page.waitForSelector("td.loading", { state: "detached", timeout: 10000 });
  await page.waitForSelector('body[data-loaded="done"]');
  await expect(section.locator("#view-message")).toContainText("Showing");
  const rows = section.locator("#rankings-body tr");
  const count = await rows.count();
  expect(count).toBeGreaterThan(0);
  await expect(section.locator("table")).toBeVisible();

  // Check that blitz column is highlighted
  for (let i = 0; i < count; i++) {
    await expect(rows.nth(i).locator("td").nth(3)).toHaveClass(/sorted-column/);
  }
})

test('should show ranking table with explict bullet sort', async ({ page }) => {
  // Navigate to view section
  await page.goto(BASE_URL, { waitUntil: "domcontentloaded" });
  await page.click('button[onclick="showSection(\'view\')"]');

  // Verify rankings section is visible
  const section = page.locator("#view-section");
  await expect(section).toBeVisible();

  // Change sort option to bullet
  await page.selectOption('#sort-by', 'bullet');

  // Verify table is loaded with blitz sorted column
  await page.waitForSelector("td.loading", { state: "detached", timeout: 10000 });
  await page.waitForSelector('body[data-loaded="done"]');
  await expect(section.locator("#view-message")).toContainText("Showing");
  const rows = section.locator("#rankings-body tr");
  const count = await rows.count();
  expect(count).toBeGreaterThan(0);
  await expect(section.locator("table")).toBeVisible();

  // Check that blitz column is highlighted
  for (let i = 0; i < count; i++) {
    await expect(rows.nth(i).locator("td").nth(4)).toHaveClass(/sorted-column/);
  }
})

test('should show refreshed data on clicking refresh button', async ({ page }) => {
  // Navigate to view section
  await page.goto(BASE_URL, { waitUntil: "domcontentloaded" });
  await page.click('button[onclick="showSection(\'view\')"]');

  // Verify rankings section is visible
  const section = page.locator("#view-section");
  await expect(section).toBeVisible();

  // Click refresh button
  await page.click('button[onclick="loadRankings()"]');

  // Verify table is reloaded
  await page.waitForSelector("td.loading", { state: "detached", timeout: 10000 });
  await expect(section.locator("#view-message")).toContainText("Showing");
});

test('should show error message on invalid sort field', async ({ page }) => {
  // Navigate to view section
  await page.goto(BASE_URL, { waitUntil: "domcontentloaded" });
  await page.click('button[onclick="showSection(\'view\')"]');

  // Verify rankings section is visible
  const section = page.locator("#view-section");
  await expect(section).toBeVisible();

  // Set invalid sort field
  await page.evaluate(() => {
    const select = document.getElementById('sort-by');
    select.appendChild(new Option("INVALID", "invalid-field"));
    select.value = 'invalid-field';
    select.dispatchEvent(new Event('change', { bubbles: true }));
  });

  // Click refresh button
  await page.click('button[onclick="loadRankings()"]');

  // Verify error message is shown
  await expect(page.locator('#view-message')).toHaveText(/Invalid sort field. Must be one of: rapid, blitz, bullet/i);
});

test('should show error message when no student data', async ({ page }) => {
  // Mock API response to simulate no student data
  await page.route("**/api/rankings**", async (route) => {
    await route.fulfill({
      status: 404,
      contentType: "application/json",
      body: JSON.stringify({ message: "No students found in the database.", rankings: [], success: false }),
    });
  });

  // Navigate to view section
  await page.goto(BASE_URL, { waitUntil: "domcontentloaded" });
  await page.click('button[onclick="showSection(\'view\')"]');

  // Verify rankings section is visible
  const section = page.locator("#view-section");
  await expect(section).toBeVisible();

  // Verify error message is shown
  await expect(page.locator('#rankings-body tr td')).toHaveText(/No students found. Create accounts to see rankings/i);
});

test('should show error message when corrupted student data is found', async ({ page }) => {
  // Mock API response to simulate corrupted student data
  await page.route("**/api/rankings**", async (route) => {
    await route.fulfill({
      status: 422,
      contentType: "application/json",
      body: JSON.stringify({ message: "Corrupted student records found.", success: false }),
    });
  });

  // Navigate to view section
  await page.goto(BASE_URL, { waitUntil: "domcontentloaded" });
  await page.click('button[onclick="showSection(\'view\')"]');

  // Verify rankings section is visible
  const section = page.locator("#view-section");
  await expect(section).toBeVisible();

  // Verify error message is shown
  await expect(page.locator('#rankings-body tr')).toHaveCount(0);
  await expect(page.locator('#view-message')).toHaveText(/Corrupted student records found/i);
});

test('should show error message on database read error', async ({ page }) => {
  // Mock API response to simulate server error
  await page.route("**/api/rankings**", async (route) => {
    await route.fulfill({
      status: 500,
      contentType: "application/json",
      body: JSON.stringify({ message: "Database file not found", rankings: [], success: false }),
    });
  });

  // Navigate to view section
  await page.goto(BASE_URL, { waitUntil: "domcontentloaded" });
  await page.click('button[onclick="showSection(\'view\')"]');

  // Verify rankings section is visible
  const section = page.locator("#view-section");
  await expect(section).toBeVisible();

  // Verify error message is shown
  await expect(page.locator('#rankings-body tr')).toHaveCount(0);
  await expect(page.locator('#view-message')).toHaveText(/Database file not found/i);
});

test('should show error message on server error', async ({ page }) => {
  // Mock API response to simulate server error
  await page.route("**/api/rankings**", async (route) => {
    await route.fulfill({
      status: 500,
      contentType: "application/json",
      body: JSON.stringify({ message: "Failed to retrieve rankings", error: "Server error", rankings: [], success: false }),
    });
  });

  // Navigate to view section
  await page.goto(BASE_URL, { waitUntil: "domcontentloaded" });
  await page.click('button[onclick="showSection(\'view\')"]');

  // Verify rankings section is visible
  const section = page.locator("#view-section");
  await expect(section).toBeVisible();

  // Verify error message is shown
  await expect(page.locator('#rankings-body tr')).toHaveCount(0);
  await expect(page.locator('#view-message')).toHaveText(/Failed to retrieve rankings/i);
});

test('should show network error when rankings API fails', async ({ page }) => {
  // Intercept the fetch() call and force a network failure
  await page.route("**/api/rankings**", async (route) => {
    await route.abort();
  });

  // Navigate to view section
  await page.goto(BASE_URL, { waitUntil: "domcontentloaded" });
  await page.click('button[onclick="showSection(\'view\')"]');

  // Verify rankings section is visible
  const section = page.locator("#view-section");
  await expect(section).toBeVisible();

  // Check for the error UI
  await expect(section.locator('td')).toContainText('Failed to load rankings. Please try again.');
  await expect(section.locator('#view-message')).toHaveText(/Failed to load rankings. Please check your connection and try again./i);
});
