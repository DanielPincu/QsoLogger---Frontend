import { test, expect } from '@playwright/test'

const BASE_URL = 'http://localhost:5173'

function randomUser(prefix: string) {
  const id = `${Date.now()}-${Math.floor(Math.random() * 100000)}`
  return {
    callsign: `${prefix}${id}`.slice(0, 20),
    email: `${prefix}${id}@mail.com`,
    password: 'RunTimeError123!',
    locator: prefix === 'A' ? 'JO45' : 'CN87', // Europe vs USA for realism
  }
}

test('2 users create QSO and it becomes confirmed', async ({ browser }) => {
  const userA = randomUser('A')
  const userB = randomUser('B')

  // Create 2 separate browser contexts (2 users)
  const contextA = await browser.newContext()
  const contextB = await browser.newContext()

  const pageA = await contextA.newPage()
  const pageB = await contextB.newPage()

 
  // USER A REGISTER
  
  await pageA.goto(`${BASE_URL}/register`)
  await pageA.fill('input[name="callsign"]', userA.callsign)
  await pageA.fill('input[name="locator"]', userA.locator)
  await pageA.fill('input[name="email"]', userA.email)
  await pageA.fill('input[name="password"]', userA.password)
  await pageA.fill('input[placeholder="Confirm Password"]', userA.password)
  await pageA.click('button[type="submit"]')
  await pageA.waitForURL(`${BASE_URL}/`, { timeout: 15000 })

 
  // USER B REGISTER
  
  await pageB.goto(`${BASE_URL}/register`)
  await pageB.fill('input[name="callsign"]', userB.callsign)
  await pageB.fill('input[name="locator"]', userB.locator)
  await pageB.fill('input[name="email"]', userB.email)
  await pageB.fill('input[name="password"]', userB.password)
  await pageB.fill('input[placeholder="Confirm Password"]', userB.password)
  await pageB.click('button[type="submit"]')
  await pageB.waitForURL(`${BASE_URL}/`, { timeout: 15000 })

  
  // USER A CREATES QSO
  
  await pageA.fill('input[name="remoteCallsign"]', userB.callsign)
  await pageA.selectOption('select[name="band"]', '40m')
  await pageA.selectOption('select[name="mode"]', 'SSB')
  await pageA.selectOption('select[name="rstSent"]', '59')
  await pageA.selectOption('select[name="rstReceived"]', '59')

  const now = new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16)

  await pageA.fill('input[name="qsoDate"]', now)

  await pageA.click('button[type="submit"]')

  // should appear as NOT confirmed initially
  await expect(
    pageA.getByTestId('qso-status').filter({ hasText: 'Not confirmed' })
  ).toBeVisible()

  
  // USER B CREATES MATCHING QSO
  
  await pageB.fill('input[name="remoteCallsign"]', userA.callsign)
  await pageB.selectOption('select[name="band"]', '40m')
  await pageB.selectOption('select[name="mode"]', 'SSB')
  await pageB.selectOption('select[name="rstSent"]', '59')
  await pageB.selectOption('select[name="rstReceived"]', '59')
  await pageB.fill('input[name="qsoDate"]', now)

  await pageB.click('button[type="submit"]')

 
  // VERIFY CONFIRMATION
  
  // reload user A page to get updated data
  await pageA.reload()

  await expect(
    pageA.getByTestId('qso-status').filter({ hasText: 'Confirmed' })
  ).toBeVisible()
})