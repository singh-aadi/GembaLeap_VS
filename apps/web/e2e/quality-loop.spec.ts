import { expect, test } from '@playwright/test'
import { PHOTO, signInAs, signOut, visit } from './helpers'

// One shared in-memory store: these steps build on each other, so they run in order.
test.describe.configure({ mode: 'serial' })

test('line lead records a check with photo evidence', async ({ page }) => {
  await signInAs(page, 'Nguyen Thi Lan')
  await visit(page, '/s/checklist')
  const row = page
    .getByRole('listitem')
    .filter({ hasText: 'Packing photo with lot label visible' })
    .filter({ hasText: '11:00' })
  await row.getByRole('button', { name: 'Record' }).click()
  const sheet = page.getByRole('dialog')
  await expect(sheet.getByRole('button', { name: 'Save check' })).toBeDisabled()
  await sheet.locator('input[type=file]').setInputFiles(PHOTO)
  await sheet.getByRole('button', { name: 'Save check' }).click()
  await expect(page.getByText('Check saved')).toBeVisible()
  await expect(row).toContainText('Done')
})

test('out-of-limit reading cannot be saved without containment', async ({ page }) => {
  await signInAs(page, 'Nguyen Thi Lan')
  await visit(page, '/s/checklist')
  const row = page
    .getByRole('listitem')
    .filter({ hasText: 'Hole pitch on first-off part' })
    .filter({ hasText: '12:00' })
  await row.getByRole('button', { name: 'Record' }).click()
  const sheet = page.getByRole('dialog')
  await sheet.getByLabel('Reading (mm)').fill('48.15')
  await sheet.locator('input[type=file]').setInputFiles(PHOTO)
  await expect(sheet.getByText('Out of limit')).toBeVisible()
  await expect(sheet.getByRole('button', { name: 'Save check' })).toBeDisabled()
  await sheet.getByLabel('Containment (required)').fill('Line stopped, 30 parts to red bin Q-07.')
  await sheet.getByRole('button', { name: 'Save check' }).click()
  await expect(page.getByText('Saved as out of limit, with containment')).toBeVisible()
})

test('line lead confirms a drafted event in one tap', async ({ page }) => {
  await signInAs(page, 'Nguyen Thi Lan')
  await visit(page, '/s/events?status=draft&sort=time')
  await page
    .getByRole('link', { name: /Thử bóc mối hàn/ })
    .first()
    .click()
  await page.getByRole('button', { name: 'Confirm' }).click()
  await expect(page.getByText(/chained in audit log as entry #\d+/)).toBeVisible()
})

test('owner publishes the weekly report and the buyer verifies its seal', async ({ page }) => {
  await signInAs(page, 'Haruka Sato')
  await visit(page, '/s/reports')
  await page
    .getByRole('link', { name: /Weekly/ })
    .first()
    .click()
  await page.getByRole('button', { name: 'Approve and publish' }).click()
  await expect(page.getByText('Report sealed and published')).toBeVisible()

  await signOut(page)
  await signInAs(page, 'Arjun Mehta')
  await visit(page, '/b/reports')
  await page
    .getByRole('link', { name: /Weekly/ })
    .first()
    .click()
  await page.getByRole('button', { name: 'Verify' }).click()
  await expect(page.getByText('Match')).toBeVisible()
  await expect(page.getByText('Intact')).toBeVisible()
  await expect(page.getByText('Found')).toBeVisible()
})

test('a heat-number mismatch fails the passport until fixed, then it seals', async ({ page }) => {
  await signInAs(page, 'Meena Pillai')
  await visit(page, '/s/lots')
  await page.getByRole('link', { name: 'SCV-2410-118' }).first().click()
  await expect(
    page.getByText('Certificate heat H24-0917 does not match line capture H24-0971.'),
  ).toBeVisible()
  await page.getByLabel('Heat number on the corrected certificate').fill('H24-0971')
  await page.locator('input[type=file]').setInputFiles(PHOTO)
  await page.getByRole('button', { name: 'Re-check' }).click()
  await expect(page.getByText('Heat number matches. The passport is ready to seal.')).toBeVisible()
  await page.getByRole('button', { name: 'Seal passport' }).click()
  await expect(page.getByText('Passport sealed')).toBeVisible()
  await expect(page.getByText('SHA-256')).toBeVisible()
})

test('heat-map filters live in the URL', async ({ page }) => {
  await signInAs(page, 'Arjun Mehta')
  await visit(page, '/b/suppliers')
  await page.getByLabel('Trend', { exact: true }).selectOption('drifting')
  await expect(page).toHaveURL(/drift=drifting/)
  await page.reload()
  await page.waitForLoadState('networkidle')
  await expect(
    page.getByText('2 suppliers share evidence with Kestrel Fluid Systems'),
  ).toBeVisible()
})

test('revoking consent removes buyer access at once', async ({ page }) => {
  await signInAs(page, 'Arjun Mehta')
  await visit(page, '/b/suppliers?sort=name&view=table')
  const sato = page.getByRole('link', { name: 'Sato Press Works' }).first()
  const href = await sato.getAttribute('href')

  await signOut(page)
  await signInAs(page, 'Haruka Sato')
  await visit(page, '/s/sharing')
  await page.getByRole('button', { name: 'Revoke' }).first().click()
  await page.getByRole('dialog').getByRole('button', { name: 'Revoke access' }).click()
  await expect(page.getByText('Revoked', { exact: true })).toBeVisible()

  await signOut(page)
  await signInAs(page, 'Arjun Mehta')
  await visit(page, '/b/suppliers')
  await expect(page.getByRole('link', { name: 'Sato Press Works' })).toHaveCount(0)
  await visit(page, href ?? '/b/suppliers')
  await expect(page.getByRole('alert')).toContainText('has not shared this with you')
})
