import { test, expect } from '@playwright/test'

const BASE_URL = 'http://localhost:5173'

function randomUser() {
  const id = `${Date.now()}-${Math.floor(Math.random() * 100000)}`
  return {
    callsign: `T${id}`.slice(0, 20),
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
  test('register + login works (UI)', async ({ page }) => {
    const unique = `${Date.now()}-${Math.floor(Math.random() * 100000)}`

    const email = `dl1test+${unique}@mail.com`
    const callsign = `DL1${unique}`.slice(0, 20)
    const password = 'password123'

    // REGISTER
    await page.goto(`${BASE_URL}/register`)

    await page.fill('input[name="callsign"]', callsign)
    await page.fill('input[name="locator"]', 'JO45')
    await page.fill('input[name="email"]', email)
    await page.fill('input[name="password"]', password)
    await page.fill('input[placeholder="Confirm Password"]', password)

    await page.click('button[type="submit"]')

    await page.waitForURL(`${BASE_URL}/`, { timeout: 15000 })

    await expect(page.locator(`text=${callsign}`)).toBeVisible()

    // LOGOUT
    await page.click('text=Logout')
    await expect(page).toHaveURL(/login/)

    // LOGIN
    await page.fill('input[name="email"]', email)
    await page.fill('input[name="password"]', password)

    await page.click('button[type="submit"]')

    await page.waitForURL(`${BASE_URL}/`, { timeout: 15000 })

    await expect(page.locator(`text=${callsign}`)).toBeVisible()
  })

})
