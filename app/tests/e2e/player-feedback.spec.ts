import { expect, test } from '@playwright/test'
import {
  beginAttempt,
  discardAllSpoils,
  draftFullRoster,
  openSpoils,
  seedRandom,
  spoilsToRoadMode,
  takeFirstRoad
} from './helpers'

// AC: draft candidates that lift the weakest projected phase carry a pick hint
test('draft candidates show a shores-up hint for the weakest phase', async ({ page }) => {
  await seedRandom(page, 0.3)
  await page.goto('/')
  await expect(page.locator('.candidate-card').first()).toBeVisible()
  // Empty roster → any candidate of a weighted role lifts the weakest phase
  await expect(page.locator('.candidate-card__hint').first()).toBeVisible()
  await expect(page.locator('.candidate-card__hint').first()).toHaveText(/Shores up Phase/)
})

// AC: a grant that moves nobody else says so instead of staying silent
test('granting loot in an all-loner muster shows the silent-grant line', async ({ page }) => {
  await seedRandom(page, 0.3) // 0.3 ≥ 0.25 → every personality rolls Loner
  await page.goto('/')
  await draftFullRoster(page)
  await beginAttempt(page)
  await openSpoils(page)

  await page.locator('.loot-card__action--equip').first().click()
  await page.locator('.loot-option').first().click()

  await expect(page.locator('.muster-reacts__silent')).toHaveText(
    "The rest of the muster doesn't react."
  )
})

// AC: hovering a picker member predicts the grant's consequences before the click
test('picker hover shows predicted reactions', async ({ page }) => {
  await seedRandom(page, 0.3)
  await page.goto('/')
  await draftFullRoster(page)
  await beginAttempt(page)
  await openSpoils(page)

  await page.locator('.loot-card__action--equip').first().click()
  await page.locator('.loot-option').first().hover()
  // All loners → the hint explicitly says nobody reacts
  await expect(page.locator('.loot-card__hint-line--quiet')).toHaveText('Nobody else will react.')
})

// AC: every system event lands in the chronicle, reviewable at any time
test('chronicle records the attempt, the grant and the muster silence', async ({ page }) => {
  await seedRandom(page, 0.3)
  await page.goto('/')
  await draftFullRoster(page)
  await beginAttempt(page)
  await openSpoils(page)
  await page.locator('.loot-card__action--equip').first().click()
  await page.locator('.loot-option').first().click()

  await page.locator('.chronicle-drawer__toggle').click()
  const texts = page.locator('.chronicle-drawer__text')
  await expect(texts.filter({ hasText: 'Held' })).toHaveCount(3)
  await expect(texts.filter({ hasText: 'Full Victory' })).toHaveCount(1)
  await expect(texts.filter({ hasText: 'bestowed upon' })).toHaveCount(1)
  await expect(texts.filter({ hasText: "doesn't react" })).toHaveCount(1)
})

// AC: a failed phase names the role and stat it leaned on (actionable cause)
test('failed phases explain which role average let the muster down', async ({ page }) => {
  await seedRandom(page, 0.99) // the pass roll fails → learning wipe in Phase I
  await page.goto('/')
  await draftFullRoster(page)
  await beginAttempt(page)

  // Sequential pulls: the wipe ends the attempt, later phases are never seen
  const causes = page.locator('.phase-resolve-row__cause')
  await expect(causes).toHaveCount(1)
  await expect(causes.first()).toHaveText(/Leaned on .* — your .* averages \d\.\d of 5/)
  await expect(page.locator('.phase-resolve-row--unreached')).toHaveCount(2)
})

// AC: road loot distribution gets the same reacts strip and chronicle coverage
test('road clear loot shows the muster strip and logs to the chronicle', async ({ page }) => {
  await seedRandom(page, 0.3)
  await page.goto('/')
  await draftFullRoster(page)
  await beginAttempt(page)
  await openSpoils(page)
  await discardAllSpoils(page)
  await spoilsToRoadMode(page)
  await takeFirstRoad(page)

  await page.getByRole('button', { name: /Clear Wide/ }).click()
  await expect(page.locator('.camp-result')).toBeVisible()
  await expect(page.locator('.camp-result .muster-chip')).toHaveCount(8)

  await page.locator('.chronicle-drawer__toggle').click()
  await expect(
    page.locator('.chronicle-drawer__text').filter({ hasText: 'cleared wide' })
  ).toHaveCount(1)
})

// AC: road mode shows a coarse verdict unscouted; scouting reveals full forecasts
test('scouting upgrades the boss choice from coarse verdict to full forecast', async ({ page }) => {
  await seedRandom(page, 0.3)
  await page.goto('/')
  await draftFullRoster(page)
  await beginAttempt(page)
  await openSpoils(page)
  await discardAllSpoils(page)
  await spoilsToRoadMode(page)

  // Unscouted: coarse one-word verdict
  const verdicts = page.locator('.boss-candidate-card__verdict')
  await expect(verdicts.first()).toBeVisible()
  await expect(verdicts.first()).toHaveText(/^(Favorable|Even|Grim)$/)

  await page.getByRole('button', { name: /Send Outriders/ }).click()
  // Scouted: precise verdict labels and percent chances
  await expect(verdicts.first()).toHaveText(/likely/)
  await expect(page.locator('.phase-card__chance').first()).toHaveText(/%/)
})
