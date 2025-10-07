# Floating Properties Panel - Canva-Style Implementation

A beautiful, responsive floating properties panel that behaves like Canva's floating context toolbar, built with Vue 3, TypeScript, and Tailwind CSS.

## 🎯 Features

### Core Functionality
- **Smart Positioning**: Automatically positions itself next to selected elements with collision detection
- **Dynamic Controls**: Shows different controls based on element type (text, image, shape)
- **Smooth Animations**: Elegant show/hide transitions with scale and fade effects
- **Draggable**: Optional drag functionality with visual drag handle
- **Dismissible**: Click outside or press ESC to close

### Element-Specific Controls

#### Text Controls
- Font family dropdown with common fonts
- Font size with number input and validation
- Text styling: Bold, Italic, Underline
- Text alignment: Left, Center, Right
- Color picker with hex input
- Line height and letter spacing controls
- Text transform options (uppercase, lowercase, capitalize)

#### Image Controls
- Replace image functionality
- Crop image (placeholder)
- Transform: Flip horizontal/vertical, rotation
- Adjustments: Opacity, brightness, contrast, saturation
- Filters: Grayscale, sepia, blur, invert, vintage
- Corner radius and drop shadow effects

#### Shape Controls
- Fill color with opacity control
- Stroke color, width, and style (solid, dashed, dotted)
- Shape type selector (rectangle, circle, triangle, star)
- Corner radius for rectangles
- Blend mode options
- Drop shadow toggle

#### Transform Controls (Common)
- Position: X/Y coordinates
- Size: Width/height with aspect ratio lock
- Rotation with slider and number input
- Flip controls
- Layer management: Bring forward/send backward
- Actions: Duplicate, delete, lock, visibility toggle

### Accessibility Features
- **Keyboard Navigation**: Full keyboard support with tab order
- **Keyboard Shortcuts**: 
  - Ctrl/Cmd+B for bold
  - Ctrl/Cmd+I for italic
  - Ctrl/Cmd+U for underline
  - ESC to close panel
- **ARIA Labels**: Screen reader friendly labels for all controls
- **Focus Management**: Proper focus handling and visual indicators

## 🏗️ Architecture

### Core Components

#### `FloatingPropertiesPanel.vue`
Main floating panel component that:
- Manages positioning and visibility
- Renders appropriate control components based on selection
- Handles drag functionality and click-outside behavior
- Provides smooth animations and transitions

#### `useFloatingPosition.ts`
Composable utility for smart positioning:
- Uses Floating UI for robust positioning calculations
- Handles viewport collision detection
- Supports manual positioning from element bounds
- Provides arrow positioning for visual connection

#### Control Components
- `TextControls.vue` - Typography and text formatting
- `ImageControls.vue` - Image-specific adjustments and filters
- `ShapeControls.vue` - Shape properties and styling
- `TransformControls.vue` - Common transform and layer controls

### Integration Points

#### Canvas Integration
```vue
<FloatingPropertiesPanel
  :selected-objects="selectedObjects"
  :canvas-container="canvasContainer"
  :zoom="zoom"
  :is-draggable="true"
  :show-arrow="true"
  @update-object="handleObjectUpdate"
  @replace-image="handleReplaceImage"
  @crop-image="handleCropImage"
  @duplicate="handleDuplicate"
  @delete="handleDelete"
  @bring-forward="handleBringForward"
  @send-backward="handleSendBackward"
  @close="clearSelection"
/>
```

#### Event Handling
The panel emits events for all user actions:
- `update-object` - Property changes
- `replace-image` - Image replacement
- `crop-image` - Crop requests
- `duplicate` - Object duplication
- `delete` - Object deletion
- `bring-forward` / `send-backward` - Layer management
- `close` - Panel dismissal

## 🎨 Design System

### Visual Design
- **Clean & Minimal**: Modern aesthetic with subtle gradients and soft shadows
- **Consistent Spacing**: Tailwind utility classes for consistent spacing
- **Rounded Corners**: Soft, friendly appearance
- **Drop Shadow**: Professional elevation with backdrop blur
- **Color Scheme**: Gray-based with blue accents for active states

### Responsive Behavior
- **Viewport Aware**: Never overlaps important content
- **Smart Flipping**: Automatically repositions based on available space
- **Compact Layout**: Prioritizes commonly used controls
- **Scrollable Content**: Handles overflow gracefully

### Animation Details
- **Enter**: Scale up from 95% with fade in (200ms ease-out)
- **Exit**: Scale down to 95% with fade out (150ms ease-in)
- **Hover States**: Subtle opacity and color transitions
- **Focus States**: Clear visual indicators for keyboard navigation

## 📦 Dependencies

### Required Packages
```json
{
  "@floating-ui/vue": "^1.0.0",
  "@heroicons/vue": "^2.0.0",
  "@vueuse/core": "^10.7.0",
  "@headlessui/vue": "^1.7.16"
}
```

### Recommended Icons
- Heroicons for consistent iconography
- Font Awesome or Remix Icon as alternatives
- Custom SVG icons for specific shapes

## 🚀 Usage Examples

### Basic Implementation
```vue
<template>
  <div class="canvas-container" ref="canvasRef">
    <!-- Your canvas elements -->
    
    <FloatingPropertiesPanel
      :selected-objects="selectedObjects"
      :canvas-container="canvasRef"
      @update-object="handleUpdate"
      @close="clearSelection"
    />
  </div>
</template>
```

### With Custom Positioning
```typescript
import { useFloatingPosition, getCanvasElementBounds } from '@/composables/useFloatingPosition'

const { positionFromBounds } = useFloatingPosition(referenceEl, floatingEl)

// Position manually
const bounds = getCanvasElementBounds(element, canvasContainer, zoom)
positionFromBounds(bounds)
```

## 🧪 Demo

The implementation includes a comprehensive demo page (`FloatingPanelDemo.vue`) that showcases:
- Text element with typography controls
- Image element with adjustment controls  
- Shape element with styling controls
- Interactive selection and real-time updates
- All accessibility features and keyboard shortcuts

Access the demo by navigating to the "Floating Panel Demo" tab in the application.

## 🔧 Customization

### Styling
All styles use Tailwind CSS classes and can be customized by:
- Modifying the CSS custom properties
- Overriding Tailwind classes
- Adjusting the color scheme in the design system

### Controls
Add new control types by:
1. Creating a new control component in `src/components/controls/`
2. Adding the component to `FloatingPropertiesPanel.vue`
3. Implementing the corresponding event handlers

### Positioning
Customize positioning behavior by:
- Modifying the `useFloatingPosition` composable
- Adjusting Floating UI middleware options
- Implementing custom collision detection logic

## 🎯 Performance Considerations

- **Lazy Loading**: Control components are only rendered when needed
- **Event Debouncing**: Input changes are debounced for performance
- **Memory Management**: Proper cleanup of event listeners and observers
- **Efficient Updates**: Only re-renders when selection changes

## 🔮 Future Enhancements

- **Advanced Filters**: More sophisticated image filters
- **Animation Controls**: Keyframe animation properties
- **Group Selection**: Multi-object editing capabilities
- **Custom Themes**: User-customizable color schemes
- **Plugin System**: Extensible control architecture
