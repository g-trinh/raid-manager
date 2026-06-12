import { expect, test, Page } from '@playwright/test'
import {
  beginAttempt,
  discardAllSpoils,
  draftFullRoster,
  goToCamp,
  openSpoils,
  seedRandom
} from './helpers'

// AC: the zoomed-up UI never overflows horizontally on the main target resolution
test.use({ viewport: { width: 1920, height: 1080 } })

async function expectNoHorizontalOverflow(page: Page): Promise<void> {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth
  )
  expect(overflow, 'horizontal overflow in px').toBeLessThanOrEqual(0)
}

test('draft screen fits 1080p without horizontal overflow', async ({ page }) => {
  await seedRandom(page, 0.3)
  await page.goto('/')
  await expect(page.locator('.candidate-card').first()).toBeVisible()
  await expectNoHorizontalOverflow(page)
})

test('spoils screen fits 1080p without horizontal overflow', async ({ page }) => {
  await seedRandom(page, 0.3)
  await page.goto('/')
  await draftFullRoster(page)
  await beginAttempt(page)
  await openSpoils(page)
  await expectNoHorizontalOverflow(page)
})

test('camp and boss choice fit 1080p without horizontal overflow', async ({ page }) => {
  await seedRandom(page, 0.3)
  await page.goto('/')
  await draftFullRoster(page)
  await beginAttempt(page)
  await openSpoils(page)
  await discardAllSpoils(page)
  await goToCamp(page)
  await expectNoHorizontalOverflow(page)

  await page.getByRole('button', { name: /Send Outriders/ }).click()
  await page.getByRole('button', { name: 'Break Camp' }).click()
  await expect(page.locator('.boss-candidate-card__verdict').first()).toBeVisible()
  await expectNoHorizontalOverflow(page)
})

// AC: the base font scale is readable — no rendered text below 10px effective
test('no text renders below 10px effective on the draft screen', async ({ page }) => {
  await seedRandom(page, 0.3)
  await page.goto('/')
  await expect(page.locator('.candidate-card').first()).toBeVisible()

  const smallest = await page.evaluate(() => {
    // CSS zoom multiplies the computed font-size at paint time
    const zoom = parseFloat(getComputedStyle(document.documentElement).zoom || '1')
    let min = Infinity
    for (const el of document.querySelectorAll('body *')) {
      if (!el.textContent?.trim() || el.children.length > 0) continue
      const size = parseFloat(getComputedStyle(el).fontSize) * zoom
      if (size < min) min = size
    }
    return min
  })
  expect(smallest, 'smallest effective font size in px').toBeGreaterThanOrEqual(10)
})
