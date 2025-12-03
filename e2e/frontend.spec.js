import { test, expect } from '@playwright/test';
import './playwright-coverage.js'

const BASE_URL = 'http://localhost:5000';

test.use({
  launchOptions: {
    slowMo: 100
  },
});

test.beforeEach(async ({ page }) => {
  page.on("pageerror", err => console.log("PAGE ERROR:", err.message));
});

const navigateToViewTab = async ({ page }) => {
  // Navigate to view section
  await page.goto(BASE_URL, { waitUntil: "networkidle" });
  await page.click('button[onclick="showSection(\'view\')"]');

  // Verify rankings section is visible
  const section = page.locator("#view-section");
  await expect(section).toBeVisible();

  return section;
};

const simulateApiError = async ({ page, status = 200, message = "", error = "" }) => {
  await page.route("**/api/rankings**", async (route) => {
    await route.fulfill({
      status,
      contentType: "application/json",
      body: JSON.stringify({ message, error, rankings: [], success: false }),
    });
  });
};

test('should load page', async ({ page }) => {
  await page.goto(BASE_URL, { waitUntil: "networkidle" });
  await expect(page).toHaveTitle(/Chess Club Ranking System/);
});

test('should navigation to view ranking tab', async ({ page }) => {
  const section = await navigateToViewTab({ page });
  await expect(section).toContainText('Chess Rankings');
  await expect(section.locator('table')).toBeVisible();
});

test("should show rankings table with default sort after successful load", async ({ page }) => {
  const section = await navigateToViewTab({ page });

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
});

test('should show ranking table with explicit rapid sort', async ({ page }) => {
  const section = await navigateToViewTab({ page });

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

test('should show ranking table with explicit blitz sort', async ({ page }) => {
  const section = await navigateToViewTab({ page });

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

test('should show ranking table with explicit bullet sort', async ({ page }) => {
  const section = await navigateToViewTab({ page });

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
  const section = await navigateToViewTab({ page });

  // Click refresh button
  await page.click('button[onclick="loadRankings()"]');

  // Verify table is reloaded
  await page.waitForSelector("td.loading", { state: "detached", timeout: 10000 });
  await expect(section.locator("#view-message")).toContainText("Showing");
});

test('should show error message on invalid sort field', async ({ page }) => {
  await navigateToViewTab({ page });

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
  await simulateApiError({ page, status: 404, message: "No students found in the database." });
  await navigateToViewTab({ page });

  // Verify error message is shown
  await expect(page.locator('#rankings-body tr td')).toHaveText(/No students found. Create accounts to see rankings/i);
});

test('should show error message when corrupted student data is found', async ({ page }) => {
  // Mock API response to simulate corrupted student data
  await simulateApiError({ page, status: 422, message: "Corrupted student records found." });
  await navigateToViewTab({ page });

  // Verify error message is shown
  await expect(page.locator('#rankings-body tr')).toHaveCount(0);
  await expect(page.locator('#view-message')).toHaveText(/Corrupted student records found/i);
});

test('should show error message on database read error', async ({ page }) => {
  // Mock API response to simulate server error
  await simulateApiError({ page, status: 500, message: "Database file not found" });
  await navigateToViewTab({ page });

  // Verify error message is shown
  await expect(page.locator('#rankings-body tr')).toHaveCount(0);
  await expect(page.locator('#view-message')).toHaveText(/Database file not found/i);
});

test('should show error message on server error', async ({ page }) => {
  // Mock API response to simulate server error
  await simulateApiError({ page, status: 500, message: "Failed to retrieve rankings", error: "Server error" });
  await navigateToViewTab({ page });

  // Verify error message is shown
  await expect(page.locator('#rankings-body tr')).toHaveCount(0);
  await expect(page.locator('#view-message')).toHaveText(/Failed to retrieve rankings/i);
});

test('should show network error when rankings API fails', async ({ page }) => {
  // Intercept the fetch() call and force a network failure
  await page.route("**/api/rankings**", async (route) => {
    await route.abort();
  });

  const section = await navigateToViewTab({ page });

  // Check for the error UI
  await expect(section.locator('td')).toContainText('Failed to load rankings. Please try again.');
  await expect(section.locator('#view-message')).toHaveText(/Failed to load rankings. Please check your connection and try again./i);
});

test("should format dates correctly", async ({ page }) => {
  const section = await navigateToViewTab({ page });
  await page.waitForSelector("td.loading", { state: "detached" });

  const dateCell = section.locator("#rankings-body tr td:last-child").first();
  const dateText = await dateCell.textContent();

  expect(dateText).toMatch(/^\d{1,2} [A-Z][a-z]{2} \d{4}$/);
});

test("should display rankings table with correct headers", async ({ page }) => {
  const section = await navigateToViewTab({ page });

  const headers = section.locator("table thead th");
  await expect(headers.nth(0)).toHaveText("#");
  await expect(headers.nth(1)).toHaveText("Student ID");
  await expect(headers.nth(2)).toHaveText("Rapid");
  await expect(headers.nth(3)).toHaveText("Blitz");
  await expect(headers.nth(4)).toHaveText("Bullet");
  await expect(headers.nth(5)).toHaveText("Joined");
});

test("should display sort dropdown with all options", async ({ page }) => {
  await navigateToViewTab({ page });

  const select = page.locator("#sort-by");

  await expect(select).toHaveValue("rapid");

  const options = await select.locator("option").allTextContents();
  expect(options).toContain("Sort by Rapid");
  expect(options).toContain("Sort by Blitz");
  expect(options).toContain("Sort by Bullet");
});

test("should display rank numbers in first column", async ({ page }) => {
  const section = await navigateToViewTab({ page });

  await page.waitForSelector("td.loading", { state: "detached" });

  const rows = section.locator("#rankings-body tr");
  const count = await rows.count();

  for (let i = 0; i < count; i++) {
    await expect(rows.nth(i).locator("td").first()).toHaveText(String(i + 1));
  }
});

test("should display success message with student count", async ({ page }) => {
  const section = await navigateToViewTab({ page });

  await page.waitForSelector("body[data-loaded='done']");

  const rows = await section.locator("#rankings-body tr").count();
  await expect(section.locator("#view-message")).toContainText(`Showing ${rows} student(s) sorted by RAPID rating`);
});

test("should auto-hide success message after 5 seconds", async ({ page }) => {
  const section = await navigateToViewTab({ page });

  await page.waitForSelector("body[data-loaded='done']");
  await expect(section.locator("#view-message")).toBeVisible();

  await page.waitForTimeout(5200);
  await expect(section.locator("#view-message")).toHaveCSS("display", "none");
});
