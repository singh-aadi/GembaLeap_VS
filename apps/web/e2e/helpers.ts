import { expect, type Page } from '@playwright/test'

/** Signs in with a demo account. Waits for hydration so the click reaches React. */
export async function signInAs(page: Page, name: string) {
  await page
    .context()
    .addCookies([{ name: 'gl_locale', value: 'en', url: 'http://localhost:3000' }])
  await page.goto('/login')
  await page.waitForLoadState('networkidle')
  await page.getByRole('button', { name: new RegExp(name) }).click()
  await expect(page).not.toHaveURL(/\/login/, { timeout: 30_000 })
}

export async function signOut(page: Page) {
  await page.context().clearCookies()
}

export const PHOTO = new URL('./fixtures/gauge.jpg', import.meta.url).pathname

/** Navigates and waits for hydration, so the first click is handled by React. */
export async function visit(page: Page, path: string) {
  await page.goto(path)
  await page.waitForLoadState('networkidle')
}
