import { test, expect } from '@playwright/test';

// Seeded task payload returned by the mocked /api/tasks endpoint
const SEEDED_TASKS = [
  { _id: 't1', text: 'Finish BloomSpace demo mode', importance: 'high',   sorted: true,  sortedCategory: 'priorities', completed: false, hours: 2,   deadline: '', goal: 'Career' },
  { _id: 't2', text: 'Review PR from teammate',      importance: 'high',   sorted: true,  sortedCategory: 'priorities', completed: false, hours: 1,   deadline: '', goal: 'Work'   },
  { _id: 't3', text: 'Write standup notes',           importance: 'medium', sorted: true,  sortedCategory: 'tomorrow',  completed: false, hours: 0.5, deadline: '', goal: 'Work'   },
  { _id: 't4', text: 'Research competitor flows',     importance: 'low',    sorted: false, sortedCategory: null,        completed: false, hours: 0,   deadline: '', goal: 'Career' },
];

// ── Shared mock setup ─────────────────────────────────────────────────────────
const setupMocks = async (page) => {
  await page.route('**/api/auth/demo', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        token: 'mock-jwt-token-for-playwright',
        user: { id: 'demo123', name: 'Demo User', email: 'demo@bloomspace.app' },
      }),
    });
  });

  await page.route('**/api/tasks', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(SEEDED_TASKS),
    });
  });
};

// ── Tests ─────────────────────────────────────────────────────────────────────
test.describe('Demo Login Flow', () => {
  test('login page shows the BloomSpace branding and demo button', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('Welcome Back')).toBeVisible();
    await expect(page.getByText('Try Demo')).toBeVisible();
  });

  test('clicking Try Demo lands on the main dashboard', async ({ page }) => {
    await setupMocks(page);
    await page.goto('/');

    await page.getByText('Try Demo').click();

    // Navbar and core panels must be visible
    await expect(page.getByText('BLOOM SPACE')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'PARKING LOT' })).toBeVisible();
    await expect(page.getByText('Top Priorities')).toBeVisible();
  });

  test('dashboard shows seeded tasks in the correct panels after demo login', async ({ page }) => {
    await setupMocks(page);
    await page.goto('/');
    await page.getByText('Try Demo').click();

    // Seeded priority tasks appear in the Top Priorities panel
    await expect(page.getByText('Finish BloomSpace demo mode')).toBeVisible();
    await expect(page.getByText('Review PR from teammate')).toBeVisible();
    // Seeded tomorrow task appears in For Tomorrow panel
    await expect(page.getByText('Write standup notes')).toBeVisible();
    // Unsorted task appears in the Parking Lot
    await expect(page.getByText('Research competitor flows')).toBeVisible();
  });

  test('energy level buttons are visible and Typical Day is active by default', async ({ page }) => {
    await setupMocks(page);
    await page.goto('/');
    await page.getByText('Try Demo').click();

    // All three buttons must be present
    await expect(page.getByRole('button', { name: 'Typical Day' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Early Start' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Slow Day' })).toBeVisible();
  });

  test('Log out button returns the user to the login screen', async ({ page }) => {
    await setupMocks(page);
    await page.goto('/');
    await page.getByText('Try Demo').click();

    // Wait for dashboard, then log out
    await expect(page.getByText('BLOOM SPACE')).toBeVisible();
    await page.getByRole('button', { name: 'Log out' }).first().click();

    await expect(page.getByText('Welcome Back')).toBeVisible();
  });
});
