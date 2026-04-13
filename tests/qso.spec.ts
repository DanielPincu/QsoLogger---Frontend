import { test, expect } from '@playwright/test'
import type { Page } from '@playwright/test'

type TestUser = {
  callsign: string
  email: string
  password: string
  locator: string
}

const BASE_URL = 'http://localhost:5173'

function randomUser(prefix: string): TestUser {
  const id = `${Date.now()}-${Math.floor(Math.random() * 100000)}`
  return {
    callsign: `${prefix}${id}`.slice(0, 20),
    email: `${prefix}${id}@mail.com`,
    password: 'RunTimeError123!',
    locator: prefix === 'A' ? 'JO45' : 'CN87',
  }
}

function normalizeNow() {
  const d = new Date()
  d.setSeconds(0, 0)
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16)
}

async function register(page: Page, user: TestUser) {
  await page.goto(`${BASE_URL}/register`)
  await page.fill('input[name="callsign"]', user.callsign)
  await page.fill('input[name="locator"]', user.locator)
  await page.fill('input[name="email"]', user.email)
  await page.fill('input[name="password"]', user.password)
  await page.fill('input[placeholder="Confirm Password"]', user.password)
  await page.click('button[type="submit"]')
  await page.waitForURL(`${BASE_URL}/`)
}

async function createQso(page: Page, remoteCallsign: string, date: string) {
  await page.fill('input[name="remoteCallsign"]', remoteCallsign.trim().toUpperCase())
  await page.selectOption('select[name="band"]', '40m')
  await page.selectOption('select[name="mode"]', 'SSB')
  await page.selectOption('select[name="rstSent"]', '59')
  await page.selectOption('select[name="rstReceived"]', '59')
  await page.fill('input[name="qsoDate"]', date)
  await page.click('button[type="submit"]')
}

test('QSO gets confirmed when both users log matching entries', async ({ browser }) => {
  const userA = randomUser('A')
  const userB = randomUser('B')

  const contextA = await browser.newContext()
  const contextB = await browser.newContext()

  const pageA = await contextA.newPage()
  const pageB = await contextB.newPage()

  const timestamp = normalizeNow()

  // REGISTER USERS
  await register(pageA, userA)
  await register(pageB, userB)

  // USER A CREATES QSO
  await createQso(pageA, userB.callsign, timestamp)

  // Verify appears as NOT confirmed
  await expect(pageA.locator(`text=${userB.callsign}`)).toBeVisible()
  await expect(
    pageA.getByTestId('qso-status').filter({ hasText: 'Not confirmed' })
  ).toBeVisible()

  // USER B CREATES MATCHING QSO
  await createQso(pageB, userA.callsign, timestamp)

  // allow backend to process matching
  await pageB.waitForTimeout(1500)

  // VERIFY CONFIRMATION (poll until confirmed)
  await expect(async () => {
    await pageA.reload()
    await pageB.reload()

    // small delay after reload to let UI render updated state
    await pageA.waitForTimeout(500)

    const confirmedCount = await pageA
      .getByTestId('qso-status')
      .filter({ hasText: 'Confirmed' })
      .count()

    expect(confirmedCount).toBeGreaterThan(0)
  }).toPass({ timeout: 15000 })
})