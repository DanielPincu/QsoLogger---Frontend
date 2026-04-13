import { test, expect } from '@playwright/test'

const BASE_URL = 'http://localhost:5173'

function randomUser() {
  const id = `${Date.now()}-${Math.floor(Math.random() * 100000)}`
  return {
    callsign: `TEST${id}`,
    email: `test${id}@mail.com`,
    password: 'RunTimeError123!',
    locator: 'JO42',
  }
}

test.describe('Auth flow', () => {
  test('user can register with random operator', async ({ page }) => {
    const user = randomUser()

    await page.goto(`${BASE_URL}/register`)

    await page.fill('input[name="callsign"]', user.callsign)
    await page.fill('input[name="locator"]', user.locator)
    await page.fill('input[name="email"]', user.email)
    await page.fill('input[name="password"]', user.password)
    await page.fill('input[placeholder="Confirm Password"]', user.password)

    await page.click('button[type="submit"]')

    // wait for either redirect or error
    try {
      await page.waitForURL(`${BASE_URL}/`, { timeout: 15000 })
    } catch {
      const errorText = await page.locator('text=').allTextContents().catch(() => [])
      throw new Error(`Register failed in CI. Errors: ${errorText.join(' | ')}`)
    }

    await expect(page.locator(`text=${user.callsign}`)).toBeVisible()
  })

  test('redirects to login if not authenticated', async ({ page }) => {
    await page.goto(`${BASE_URL}/`)
    await expect(page).toHaveURL(/login/)
  })
})
