import { expect, test, Page } from '@playwright/test'
import { beginAttempt, draftFullRoster, seedRandom } from './helpers'

// Seed 0.99: nobody fumbles (max fumble chance 0.24) and the pass roll always
// fails with zero mastery → every pull is a learning wipe in Phase I (−2
// morale each, all Loners). Five wipes drain a full morale bar.

async function pullAgain(page: Page, pullNumber: number): Promise<void> {
  await page.getByRole('button', { name: 'Pull Again' }).click()
  await expect(page.locator('.resolution-screen__kicker')).toHaveText(
    `The Attempt · Pull ${pullNumber}`
  )
  await expect(page.locator('.resolution-outcome--visible')).toBeVisible({ timeout: 10_000 })
}

// AC: a wipe offers a retry, and retries accumulate mastery pull over pull
test('a wipe can be pulled again and the phase mastery band advances', async ({ page }) => {
  await seedRandom(page, 0.99)
  await page.goto('/')
  await draftFullRoster(page)
  await beginAttempt(page)

  await expect(page.locator('.resolution-outcome__head')).toHaveText('The Muster Wipes')
  await expect(page.locator('.resolution-outcome__tally')).toHaveText('Wiped in Phase I — pull 1')
  await expect(page.locator('.phase-resolve-row__mastery').first()).toHaveText(
    'Learning the mechanics'
  )

  await pullAgain(page, 2)
  // The first pull taught Phase I: the roster is past mechanics discovery
  await expect(page.locator('.resolution-outcome__tally')).toHaveText('Wiped in Phase I — pull 2')
  await expect(page.locator('.phase-resolve-row__mastery').first()).toHaveText('Learning the dance')
})

// AC: wipes wear the muster down — mood dots strain, and morale 0 disbands
test('repeated wipes strain the muster and finally disband the guild', async ({ page }) => {
  await seedRandom(page, 0.99)
  await page.goto('/')
  await draftFullRoster(page)
  await beginAttempt(page)

  await pullAgain(page, 2) // morale 10 → 8 → 6: everyone strained
  await page.locator('.muster-drawer__toggle').click()
  await expect(page.locator('.muster-chip__mood--strained')).toHaveCount(8)
  await page.locator('.muster-drawer__toggle').click() // close the drawer again

  await pullAgain(page, 3)
  await pullAgain(page, 4)
  // Fifth pull: morale hits 0 → gquit → the run is over
  await page.getByRole('button', { name: 'Pull Again' }).click()
  await expect(page.locator('.resolution-outcome__head')).toHaveText('The Guild Disbands', {
    timeout: 10_000
  })
  await expect(page.locator('.resolution-outcome__sub')).toContainText('has had enough')

  await page.getByRole('button', { name: 'Muster Again' }).click()
  await expect(page.locator('.candidate-card').first()).toBeVisible()
})

// AC: retreating to camp mid-boss hides scouting and returns to the same pull
test('retreat to camp offers rest but no outriders, then returns to the boss', async ({ page }) => {
  await seedRandom(page, 0.99)
  await page.goto('/')
  await draftFullRoster(page)
  await beginAttempt(page)

  await page.getByRole('button', { name: 'Retreat to Camp' }).click()
  await expect(page.locator('.camp-header__kicker')).toHaveText('The Retreat')
  await expect(page.getByRole('button', { name: /Send Outriders/ })).toHaveCount(0)

  // Rest someone, then go back in
  await page.getByRole('button', { name: /Bind Wounds/ }).click()
  await page.locator('.loot-option').first().click()
  await expect(page.locator('.camp-result__line')).toContainText('+3 morale')
  await page.getByRole('button', { name: 'Return to the Boss' }).click()
  await expect(page.locator('.resolution-screen__kicker')).toHaveText('The Attempt · Pull 2')
})
