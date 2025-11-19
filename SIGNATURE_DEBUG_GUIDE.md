# 🔧 Signature Save Debugging Guide

## Quick Debug Steps

### Step 1: Check Browser Console
1. Open the SignaturePage
2. Press **F12** to open Developer Tools
3. Go to **Console** tab
4. Look for these messages:

**Expected Console Messages:**
```
Authenticated member data: {"name":"...","branch":"...","role":"..."}
Authenticated member: {name: "...", branch: "...", role: "..."}
Canvas initialized successfully
Loading signatures for branch: ...
Load signatures result: {success: true, ...}
Loaded signatures: 0 (or number of signatures)
```

**If you see errors:**
- ❌ "No authenticated member found in localStorage" → **You need to log in**
- ❌ "Cannot load signatures: No branch information" → **Branch is missing in member data**
- ❌ "Canvas element not found" → **Canvas rendering issue**

---

### Step 2: Test Save Signature
1. Draw something on the canvas
2. Click **"Save Signature"** button
3. Watch the console for:

**Expected Console Messages:**
```
Saving signature for branch: [your-branch-name]
Signature data: {name: "Signature ...", isPrimary: true/false}
Save result: {success: true, id: "SIG-...", signature: {...}}
Loading signatures for branch: [your-branch-name]
Load signatures result: {success: true, ...}
Loaded signatures: 1 (increased by 1)
Return path: /invoice (or /receipt, or null)
Return type: invoice (or receipt, or null)
```

**If you see errors:**
- ❌ "Please draw a signature first!" → **Canvas is empty**
- ❌ "Authentication error: No branch information found" → **Not logged in properly**
- ❌ "Failed to save signature: [error]" → **Check the specific error**

---

### Step 3: Check localStorage

**In Console, type:**
```javascript
// Check authenticated member
console.log(localStorage.getItem('authenticatedMember'));

// Check signatures for your branch (replace 'YourBranch' with actual branch name)
console.log(localStorage.getItem('signatures_YourBranch'));

// Check return path (if you came from Invoice/Receipt)
console.log(localStorage.getItem('signatureReturnPath'));
console.log(localStorage.getItem('signatureReturnType'));
```

**Expected Results:**
```javascript
// authenticatedMember should return something like:
{"name":"John Doe","branch":"Minna","role":"Admin"}

// signatures_YourBranch should return array:
[{"id":"SIG-...","name":"Signature ...","dataURL":"data:image/png;base64,...","isPrimary":true,"createdAt":"...","branch":"Minna"}]

// If you came from Invoice/Receipt:
signatureReturnPath: "/invoice" or "/receipt"
signatureReturnType: "invoice" or "receipt"
```

---

### Step 4: Manual Test

**Test if canvas is working:**
1. Open Console (F12)
2. Type:
```javascript
const canvas = document.querySelector('canvas');
console.log('Canvas:', canvas);
console.log('Canvas width:', canvas?.width);
console.log('Canvas height:', canvas?.height);
```

**Expected Output:**
```
Canvas: <canvas width="800" height="350">
Canvas width: 800
Canvas height: 350
```

---

## Common Issues & Fixes

### Issue 1: "No authenticated member found"
**Cause:** You're not logged in or login data was cleared

**Fix:**
1. Go back to login page
2. Log in with your credentials
3. Return to signature page
4. Try again

**Quick Fix (Console):**
```javascript
// Manually set authenticated member for testing
localStorage.setItem('authenticatedMember', JSON.stringify({
  name: "Test User",
  branch: "TestBranch",
  role: "Admin"
}));
// Refresh the page
location.reload();
```

---

### Issue 2: "Please draw a signature first"
**Cause:** Canvas hasn't detected any drawing

**Fix:**
1. Make sure you're actually drawing on the canvas (click and drag)
2. Try using different pen size or color
3. Check if canvas is visible and clickable

**Debug (Console):**
```javascript
// Check if hasDrawn is true
// This won't work directly but you can add it temporarily in the code
```

---

### Issue 3: Button not clickable / No response
**Cause:** Button might be disabled or JavaScript error

**Fix:**
1. Check if button has `disabled` class
2. Look for JavaScript errors in console (red text)
3. Try drawing on canvas first

**Check (Console):**
```javascript
const saveBtn = document.querySelector('button[class*="bg-purple-600"]');
console.log('Save button:', saveBtn);
console.log('Is disabled:', saveBtn?.disabled);
```

---

### Issue 4: Data not persisting
**Cause:** localStorage might be disabled or full

