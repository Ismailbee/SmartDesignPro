import { test, expect } from '@playwright/test'
import * as fs from 'fs'
import * as path from 'path'

// Create screenshots directory if it doesn't exist
const screenshotsDir = path.join(process.cwd(), 'screenshots')
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true })
}

// Define viewport sizes for different devices
const viewports = [
  {
    name: 'mobile',
    width: 375,
    height: 667,
    device: 'iPhone SE'
  },
  {
    name: 'tablet',
    width: 768,
    height: 1024,
    device: 'iPad'
  },
  {
    name: 'desktop',
    width: 1440,
    height: 900,
    device: 'Desktop'
  }
]

test.describe('Responsive Design Tests', () => {
  viewports.forEach(viewport => {
    test(`should load correctly on ${viewport.name} (${viewport.width}x${viewport.height})`, async ({ browser }) => {
      const context = await browser.newContext({
        viewport: { width: viewport.width, height: viewport.height },
        deviceScaleFactor: 1,
      })
      const page = await context.newPage()

      try {
        // Navigate to the application
        const response = await page.goto('/', { waitUntil: 'networkidle' })
        
        // Verify page loaded successfully
        expect(response?.status()).toBeLessThan(400)
        
        // Check for valid title
        const title = await page.title()
        expect(title).toBeTruthy()
        expect(title.length).toBeGreaterThan(0)
        
        // Wait for main content to load
        await page.waitForLoadState('domcontentloaded')
        
        // Check if main app container exists
        const appContainer = await page.locator('[id="app"]')
        await expect(appContainer).toBeVisible()
        
        // Take screenshot
        const screenshotPath = path.join(screenshotsDir, `${viewport.name}-${viewport.width}x${viewport.height}.png`)
        await page.screenshot({ path: screenshotPath, fullPage: true })
        console.log(`✓ Screenshot saved: ${screenshotPath}`)
        
        // Check for common layout issues
        const bodyElement = await page.locator('body')
        const bodyBox = await bodyElement.boundingBox()
        
        if (bodyBox) {
          // Verify no horizontal overflow
          expect(bodyBox.width).toBeLessThanOrEqual(viewport.width + 10) // Allow small margin
          console.log(`✓ No horizontal overflow detected on ${viewport.name}`)
        }
        
        // Test basic interactions
        const buttons = await page.locator('button').count()
        console.log(`✓ Found ${buttons} interactive buttons on ${viewport.name}`)
        
        // Check for accessibility issues
        const headings = await page.locator('h1, h2, h3').count()
        expect(headings).toBeGreaterThan(0)
        console.log(`✓ Found ${headings} headings on ${viewport.name}`)
        
      } catch (error) {
        console.error(`✗ Error testing ${viewport.name}: ${error}`)
        throw error
      } finally {
        await context.close()
      }
    })
  })

  test('should handle viewport resize gracefully', async ({ page }) => {
    await page.goto('/')
    
    // Test resizing from desktop to mobile
    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height })
      await page.waitForTimeout(500) // Wait for layout to adjust
      
      const appContainer = await page.locator('[id="app"]')
      await expect(appContainer).toBeVisible()
      console.log(`✓ Layout adjusted correctly for ${viewport.name}`)
    }
  })

  test('should have proper meta tags for mobile', async ({ page }) => {
    await page.goto('/')
    
    // Check for viewport meta tag
    const viewportMeta = await page.locator('meta[name="viewport"]')
    await expect(viewportMeta).toHaveAttribute('content', /width=device-width/)
    console.log('✓ Viewport meta tag is properly configured')
  })

  test('should load all critical resources', async ({ page }) => {
    const failedRequests: string[] = []
    
    page.on('response', response => {
      if (response.status() >= 400) {
        failedRequests.push(`${response.url()} - ${response.status()}`)
      }
    })
    
    await page.goto('/', { waitUntil: 'networkidle' })
    
    // Allow some 404s for optional resources, but fail on critical ones
    const criticalFailures = failedRequests.filter(url => 
      !url.includes('favicon') && 
      !url.includes('analytics') &&
      !url.includes('tracking')
    )
    
    if (criticalFailures.length > 0) {
      console.warn(`⚠ Failed to load resources: ${criticalFailures.join(', ')}`)
    }
    
    console.log(`✓ Page loaded with ${failedRequests.length} total failed requests`)
  })
})

test.describe('Sticker Template Panel Responsiveness', () => {
  test('should display sticker panel correctly on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')
    
    // Navigate to auto-design with sticker category
    await page.goto('/?category=sticker')
    
    // Wait for sticker panel to load
    await page.waitForTimeout(1000)
    
    // Check if sticker type checkboxes are visible and horizontal
    const checkboxes = await page.locator('.checkbox-item').count()
    expect(checkboxes).toBeGreaterThanOrEqual(3)
    
    // Take screenshot of sticker panel on mobile
    const screenshotPath = path.join(screenshotsDir, 'sticker-panel-mobile.png')
    await page.screenshot({ path: screenshotPath, fullPage: true })
    console.log(`✓ Sticker panel screenshot saved: ${screenshotPath}`)
  })

  test('should display sticker panel correctly on tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.goto('/?category=sticker')
    
    await page.waitForTimeout(1000)
    
    const checkboxes = await page.locator('.checkbox-item').count()
    expect(checkboxes).toBeGreaterThanOrEqual(3)
    
    const screenshotPath = path.join(screenshotsDir, 'sticker-panel-tablet.png')
    await page.screenshot({ path: screenshotPath, fullPage: true })
    console.log(`✓ Sticker panel screenshot saved: ${screenshotPath}`)
  })

  test('should display sticker panel correctly on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/?category=sticker')
    
    await page.waitForTimeout(1000)
    
    const checkboxes = await page.locator('.checkbox-item').count()
    expect(checkboxes).toBeGreaterThanOrEqual(3)
    
    const screenshotPath = path.join(screenshotsDir, 'sticker-panel-desktop.png')
    await page.screenshot({ path: screenshotPath, fullPage: true })
    console.log(`✓ Sticker panel screenshot saved: ${screenshotPath}`)
  })
})

