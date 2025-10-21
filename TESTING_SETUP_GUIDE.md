# SmartDesignPro - Testing Setup Guide

## 🎯 Overview

This guide covers the complete setup of **Playwright** and **Lighthouse** as testing tools for SmartDesignPro. These tools enable comprehensive testing of:

- **Responsiveness** across multiple devices (mobile, tablet, desktop)
- **Functionality** and user interactions
- **Performance** metrics and optimization
- **Accessibility** compliance
- **SEO** best practices

---

## ✅ Installation Status

### Installed Packages
- ✅ `@playwright/test` - ^1.56.0 (already installed)
- ✅ `lighthouse` - Latest (just installed)

### Configuration Files Created
- ✅ `.augment/tools.json` - MCP tools configuration
- ✅ `playwright.config.ts` - Playwright test configuration
- ✅ `tests/e2e/responsive.spec.ts` - Responsive design tests
- ✅ `scripts/run-lighthouse.js` - Lighthouse audit script
- ✅ `scripts/run-all-tests.js` - Combined test runner
- ✅ `package.json` - Updated with new test scripts

---

## 🚀 Quick Start

### 1. Run All Tests (Recommended)
```bash
npm run test:all
```
This runs both Playwright and Lighthouse tests sequentially and generates a combined report.

### 2. Run Only Playwright Tests
```bash
npm run test:e2e
```
Tests responsiveness across mobile, tablet, and desktop viewports.

### 3. Run Playwright Tests with UI
```bash
npm run test:e2e:ui
```
Interactive test runner with visual feedback.

### 4. Run Only Lighthouse Audit
```bash
npm run test:lighthouse
```
Audits performance, accessibility, best practices, and SEO.

---

## 📊 Test Coverage

### Playwright Tests (tests/e2e/responsive.spec.ts)

#### Viewport Sizes Tested
- **Mobile**: 375×667 (iPhone SE)
- **Tablet**: 768×1024 (iPad)
- **Desktop**: 1440×900 (Standard Desktop)

#### Test Scenarios
1. ✅ Page loads correctly on each viewport
2. ✅ Valid page title exists
3. ✅ Main app container is visible
4. ✅ No horizontal overflow
5. ✅ Interactive elements are present
6. ✅ Proper heading structure
7. ✅ Viewport resize handling
8. ✅ Mobile meta tags
9. ✅ Critical resources load
10. ✅ Sticker Template Panel responsiveness

#### Screenshots Generated
- `mobile-375x667.png` - Mobile view
- `tablet-768x1024.png` - Tablet view
- `desktop-1440x900.png` - Desktop view
- `sticker-panel-mobile.png` - Sticker panel on mobile
- `sticker-panel-tablet.png` - Sticker panel on tablet
- `sticker-panel-desktop.png` - Sticker panel on desktop

### Lighthouse Audit

#### Categories Audited
- **Performance** - Load time, rendering, optimization
- **Accessibility** - WCAG compliance, screen reader support
- **Best Practices** - Security, standards compliance
- **SEO** - Meta tags, structured data, mobile-friendliness

#### Key Metrics
- Largest Contentful Paint (LCP)
- Cumulative Layout Shift (CLS)
- First Input Delay (FID)
- Color contrast
- Unload listeners
- And more...

---

## 📁 Output Locations

### Screenshots
```
screenshots/
├── mobile-375x667.png
├── tablet-768x1024.png
├── desktop-1440x900.png
├── sticker-panel-mobile.png
├── sticker-panel-tablet.png
└── sticker-panel-desktop.png
```

### Test Reports
```
playwright-report/
└── index.html                    # Interactive Playwright report

reports/
├── lighthouse-report.json        # Lighthouse JSON data
├── lighthouse-report.html        # Lighthouse HTML report
└── combined-test-report.md       # Combined markdown report
```

---

## 🔧 MCP Tools Configuration

The tools are configured in `.augment/tools.json`:

### Playwright Tool
```json
{
  "type": "command",
  "command": "npx",
  "args": ["playwright", "test", "--reporter=json", "--reporter=html"],
  "description": "Run Playwright tests for responsiveness and functionality checks"
}
```

### Lighthouse Tool
```json
{
  "type": "command",
  "command": "npx",
  "args": ["lighthouse", "http://localhost:5174", "--output=json", "--output-path=./reports/lighthouse-report.json", "--quiet"],
  "description": "Run Lighthouse performance, accessibility, and SEO audits"
}
```

---

## 📋 Test Execution Flow

### When Running `npm run test:all`:

1. **Start Dev Server** (automatic via Playwright config)
   - Vite dev server starts on http://localhost:5174
   - Waits for server to be ready

2. **Run Playwright Tests**
   - Tests all 3 viewports
   - Takes screenshots
   - Generates HTML and JSON reports
   - Saves to `playwright-report/`

3. **Run Lighthouse Audit**
   - Audits the running dev server
   - Generates JSON and HTML reports
   - Saves to `reports/`

4. **Generate Combined Report**
   - Merges results from both tools
   - Creates markdown summary
   - Saves to `reports/combined-test-report.md`

---

## 🎯 Interpreting Results

### Lighthouse Scores
- **90-100**: ✅ Excellent
- **50-89**: ⚠️ Needs Work
- **0-49**: ❌ Poor

### Common Issues to Look For

#### Performance
- Large images not optimized
- Render-blocking resources
- Unused CSS/JavaScript
- Poor caching strategy

#### Accessibility
- Missing alt text
- Low color contrast
- Missing form labels
- Keyboard navigation issues

#### Best Practices
- Unencrypted connections
- Outdated libraries
- Unload listeners
- Missing security headers

#### SEO
- Missing meta descriptions
- Not mobile-friendly
- Missing structured data
- Crawlable links

---

## 🔄 Continuous Integration

To integrate with CI/CD:

```bash
# In your CI pipeline
npm run test:all

# Check exit codes
# 0 = success
# 1 = failure
```

---

## 📝 Adding New Tests

### Add a New Playwright Test
Edit `tests/e2e/responsive.spec.ts`:

```typescript
test('should test new feature', async ({ page }) => {
  await page.goto('/')
  // Your test code here
  const element = await page.locator('.my-element')
  await expect(element).toBeVisible()
})
```

### Run Specific Test
```bash
npx playwright test responsive.spec.ts -g "should test new feature"
```

---

## 🐛 Troubleshooting

### Dev Server Not Starting
```bash
# Kill any existing processes on port 5174
# Then run tests again
npm run test:all
```

### Lighthouse Audit Fails
```bash
# Make sure dev server is running
npm run dev

# In another terminal
npm run test:lighthouse
```

### Screenshots Not Generated
```bash
# Check screenshots directory exists
ls screenshots/

# If not, create it
mkdir -p screenshots
```

---

## 📚 Resources

- [Playwright Documentation](https://playwright.dev)
- [Lighthouse Documentation](https://developers.google.com/web/tools/lighthouse)
- [Web Vitals Guide](https://web.dev/vitals/)
- [WCAG Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

---

## ✨ Next Steps

1. ✅ Run `npm run test:all` to execute all tests
2. ✅ Review the generated reports
3. ✅ Address any issues found
4. ✅ Add more tests as needed
5. ✅ Integrate into CI/CD pipeline

---

**Happy Testing! 🚀**

