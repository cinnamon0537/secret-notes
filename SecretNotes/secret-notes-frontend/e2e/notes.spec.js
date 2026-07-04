import { test, expect } from '@playwright/test'

const API = 'http://localhost:3000'

test.describe('Secret Notes E2E', () => {
  test('create and read a secret note end-to-end', async ({ page }) => {
    await page.route(`${API}/notes`, (route) => {
      route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ id: 'test-note-123' }) })
    })
    await page.route(`${API}/notes/test-note-123`, (route) => {
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ id: 'test-note-123', title: 'E2E Test Note', content: 'This is a secret E2E test message' }) })
    })

    await page.goto('/')
    await expect(page.getByText('Welcome to Secret Notes')).toBeVisible()

    await page.getByText('Create a Secret Note').click()
    await page.fill('#title', 'E2E Test Note')
    await page.fill('#content', 'This is a secret E2E test message')
    await page.fill('#passphrase', 'test123')
    await page.getByText('Create Secret Note').click()

    await expect(page.getByText('Note created securely!')).toBeVisible()
    const noteId = await page.locator('.result-box pre').textContent()

    await page.getByText('Read a Note').click()
    await page.fill('#noteId', noteId.trim())
    await page.fill('#passphrase', 'test123')
    await page.getByText('Decrypt Note').click()

    await expect(page.getByText('Note decrypted successfully!')).toBeVisible()
    await expect(page.getByText('This is a secret E2E test message')).toBeVisible()
  })

  test('shows error with wrong passphrase', async ({ page }) => {
    await page.route(`${API}/notes/fake-id-123`, (route) => {
      route.fulfill({ status: 403, contentType: 'application/json', body: JSON.stringify({ error: 'wrong decryption key' }) })
    })

    await page.goto('/read')
    await page.fill('#noteId', 'fake-id-123')
    await page.fill('#passphrase', 'wrong-passphrase')
    await page.getByText('Decrypt Note').click()
    await expect(page.locator('.alert-error')).toBeVisible()
  })

  test('navigates via the navbar links', async ({ page }) => {
    await page.goto('/')
    await page.getByText('Create Note').click()
    await expect(page.locator('h1')).toHaveText('Create a Secret Note')

    await page.getByText('Read Note').click()
    await expect(page.locator('h1')).toHaveText('Read a Secret Note')

    await page.getByText('Secret Notes').click()
    await expect(page.getByText('Welcome to Secret Notes')).toBeVisible()
  })

  test('shows the A/B theme badge on all pages', async ({ page }) => {
    await page.goto('/')
    const badge = page.locator('.theme-badge')
    await expect(badge).toBeVisible()
    const text = await badge.textContent()
    expect(text).toMatch(/Group (A|B)/)
  })
})
