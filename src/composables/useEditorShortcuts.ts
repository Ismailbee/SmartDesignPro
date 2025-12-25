/**
 * Editor Keyboard Shortcuts Hook
 * Provides keyboard shortcuts for the design editor
 */

import { onMounted, onUnmounted } from 'vue'

export interface ShortcutHandlers {
  undo?: () => void
  redo?: () => void
  delete?: () => void
  duplicate?: () => void
  selectAll?: () => void
  deselect?: () => void
  copy?: () => void
  paste?: () => void
  cut?: () => void
  save?: () => void
  export?: () => void
  exportDesign?: () => void
  zoomIn?: () => void
  zoomOut?: () => void
  resetZoom?: () => void
  toggleGrid?: () => void
  bringForward?: () => void
  sendBackward?: () => void
  bold?: () => void
  italic?: () => void
  underline?: () => void
  addText?: () => void
  addShape?: () => void
  addImage?: () => void
  showHelp?: () => void
}

export function useEditorShortcuts(handlers: ShortcutHandlers) {
  const handleKeyDown = (e: KeyboardEvent) => {
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
    const ctrlKey = isMac ? e.metaKey : e.ctrlKey
    const key = e.key.toLowerCase()

    // Ignore if typing in input/textarea
    if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
      return
    }

    // Ctrl/Cmd + Key shortcuts
    if (ctrlKey) {
      switch (key) {
        case 'z':
          if (e.shiftKey) {
            e.preventDefault()
            handlers.redo?.()
          } else {
            e.preventDefault()
            handlers.undo?.()
          }
          break
        case 'y':
          e.preventDefault()
          handlers.redo?.()
          break
        case 'c':
          e.preventDefault()
          handlers.copy?.()
          break
        case 'v':
          e.preventDefault()
          handlers.paste?.()
          break
        case 'x':
          e.preventDefault()
          handlers.cut?.()
          break
        case 'd':
          e.preventDefault()
          handlers.duplicate?.()
          break
        case 'a':
          e.preventDefault()
          handlers.selectAll?.()
          break
        case 's':
          e.preventDefault()
          handlers.save?.()
          break
        case 'e':
          e.preventDefault()
          handlers.export?.()
          break
        case 'g':
          e.preventDefault()
          handlers.toggleGrid?.()
          break
        case 'b':
          e.preventDefault()
          handlers.bold?.()
          break
        case 'i':
          e.preventDefault()
          handlers.italic?.()
          break
        case 'u':
          e.preventDefault()
          handlers.underline?.()
          break
        case '=':
        case '+':
          e.preventDefault()
          handlers.zoomIn?.()
          break
        case '-':
          e.preventDefault()
          handlers.zoomOut?.()
          break
        case '0':
          e.preventDefault()
          handlers.resetZoom?.()
          break
        case ']':
          e.preventDefault()
          handlers.bringForward?.()
          break
        case '[':
          e.preventDefault()
          handlers.sendBackward?.()
          break
      }
    }

    // Single key shortcuts
    if (!ctrlKey && !e.altKey) {
      switch (key) {
        case 'delete':
        case 'backspace':
          // Only if not in text editing mode
          if (!(e.target as HTMLElement).isContentEditable) {
            handlers.delete?.()
          }
          break
        case 'escape':
          e.preventDefault()
          handlers.deselect?.()
          break
        case 't':
          e.preventDefault()
          handlers.addText?.()
          break
        case 'r':
          e.preventDefault()
          handlers.addShape?.()
          break
        case '?':
          e.preventDefault()
          handlers.showHelp?.()
          break
      }
    }
  }

  onMounted(() => {
    window.addEventListener('keydown', handleKeyDown)
  })

  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeyDown)
  })

  return {
    shortcuts: [
      { keys: ['Ctrl', 'Z'], action: 'Undo' },
      { keys: ['Ctrl', 'Shift', 'Z'], action: 'Redo' },
      { keys: ['Ctrl', 'Y'], action: 'Redo' },
      { keys: ['Ctrl', 'C'], action: 'Copy' },
      { keys: ['Ctrl', 'V'], action: 'Paste' },
      { keys: ['Ctrl', 'X'], action: 'Cut' },
      { keys: ['Ctrl', 'D'], action: 'Duplicate' },
      { keys: ['Ctrl', 'A'], action: 'Select All' },
      { keys: ['Ctrl', 'S'], action: 'Save' },
      { keys: ['Ctrl', 'E'], action: 'Export' },
      { keys: ['Ctrl', 'G'], action: 'Toggle Grid' },
      { keys: ['Ctrl', 'B'], action: 'Bold' },
      { keys: ['Ctrl', 'I'], action: 'Italic' },
      { keys: ['Ctrl', 'U'], action: 'Underline' },
      { keys: ['Ctrl', '+'], action: 'Zoom In' },
      { keys: ['Ctrl', '-'], action: 'Zoom Out' },
      { keys: ['Ctrl', '0'], action: 'Reset Zoom' },
      { keys: ['Ctrl', ']'], action: 'Bring Forward' },
      { keys: ['Ctrl', '['], action: 'Send Backward' },
      { keys: ['Delete'], action: 'Delete' },
      { keys: ['Escape'], action: 'Deselect' },
      { keys: ['T'], action: 'Add Text' },
      { keys: ['R'], action: 'Add Rectangle' },
      { keys: ['?'], action: 'Show Shortcuts' },
    ]
  }
}
