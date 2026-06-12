import { expect, test, Page } from '@playwright/test'
import {
  beginAttempt,
  discardAllSpoils,
  draftFullRoster,
  openSpoils,
  seedRandom,
  spoilsToRoadMode,
  takeFirstRoad
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

test('war table and road fit 1080p without horizontal overflow', async ({ page }) => {
  await seedRandom(page, 0.3)
  await page.goto('/')
  await draftFullRoster(page)
  await page.getByRole('button', { name: /Begin/ }).click()
  await expect(page.locator('.war-table')).toBeVisible()
  await expectNoHorizontalOverflow(page)

  await beginAttemptFromTable(page)
  await openSpoils(page)
  await discardAllSpoils(page)
  await spoilsToRoadMode(page)
  await expect(page.locator('.boss-candidate-card__verdict').first()).toBeVisible()
  await expectNoHorizontalOverflow(page)

  await takeFirstRoad(page)
  await expectNoHorizontalOverflow(page)
})

async function beginAttemptFromTable(page: Page): Promise<void> {
  await page.getByRole('button', { name: /^Pull — Attempt/ }).click()
  await expect(page.locator('.resolution-outcome--visible')).toBeVisible({ timeout: 10_000 })
}

// AC: the wipe outcome (head, sub and both actions) fits short windows
test('wipe outcome actions stay on screen at 800px window height', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 })
  await seedRandom(page, 0.99) // learning wipe in Phase I
  await page.goto('/')
  await draftFullRoster(page)
  await beginAttempt(page)

  const toTable = page.getByRole('button', { name: 'To the War Table' })
  await expect(toTable).toBeVisible()
  const box = await toTable.boundingBox()
  expect(box, 'war table button bounding box').not.toBeNull()
  expect(box!.y + box!.height, 'war table button bottom edge').toBeLessThanOrEqual(800)
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