**Fix:**
1. Check browser settings for localStorage
2. Clear some browser data
3. Try incognito/private mode

**Test (Console):**
```javascript
try {
  localStorage.setItem('test', 'test');
  console.log('localStorage works!');
  localStorage.removeItem('test');
} catch(e) {
  console.error('localStorage error:', e);
}
```

---

## Step-by-Step Debug Flow

### 🔍 Complete Diagnostic

Run this in console:
```javascript
// === DIAGNOSTIC SCRIPT ===
console.log('=== SIGNATURE PAGE DIAGNOSTICS ===\n');

// 1. Check Authentication
const auth = localStorage.getItem('authenticatedMember');
console.log('1. Authentication:', auth ? '✅ Found' : '❌ Missing');
if (auth) {
  const parsed = JSON.parse(auth);
  console.log('   Name:', parsed.name);
  console.log('   Branch:', parsed.branch);
  console.log('   Role:', parsed.role);
}

// 2. Check Canvas
const canvas = document.querySelector('canvas');
console.log('\n2. Canvas:', canvas ? '✅ Found' : '❌ Missing');
if (canvas) {
  console.log('   Width:', canvas.width);
  console.log('   Height:', canvas.height);
  console.log('   Context:', canvas.getContext('2d') ? '✅ Ready' : '❌ Failed');
}

// 3. Check Signatures Storage
if (auth) {
  const branch = JSON.parse(auth).branch;
  const sigs = localStorage.getItem(`signatures_${branch}`);
  console.log('\n3. Signatures for', branch + ':', sigs ? '✅ Found' : '⚠️ Empty');
  if (sigs) {
    const sigArray = JSON.parse(sigs);
    console.log('   Count:', sigArray.length);
    sigArray.forEach((sig, i) => {
      console.log(`   ${i+1}. ${sig.name} ${sig.isPrimary ? '(Primary)' : ''}`);
    });
  }
}

// 4. Check Navigation State
const returnPath = localStorage.getItem('signatureReturnPath');
const returnType = localStorage.getItem('signatureReturnType');
console.log('\n4. Navigation State:');
console.log('   Return Path:', returnPath || '❌ None');
console.log('   Return Type:', returnType || '❌ None');

// 5. Check Button State
const saveBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Save Signature'));
console.log('\n5. Save Button:', saveBtn ? '✅ Found' : '❌ Missing');
if (saveBtn) {
  console.log('   Disabled:', saveBtn.disabled ? '❌ Yes' : '✅ No');
  console.log('   Visible:', saveBtn.offsetParent !== null ? '✅ Yes' : '❌ No');
}

console.log('\n=== END DIAGNOSTICS ===');
```

---

## Expected Working Flow

**✅ Success Flow:**
```
1. User logs in → authenticatedMember stored in localStorage
2. User navigates to Invoice/Receipt page
3. User clicks "Create New" → Stores returnPath and returnType
4. User lands on Signature page → Loads member data, initializes canvas
5. User draws signature → hasDrawn = true
6. User clicks "Save Signature" → Calls saveSignature()
7. Signature saved to localStorage with key: signatures_[branch]
8. Prompt appears asking to return
9. User clicks OK → Returns to Invoice/Receipt page
10. Page reloads signatures → New signature appears in dropdown
```

---

## Quick Fixes

### If Save Button is Disabled:
```javascript
// Force enable (temporary debug)
document.querySelector('button[class*="bg-purple-600"]').disabled = false;
```

### If Signatures Don't Load:
```javascript
// Force reload signatures (in console)
location.reload();
```

### Clear All Data and Start Fresh:
```javascript
// WARNING: This clears all signatures!
const auth = JSON.parse(localStorage.getItem('authenticatedMember'));
if (auth) {
  localStorage.removeItem(`signatures_${auth.branch}`);
  console.log('Signatures cleared for', auth.branch);
  location.reload();
}
```

---

## Still Not Working?

1. **Clear browser cache** (Ctrl + Shift + Delete)
2. **Try a different browser** (Chrome, Firefox, Edge)
3. **Check if cookies/storage are enabled** in browser settings
4. **Disable browser extensions** temporarily
5. **Check network tab** for any failed requests
6. **Take screenshot of console** errors and share them

---

## Success Indicators ✅

You'll know it's working when:
- ✅ Console shows all expected messages
- ✅ Save button is enabled after drawing
- ✅ Alert appears after saving
- ✅ Signature appears in "Saved Signatures" panel
- ✅ Can select signature from list
- ✅ Prompt appears asking to return (if from Invoice/Receipt)

---

**Need more help? Share the console output!** 📋
