import { Page, expect } from '@playwright/test'

// The whole game runs on Math.random. Pinning it before the bundle loads makes a
// run fully deterministic: 0.3 → every personality rolls Loner and every phase
// roll succeeds against the usual >30% chances; 0.99 → every phase roll fails.
export async function seedRandom(page: Page, value: number): Promise<void> {
  await page.addInitScript((v) => {
    Math.random = () => v
  }, value)
}

export async function draftFullRoster(page: Page): Promise<void> {
  await expect(page.locator('.candidate-card').first()).toBeVisible()
  for (let i = 0; i < 8; i++) {
    await page.locator('.candidate-card').first().click()
  }
}

// Draft → war table (the hub; combat starts only here)
export async function musterToTable(page: Page): Promise<void> {
  await page.getByRole('button', { name: /Begin/ }).click()
  await expect(page.locator('.war-table')).toBeVisible()
}

// War table → one pull, revealed
export async function pullBoss(page: Page): Promise<void> {
  await page.getByRole('button', { name: /^Pull — Attempt/ }).click()
  // Phase reveal animation: 700ms + 3×1050ms + outcome delay
  await expect(page.locator('.resolution-outcome--visible')).toBeVisible({ timeout: 10_000 })
}

export async function beginAttempt(page: Page): Promise<void> {
  await musterToTable(page)
  await pullBoss(page)
}

// Victory outcome → war table in road mode
export async function spoilsToRoadMode(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'To the War Table' }).click()
  await expect(page.locator('.war-table--road')).toBeVisible()
}

export async function openSpoils(page: Page): Promise<void> {
  await page.getByRole('button', { name: /Spoils/ }).click()
  await expect(page.locator('.spoils-screen')).toBeVisible()
}

export async function discardAllSpoils(page: Page): Promise<void> {
  const discard = page.locator('.loot-card__action--discard')
  while ((await discard.count()) > 0) {
    await discard.first().click()
  }
}

// Road mode → pick the first candidate → the road encounter
export async function takeFirstRoad(page: Page): Promise<void> {
  await page.locator('.boss-candidate-card__pick').first().click()
  await expect(page.locator('.road-screen')).toBeVisible()
}
