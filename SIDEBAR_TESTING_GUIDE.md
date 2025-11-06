# 🧪 Sidebar Testing Guide

## Quick Test Checklist

### 1. Mobile View (< 768px)

#### Hamburger Button
- [ ] Visible in top-left corner
- [ ] Has 3 horizontal lines
- [ ] Clickable (cursor changes)
- [ ] Position: Tablet (12px/20px), Mobile (10px/12px)
- [ ] Z-index: Above everything else

#### Opening Sidebar
- [ ] Click hamburger → Sidebar slides in from left
- [ ] Transition smooth (300ms cubic-bezier)
- [ ] Overlay backdrop appears (blurred, darkened)
- [ ] Body scroll locked (page doesn't scroll)
- [ ] Hamburger still visible above Sidebar

#### Sidebar Structure
- [ ] Header shows "Menu" title
- [ ] Close button (X) visible in header
- [ ] Navigation links visible:
  - Home (🏠)
  - Template (📄)
  - Scheduling (📅)
  - Imposition (📐)
  - Mockup (🖼️)
- [ ] Divider line visible
- [ ] Auto Design button (gradient purple)
- [ ] More button (outlined)

#### User Profile (Bottom)
- [ ] Visible at bottom after scrolling
- [ ] Avatar shows (gradient initials or image)
- [ ] User name displays correctly
- [ ] Email displays correctly
- [ ] Settings button visible
- [ ] Logout button visible (red tint)
- [ ] All elements centered

#### Navigation
- [ ] Click "Home" → Sidebar closes, scrolls to top
- [ ] Click "Template" → Sidebar closes, scrolls to template section
- [ ] Click "Scheduling" → Sidebar closes, navigates to /scheduling
- [ ] Click "Imposition" → Sidebar closes, navigates to /imposition
- [ ] Click "Mockup" → Sidebar closes, navigates to /mockup
- [ ] Click "Auto Design" → Sidebar closes, opens editor/login
- [ ] Click "More" → Sidebar closes, opens More menu

#### User Actions
- [ ] Click "Settings" → Sidebar closes, navigates to /settings
- [ ] Click "Logout" → Sidebar closes, user logged out, redirects to home

#### Closing Sidebar
- [ ] Click X button → Sidebar closes
- [ ] Click overlay → Sidebar closes
- [ ] Click any navigation link → Sidebar closes
- [ ] All close actions smooth (300ms transition)
- [ ] Body scroll restored after close

---

### 2. Desktop View (≥ 768px)

#### HomeHeader
- [ ] Fixed at top of page
- [ ] Logo visible
- [ ] Desktop navigation visible:
  - Home
  - Template
  - Scheduling
  - Imposition
  - Mockup
  - Auto Design
  - More
- [ ] Header actions visible:
  - ThemeToggle (sun/moon icon)
  - TokenDisplay (if authenticated)
  - NotificationBell (if authenticated)
  - Get Started button (if NOT authenticated)
- [ ] NO hamburger button visible
- [ ] NO user avatar visible
- [ ] Layout not cramped

#### Navigation
- [ ] Click "Home" → Scrolls to top
- [ ] Click "Template" → Scrolls to template section
- [ ] Click "Scheduling" → Navigates to /scheduling
- [ ] Click "Imposition" → Navigates to /imposition
- [ ] Click "Mockup" → Navigates to /mockup
- [ ] Click "Auto Design" → Opens Auto Design modal
- [ ] Click "More" → Opens More dropdown menu

---

### 3. User Profile Tests

#### Not Authenticated
- [ ] Sidebar does not show user profile section
- [ ] Only navigation links and buttons visible
- [ ] Get Started button in header (desktop)
- [ ] Auto Design opens login modal

#### Authenticated
- [ ] Sidebar shows user profile at bottom
- [ ] Avatar shows user image or initials
- [ ] Name displays (name > username > email fallback)
- [ ] Email displays
- [ ] Settings button functional
- [ ] Logout button functional
- [ ] TokenDisplay shows in header (desktop)
- [ ] NotificationBell shows in header (desktop)

---

### 4. Responsive Tests

#### Resize from Desktop to Mobile
- [ ] Hamburger appears at 768px
- [ ] Desktop nav still works until < 768px
- [ ] Sidebar functional when visible

#### Resize from Mobile to Desktop
- [ ] Hamburger disappears at 768px
- [ ] Desktop nav appears
- [ ] No Sidebar visible
- [ ] HomeHeader layout proper

#### Different Mobile Sizes
**Tablet (768px)**
- [ ] Sidebar width: 280px
- [ ] Avatar: 60px
- [ ] Hamburger: top 12px, left 20px

**Mobile (480px)**
- [ ] Sidebar width: 260px
- [ ] Avatar: 50px
- [ ] Hamburger: top 10px, left 12px
- [ ] Font sizes smaller

**Small Mobile (< 400px)**
- [ ] Sidebar max-width: 85vw
- [ ] Content not cut off
- [ ] All buttons accessible

---

### 5. Visual Tests

#### Sidebar Appearance
- [ ] Dark gradient background
- [ ] Smooth blur backdrop
- [ ] Sharp shadow (4px offset)
- [ ] Proper border radius on buttons
- [ ] Consistent spacing

#### User Profile Styling
- [ ] Avatar has gradient (purple to pink)
- [ ] Avatar has border with glow
- [ ] Name is bold, white
- [ ] Email is smaller, gray
- [ ] Settings button has light background
- [ ] Logout button has red tint
- [ ] All elements centered

#### Hover Effects
- [ ] Navigation links lighten on hover
- [ ] Navigation links translate right 4px on hover
- [ ] Buttons have shadow on hover
- [ ] Close button rotates on hover
- [ ] Cursor changes to pointer

#### Animations
- [ ] Sidebar slide-in smooth
- [ ] Overlay fade-in smooth
- [ ] Auto Design icon rotates (3s loop)
- [ ] Hover transitions smooth (200ms)

---

### 6. Interaction Tests

#### Body Scroll
- [ ] Body scroll locked when Sidebar open
- [ ] Body scroll restored when Sidebar closed
- [ ] Page doesn't jump when locking/unlocking

#### Z-Index Stack
- [ ] Overlay appears above content
- [ ] Sidebar appears above overlay
- [ ] Hamburger appears above Sidebar
- [ ] No visual glitches

#### Click Targets
- [ ] All buttons have proper clickable area
- [ ] Icons not blocking text clicks
- [ ] Overlay fully clickable
- [ ] No dead zones

---

### 7. Edge Cases

#### Long User Name
- [ ] Name truncates with ellipsis
- [ ] Email truncates with ellipsis
- [ ] Avatar size stays 60px

#### No User Avatar
- [ ] Gradient initials show correctly
- [ ] 2-letter initials (first + last)
- [ ] Fallback to email initials

#### Slow Network
- [ ] Sidebar still opens instantly
- [ ] Navigation still works
- [ ] No loading blockers

#### Multiple Rapid Clicks
- [ ] Hamburger toggle works properly
- [ ] No animation jank
- [ ] State stays consistent

---

### 8. Browser Compatibility

#### Chrome/Edge
- [ ] All features work
- [ ] Backdrop blur renders
- [ ] Animations smooth

#### Firefox
- [ ] All features work
- [ ] Backdrop blur renders
- [ ] Animations smooth

#### Safari (iOS)
- [ ] All features work
- [ ] Backdrop blur renders
- [ ] Touch interactions work
- [ ] Body scroll lock works

#### Mobile Browsers
- [ ] Touch events work
- [ ] Swipe doesn't interfere
- [ ] Pinch zoom disabled when Sidebar open

---

### 9. Accessibility Tests

#### Keyboard Navigation
- [ ] Tab through hamburger button
- [ ] Tab through Sidebar links
- [ ] Enter key activates buttons
- [ ] ESC key closes Sidebar (if implemented)

#### Screen Readers
- [ ] Hamburger has aria-label
- [ ] Close button has aria-label
- [ ] Navigation links announced
- [ ] User name announced

#### Color Contrast
- [ ] White text on dark background readable
- [ ] Gray email text readable
- [ ] Red logout button readable

---

### 10. Performance Tests

#### Animation Performance
- [ ] Sidebar transition 60fps
- [ ] No lag on low-end devices
- [ ] Overlay transition smooth

#### Memory Usage
- [ ] No memory leaks on open/close cycles
- [ ] Event listeners cleaned up
- [ ] Body overflow restored

#### Load Time
- [ ] Sidebar component loads fast
- [ ] No visible flash on mount
- [ ] Icons render immediately

---

## Test Scenarios

### Scenario 1: First-Time User (Not Authenticated)
```
1. Open site on mobile
2. Click hamburger
   → Sidebar opens
3. See navigation links
   → No user profile
4. Click "Auto Design"
   → Login modal appears
5. Cancel login
   → Back to home
```

### Scenario 2: Logged-In User Navigation
```
1. Login to site
2. Click hamburger on mobile
   → Sidebar opens
3. Scroll to bottom
   → User profile visible
4. Click "Scheduling"
   → Sidebar closes
   → Navigate to /scheduling
5. Click hamburger again
   → Sidebar opens
6. Click "Settings"
   → Navigate to /settings
```

### Scenario 3: User Logout
```
1. Open Sidebar
2. Scroll to bottom
3. Click "Logout"
   → Sidebar closes
   → User logged out
   → Redirect to home
4. Open Sidebar again
   → No user profile
   → Auto Design prompts login
```

### Scenario 4: Desktop to Mobile
```
1. View site on desktop
   → No hamburger
   → Desktop nav visible
2. Resize to mobile
   → Hamburger appears
   → Desktop nav hidden
3. Click hamburger
   → Sidebar works
4. Navigate
   → All links work
```

---

## Bug Report Template

If you find an issue:

```markdown
### Bug Report

**Component:** Sidebar / HomePage / HomeHeader

**Issue:** [Brief description]

**Steps to Reproduce:**
1. [First step]
2. [Second step]
3. [Third step]

**Expected Behavior:**
[What should happen]

**Actual Behavior:**
[What actually happens]

**Environment:**
- Device: [Desktop/Mobile/Tablet]
- Browser: [Chrome/Firefox/Safari/Edge]
- Screen Size: [e.g., 375px x 667px]
- User State: [Authenticated/Not Authenticated]

**Screenshots:**
[If applicable]

**Console Errors:**
[If applicable]
```

---

## Success Criteria

### All Must Pass ✅
- [ ] Hamburger button visible on mobile
- [ ] Sidebar opens and closes smoothly
- [ ] All navigation links work correctly
- [ ] User profile shows at bottom (authenticated)
- [ ] Settings button navigates to /settings
- [ ] Logout button logs user out
- [ ] Body scroll locked when Sidebar open
- [ ] No console errors
- [ ] No visual glitches
- [ ] Responsive on all screen sizes

---

## Quick Test Commands

### Open Dev Tools
```
F12 (Windows/Linux)
Cmd+Option+I (Mac)
```

### Toggle Device Toolbar
```
Ctrl+Shift+M (Windows/Linux)
Cmd+Shift+M (Mac)
```

### Responsive Breakpoints to Test
```
Mobile S: 320px
Mobile M: 375px
Mobile L: 425px
Tablet: 768px
Laptop: 1024px
Desktop: 1440px
```

### Check Z-Index in Console
```javascript
// Check Sidebar z-index
getComputedStyle(document.querySelector('.mobile-sidebar')).zIndex
// Should be: "10000"

// Check Overlay z-index
getComputedStyle(document.querySelector('.mobile-menu-overlay')).zIndex
// Should be: "9999"

// Check Hamburger z-index
getComputedStyle(document.querySelector('.hamburger-button')).zIndex
// Should be: "10001"
```

### Check Body Scroll Lock
```javascript
// When Sidebar open
console.log(document.body.style.overflow)
// Should be: "hidden"

// When Sidebar closed
console.log(document.body.style.overflow)
// Should be: "" or "auto"
```

---

## Automated Test Ideas (Future)

### E2E Tests (Cypress/Playwright)
```typescript
describe('Sidebar Navigation', () => {
  it('opens sidebar on hamburger click', () => {
    cy.viewport(375, 667)
    cy.get('.hamburger-button').click()
    cy.get('.mobile-sidebar').should('have.class', 'active')
  })
  
  it('navigates to scheduling page', () => {
    cy.get('.hamburger-button').click()
    cy.contains('Scheduling').click()
    cy.url().should('include', '/scheduling')
  })
  
  it('logs out user', () => {
    cy.get('.hamburger-button').click()
    cy.contains('Logout').click()
    cy.get('.sidebar-user-profile').should('not.exist')
  })
})
```

### Unit Tests (Vitest)
```typescript
describe('Sidebar Component', () => {
  it('emits close event on overlay click', () => {
    const wrapper = mount(Sidebar, { props: { isOpen: true } })
    wrapper.find('.mobile-menu-overlay').trigger('click')
    expect(wrapper.emitted()).toHaveProperty('close')
  })
  
  it('shows user profile when authenticated', () => {
    const user = { name: 'John', email: 'john@test.com' }
    const wrapper = mount(Sidebar, { props: { user } })
    expect(wrapper.find('.sidebar-user-profile').exists()).toBe(true)
  })
})
```

---

## Troubleshooting

### Issue: Sidebar not visible
**Check:**
1. Is `isSidebarOpen` true in HomePage?
2. Is Sidebar component imported?
3. Is `.active` class applied?
4. Is z-index correct (10000)?
5. Is transform applied (translateX)?

### Issue: Body still scrolls
**Check:**
1. Is `overflow: hidden` applied to body?
2. Is watch effect running?
3. Is cleanup happening on unmount?

### Issue: Navigation not working
**Check:**
1. Are events emitting from Sidebar?
2. Are handlers defined in HomePage?
3. Is router-push working?
4. Are scroll anchors valid?

### Issue: User profile not showing
**Check:**
1. Is user prop passed to Sidebar?
2. Is authStore.user populated?
3. Is user object valid?
4. Is `v-if="user"` evaluating true?

---

🧪 **Ready to Test!**
Follow this guide to ensure everything works perfectly.
