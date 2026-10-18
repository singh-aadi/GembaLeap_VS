import { expect, test } from '@playwright/test'
import { signInAs, visit } from './helpers'

test('line lead gets bottom tabs and no sideways scroll', async ({ page }) => {
  await signInAs(page, 'Nguyen Thi Lan')
  const tabs = page.getByRole('navigation', { name: 'Main' }).last()
  await expect(tabs.getByRole('link')).toHaveCount(5)
  for (const path of ['/s/home', '/s/checklist', '/s/capture', '/s/events', '/s/shift-brief']) {
    await visit(page, path)
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    )
    expect(overflow, path).toBeLessThanOrEqual(0)
  }
})

test('procurement sees suppliers but not NCR rooms', async ({ page }) => {
  await signInAs(page, 'Kaori Yamamoto')
  await visit(page, '/b/ncr')
  await expect(page).toHaveURL(/\/b\/suppliers/)
})
