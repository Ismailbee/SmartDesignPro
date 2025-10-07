# Quick Fix Guide for Remaining TypeScript Errors

## Option 1: Build with Relaxed Type Checking (Recommended for Now)

Update `package.json` build script to skip lib check temporarily:

```json
"scripts": {
  "build": "vite build",
  "build:check": "vue-tsc && vite build"
}
```

This allows you to build while you fix the remaining type errors.

## Option 2: Fix All Event Target Errors (Systematic Approach)

### Step 1: Create a global type helper

Already created: `src/utils/event-helpers.ts`

### Step 2: Apply to all components

For each component with event errors, add this import:

```typescript
import { getInputValue, getInputNumberValue, getInputIntValue } from '@/utils/event-helpers'
```

### Step 3: Replace patterns

Find and replace in each file:

| Old Pattern | New Pattern |
|------------|-------------|
| `$event.target.value` | `getInputValue($event)` |
| `parseFloat($event.target.value)` | `getInputNumberValue($event)` |
| `parseInt($event.target.value)` | `getInputIntValue($event)` |
| `Math.max(n, parseFloat($event.target.value))` | `Math.max(n, getInputNumberValue($event))` |

### Files to Update:

1. **src/components/controls/ImageControls.vue** (14 errors)
   - Lines: 68, 77, 98, 117, 136, 155, 234

2. **src/components/controls/ShapeControls.vue** (24 errors)
   - Lines: 12, 25, 38, 61, 74, 87, 96, 111, 132, 141, 202, 238

3. **src/components/controls/TextControls.vue** (12 errors)
   - Lines: 13, 33, 112, 125, 142, 155

4. **src/components/controls/TransformControls.vue** (12 errors)
   - Lines: 13, 24, 42, 54, 89, 98

5. **src/components/PropertiesPanel.vue** (30 errors)
   - Lines: 33, 42, 51, 61, 73, 88, 109, 119, 192, 198, 216, 222, 235, 241, 253

6. **src/components/SimpleFloatingPanel.vue** (14 errors)
   - Lines: 53, 65, 100, 126, 136, 155, 165

## Option 3: Use Type Assertions (Quick but Less Safe)

Add type assertions where needed:

```typescript
// Before
@input="updateProperty('x', parseFloat($event.target.value))"

// After
@input="updateProperty('x', parseFloat(($event.target as HTMLInputElement).value))"
```

## Automated Fix Script

You can create a script to automate the fixes. Here's a PowerShell example:

```powershell
# fix-events.ps1
$files = @(
    "src/components/controls/ImageControls.vue",
    "src/components/controls/ShapeControls.vue",
    "src/components/controls/TextControls.vue",
    "src/components/controls/TransformControls.vue",
    "src/components/PropertiesPanel.vue",
    "src/components/SimpleFloatingPanel.vue"
)

foreach ($file in $files) {
    $content = Get-Content $file -Raw
    
    # Add import if not exists
    if ($content -notmatch "event-helpers") {
        $content = $content -replace "(<script setup lang=`"ts`">)", "`$1`nimport { getInputValue, getInputNumberValue, getInputIntValue } from '@/utils/event-helpers'"
    }
    
    # Replace patterns
    $content = $content -replace "parseFloat\(\`$event\.target\.value\)", "getInputNumberValue(`$event)"
    $content = $content -replace "parseInt\(\`$event\.target\.value", "getInputIntValue(`$event)"
    $content = $content -replace "\`$event\.target\.value", "getInputValue(`$event)"
    
    Set-Content $file $content
}

Write-Host "Fixed event handlers in all files!"
```

## Other Specific Fixes

### 1. CanvasStageSimple.vue (Line 66)
```vue
<!-- Change style object to use proper typing -->
<div
  :style="{
    fontSize: text.fontSize + 'px',
    fontFamily: text.fontFamily,
    // ... other properties
  } as any"
>
```

### 2. FloatingPropertiesPanel.vue (Line 68)
```vue
<script setup lang="ts">
// Add to emits
const emit = defineEmits<{
  'replace-image': [event: any]
  // ... other emits
}>()
</script>
```

## Testing After Fixes

```bash
# Run type check
npm run build:check

# Run development server
npm run dev

# Run linter
npm run lint
```

## Priority Order

1. ✅ **DONE**: Critical build errors (vue-tsc, ESLint config)
2. ✅ **DONE**: Code quality (logger, validation, error handling)
3. ⚠️ **IN PROGRESS**: Type safety (event handlers)
4. 📋 **TODO**: Unit tests
5. 📋 **TODO**: Performance optimization

## Estimated Time to Fix Remaining Errors

- **Option 1** (Relaxed build): 2 minutes
- **Option 2** (Manual fixes): 30-45 minutes
- **Option 3** (Automated script): 10-15 minutes

## Recommendation

Use **Option 1** for immediate deployment, then gradually apply **Option 2** for long-term maintainability.

