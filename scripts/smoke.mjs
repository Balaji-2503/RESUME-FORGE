/**
 * End-to-end smoke test.
 *
 *   npm run build && npm run preview     # in one terminal
 *   npm run smoke                        # in another
 *
 * Needs a Chromium for Playwright (`npx playwright install chromium`), or set
 * CHROMIUM_PATH to an existing browser binary.
 * Pass a different URL as the first argument if you are not on the default port.
 */
import { chromium } from 'playwright'

const URL = process.argv[2] ?? 'http://127.0.0.1:4173/'

let failures = 0
const check = (name, ok) => {
  if (!ok) failures++
  console.log(`${ok ? 'pass' : 'FAIL'}  ${name}`)
}

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })

const errors = []
page.on('pageerror', (e) => errors.push(String(e)))
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()) })

await page.goto(URL, { waitUntil: 'networkidle' })

// Edits reach the live preview.
await page.getByLabel('Full name').fill('Priya Menon')
await page.waitForTimeout(200)
check('typing updates the preview', (await page.locator('.rf-doc h1').first().innerText()).includes('Priya Menon'))

// Work survives a reload (localStorage).
await page.waitForTimeout(500)
await page.reload({ waitUntil: 'networkidle' })
check('work persists across a reload', (await page.locator('.rf-doc h1').first().innerText()).includes('Priya Menon'))

// Undo / redo.
await page.getByLabel('Full name').fill('Priya Menon Nair')
await page.waitForTimeout(150)
await page.keyboard.press('Control+z')
await page.waitForTimeout(200)
check('undo reverts an edit', (await page.locator('.rf-doc h1').first().innerText()) !== 'Priya Menon Nair')
await page.keyboard.press('Control+Shift+z')
await page.waitForTimeout(200)
check('redo restores it', (await page.locator('.rf-doc h1').first().innerText()) === 'Priya Menon Nair')

// Sections can be added.
await page.getByRole('button', { name: 'Add section' }).click()
await page.getByRole('button', { name: 'Languages', exact: true }).click()
await page.waitForTimeout(300)
check('a section can be added', await page.getByText('Languages').first().isVisible())

// Enter in a bullet opens the next one.
const bullets = page.locator('[data-bullet-field]')
check('a bullet field exists', (await bullets.count()) > 0)
await bullets.first().fill('Built a thing that mattered')
await bullets.first().press('Enter')
await page.waitForTimeout(250)
check('Enter adds the next bullet', (await page.locator('[data-bullet-field]').count()) > 1)

// Empty sections are skipped rather than printed as bare headings.
const headings = await page.locator('.rf-doc h2').allInnerTexts()
check('empty sections are not rendered', !headings.some((h) => /education|projects|languages/i.test(h)))

// Theme.
await page.getByRole('button', { name: 'Dark mode' }).click()
await page.waitForTimeout(300)
check('dark mode toggles', await page.evaluate(() => document.documentElement.classList.contains('dark')))

// Review panel scores the document.
await page.getByRole('button', { name: /Review/ }).click()
await page.waitForTimeout(400)
check('the review renders a score', /\d+/.test(await page.locator('.card span.absolute').first().innerText()))

// Export.
const [downloaded] = await Promise.all([
  page.waitForEvent('download'),
  page.getByRole('button', { name: 'Export JSON' }).click(),
])
check('exporting produces a JSON file', downloaded.suggestedFilename().endsWith('.json'))

check('no console or page errors', errors.length === 0)
if (errors.length) console.error(errors)

await browser.close()
console.log(failures ? `\n${failures} check(s) failed` : '\nAll checks passed')
process.exit(failures ? 1 : 0)
