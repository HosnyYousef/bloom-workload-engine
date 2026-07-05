import { test, expect } from '@playwright/test';

const BASE_TASKS = [
  { _id: 'p1', text: 'Existing priority task', importance: 'high', sorted: true,  sortedCategory: 'priorities', completed: false, hours: 1, deadline: '', goal: 'Work' },
  { _id: 'u1', text: 'Unsorted parking lot task', importance: 'medium', sorted: false, sortedCategory: null, completed: false, hours: 0, deadline: '', goal: 'Personal' },
];

// A new task the POST /api/tasks endpoint will return
const NEW_TASK = {
  _id: 'new99',
  text: 'Playwright added this task',
  importance: 'medium',
  sorted: false,
  sortedCategory: null,
  completed: false,
  hours: 0,
  deadline: '',
  goal: 'Personal',
};

// ── Shared login helper ───────────────────────────────────────────────────────
const loginAsDemo = async (page, tasks = BASE_TASKS) => {
  await page.route('**/api/auth/demo', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ token: 'mock-token', user: { id: 'demo1', name: 'Demo', email: 'demo@test.com' } }),
    });
  });

  await page.route('**/api/tasks', async route => {
    if (route.request().method() === 'GET') {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(tasks) });
    } else if (route.request().method() === 'POST') {
      await route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify(NEW_TASK) });
    } else {
      await route.continue();
    }
  });

  await page.goto('/');
  await page.getByText('Try Demo').click();
  // Use role-based heading selector — 'PARKING LOT' text also appears in buttons/paragraphs elsewhere
  await expect(page.getByRole('heading', { name: 'PARKING LOT' })).toBeVisible();
};

// ── Parking Lot tests ─────────────────────────────────────────────────────────
test.describe('Parking Lot — Add Task', () => {
  test('typing in the add-row and pressing Enter creates a new task', async ({ page }) => {
    await loginAsDemo(page);

    const addInput = page.getByPlaceholder('Add task...');
    await addInput.fill('Playwright added this task');
    await addInput.press('Enter');

    await expect(page.getByText('Playwright added this task')).toBeVisible();
  });

  test('clicking the ✓ button in the add row creates a new task', async ({ page }) => {
    await loginAsDemo(page);

    const addInput = page.getByPlaceholder('Add task...');
    await addInput.fill('Playwright added this task');

    // The confirm button (✓) is the last cell of the add row
    await page.getByRole('button', { name: '✓' }).first().click();

    await expect(page.getByText('Playwright added this task')).toBeVisible();
  });

  test('empty add input does not create a task', async ({ page }) => {
    await loginAsDemo(page);

    // Wait for tasks to fully populate before counting — the mocked API is async
    await expect(page.getByText('Unsorted parking lot task')).toBeVisible();

    const rowsBefore = await page.locator('tbody tr').count();
    await page.getByRole('button', { name: '✓' }).first().click();
    const rowsAfter = await page.locator('tbody tr').count();

    expect(rowsAfter).toBe(rowsBefore);
  });

  test('existing parking lot task is visible in the table', async ({ page }) => {
    await loginAsDemo(page);
    await expect(page.getByText('Unsorted parking lot task')).toBeVisible();
  });
});

// ── Energy level filtering ────────────────────────────────────────────────────
test.describe('Energy Level Filtering', () => {
  test('switching to Slow Day makes the Slow Day button active', async ({ page }) => {
    await loginAsDemo(page);

    // Use .first() — button also exists in mobile dropdown (hidden on desktop, but in DOM)
    const slowBtn = page.getByRole('button', { name: 'Slow Day' }).first();
    await slowBtn.click();

    // The active Slow Day button has bg-blue-500 (from Navbar.jsx)
    await expect(slowBtn).toHaveClass(/bg-blue-500/);
  });

  test('switching to Early Start makes the Early Start button active', async ({ page }) => {
    await loginAsDemo(page);

    const earlyBtn = page.getByRole('button', { name: 'Early Start' }).first();
    await earlyBtn.click();

    await expect(earlyBtn).toHaveClass(/bg-gray-700/);
  });

  test('Typical Day button is active on initial load', async ({ page }) => {
    await loginAsDemo(page);

    const typicalBtn = page.getByRole('button', { name: 'Typical Day' }).first();
    await expect(typicalBtn).toHaveClass(/bg-green-500/);
  });

  test('switching energy level does not remove existing tasks from the view', async ({ page }) => {
    await loginAsDemo(page);

    // Parking Lot is unaffected by energy filter
    await expect(page.getByText('Unsorted parking lot task')).toBeVisible();
    await page.getByRole('button', { name: 'Slow Day' }).first().click();
    await expect(page.getByText('Unsorted parking lot task')).toBeVisible();
  });
});

// ── Checklist toggle ──────────────────────────────────────────────────────────
test.describe('Checklist Task Toggle', () => {
  test('clicking a checkbox in Top Priorities fires a PUT request', async ({ page }) => {
    // Track outgoing PUT requests
    const putRequests = [];
    page.on('request', req => {
      if (req.method() === 'PUT') putRequests.push(req.url());
    });

    // Mock the PUT response
    await page.route('**/api/tasks/**', async route => {
      if (route.request().method() === 'PUT') {
        const body = JSON.parse(route.request().postData() || '{}');
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ ...BASE_TASKS[0], completed: body.completed }),
        });
      } else {
        await route.continue();
      }
    });

    await loginAsDemo(page);

    const checkboxes = page.getByRole('checkbox');
    await checkboxes.first().click();

    expect(putRequests.length).toBeGreaterThan(0);
    expect(putRequests[0]).toContain('/api/tasks/');
  });
});
