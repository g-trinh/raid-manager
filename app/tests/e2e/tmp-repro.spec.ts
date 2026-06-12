import { expect, test } from '@playwright/test'
import { beginAttempt, draftFullRoster, openSpoils, seedRandom } from './helpers'

test('repro: continue after distributing all spoils', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 })
  await seedRandom(page, 0.3)
  await page.goto('/')
  await draftFullRoster(page)
  await beginAttempt(page)
  await openSpoils(page)

  // Distribute every dropped item to the first eligible member
  const equip = page.locator('.loot-card__action--equip')
  while ((await equip.count()) > 0) {
    await equip.first().click()
    await page.locator('.loot-option').first().click()
  }

  const metrics = await page.evaluate(() => {
    const pick = (sel: string): Record<string, number | string> | null => {
      const el = document.querySelector(sel)
      if (!el) return null
      const cs = getComputedStyle(el)
      return {
        sel,
        client: el.clientHeight,
        scroll: el.scrollHeight,
        display: cs.display,
        flex: cs.flex,
        minHeight: cs.minHeight,
        overflowY: cs.overflowY
      }
    }
    return {
      innerHeight: window.innerHeight,
      docScroll: document.documentElement.scrollHeight,
      bodyScroll: document.body.scrollHeight,
      root: pick('#root'),
      screen: pick('.spoils-screen'),
      body: pick('.spoils-screen__body'),
      footer: pick('.spoils-screen__footer')
    }
  })
  console.log(JSON.stringify(metrics, null, 1))
})
