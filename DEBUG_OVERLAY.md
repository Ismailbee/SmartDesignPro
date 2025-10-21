# Debug Overlay Positioning Issue

## Steps to Debug

1. **Open the app** at `http://localhost:5173/`
2. **Add a text element** to the canvas
3. **Double-click to edit** the text
4. **Open browser console** (F12)
5. **Run this command**:

```javascript
// Get the overlay element
const overlay = document.querySelector('.text-edit-overlay')
if (overlay) {
  const rect = overlay.getBoundingClientRect()
  console.log('Overlay position:', {
    position: overlay.style.position,
    left: overlay.style.left,
    top: overlay.style.top,
    width: overlay.style.width,
    height: overlay.style.height,
    transform: overlay.style.transform,
    padding: overlay.style.padding,
    boxSizing: overlay.style.boxSizing,
    actualRect: {
      left: rect.left,
      top: rect.top,
      width: rect.width,
      height: rect.height
    }
  })
}

// Get the Konva text node
const canvas = document.querySelector('canvas')
if (canvas) {
  console.log('Canvas position:', canvas.getBoundingClientRect())
}
```

## Expected Output

The overlay should have:
- `position: "fixed"`
- `left` and `top` values matching the text position
- `width` and `height` matching the text dimensions
- `transform` with rotation if text is rotated

## Common Issues

### Issue 1: Overlay not visible
- Check if `textEditState.isEditing` is true
- Check if overlay has `display: none`

### Issue 2: Overlay in wrong position
- Check if `position: fixed` is set
- Check if `left` and `top` are calculated correctly
- Check if stage has been panned/zoomed

### Issue 3: Overlay wrong size
- Check if padding is accounted for
- Check if box-sizing is 'border-box'
- Check if Konva text has padding set

### Issue 4: Overlay not rotated
- Check if `transform: rotate(...)` is set
- Check if `transformOrigin: 'left top'` is set

## Quick Fix Test

Try running this in console while editing text:

```javascript
const overlay = document.querySelector('.text-edit-overlay')
if (overlay) {
  // Force position to a known location (top-left of viewport)
  overlay.style.position = 'fixed'
  overlay.style.left = '100px'
  overlay.style.top = '100px'
  overlay.style.width = '200px'
  overlay.style.height = '50px'
  overlay.style.transform = 'none'
  console.log('Overlay forced to 100,100 - can you see it?')
}
```

If you can see the overlay at 100,100, then the alignment function is not being called or is calculating wrong values.

If you still can't see it, there's a CSS or visibility issue.

