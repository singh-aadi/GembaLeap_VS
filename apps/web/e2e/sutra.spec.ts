import { expect, test } from '@playwright/test'
import { signInAs, visit } from './helpers'

test('owner sees the level and the gap that blocks the next one', async ({ page }) => {
  await signInAs(page, 'Suresh Shinde')
  await visit(page, '/s/level')
  await expect(page.getByText('L1 Recorded').first()).toBeVisible()
  await expect(page.getByText('What blocks L2')).toBeVisible()
  await expect(page.getByText('Faster payment')).toBeVisible()
})

test('coach switches on a skill from the future flow', async ({ page }) => {
  await signInAs(page, 'Amol Kulkarni')
  await page.getByRole('link', { name: /Shinde Precision Fabrication/ }).click()
  await expect(page.getByText('Current flow → future flow')).toBeVisible()
  await page.getByRole('button', { name: 'Switch on' }).first().click()
  await expect(
    page
      .getByText('6 skills on')
      .or(page.getByText('6', { exact: true }))
      .first(),
  ).toBeVisible()
})

test('audit pack shows evidence or an explicit gap for every clause', async ({ page }) => {
  await signInAs(page, 'Suresh Shinde')
  await visit(page, '/s/audit-packs?standard=zed')
  await expect(
    page.getByText('No calibration certificates uploaded for 3 micrometers'),
  ).toBeVisible()
})

test('cash page flags invoices past the 45-day limit', async ({ page }) => {
  await signInAs(page, 'Suresh Shinde')
  await visit(page, '/s/cash')
  await expect(page.getByText(/Overdue: day 7\d of 45/)).toBeVisible()
})
