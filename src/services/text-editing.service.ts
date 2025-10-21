/**
 * Text Editing Service
 * Professional inline text editing for Konva.js (like Canva)
 */

import Konva from 'konva'

export class TextEditingService {
  private stage: Konva.Stage
  private textarea: HTMLTextAreaElement | null = null
  private currentText: Konva.Text | null = null
  private transformer: Konva.Transformer | null = null

  constructor(stage: Konva.Stage) {
    this.stage = stage
    this.initializeTextarea()
    this.setupEventListeners()
  }

  /**
   * Create hidden textarea for inline editing
   */
  private initializeTextarea() {
    this.textarea = document.createElement('textarea')
    
    Object.assign(this.textarea.style, {
      position: 'absolute',
      zIndex: '1000',
      display: 'none',
      border: '2px solid #00D9FF',
      borderRadius: '4px',
      padding: '8px',
      fontSize: '16px',
      fontFamily: 'Arial',
      outline: 'none',
      resize: 'none',
      overflow: 'hidden',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
    })

    document.body.appendChild(this.textarea)
  }

  /**
   * Setup event listeners for text editing
   */
  private setupEventListeners() {
    // Double-click to edit text
    this.stage.on('dblclick', (e) => {
      const target = e.target
      if (target instanceof Konva.Text) {
        this.startEditing(target)
      }
    })

    // Click outside to commit changes
    window.addEventListener('click', (e) => {
      if (this.textarea && this.textarea.style.display === 'block') {
        if (e.target !== this.textarea) {
          this.commitEditing()
        }
      }
    })

    // Keyboard shortcuts
    if (this.textarea) {
      this.textarea.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          this.cancelEditing()
        } else if (e.key === 'Enter' && e.ctrlKey) {
          this.commitEditing()
        }
      })

      // Auto-resize textarea
      this.textarea.addEventListener('input', () => {
        this.autoResizeTextarea()
      })
    }
  }

  /**
   * Start editing a text node
   */
  private startEditing(textNode: Konva.Text) {
    if (!this.textarea) return

    this.currentText = textNode
    const stageBox = this.stage.container().getBoundingClientRect()
    const textPosition = textNode.getAbsolutePosition()

    // Position textarea over the text
    this.textarea.value = textNode.text()
    this.textarea.style.left = `${stageBox.left + textPosition.x}px`
    this.textarea.style.top = `${stageBox.top + textPosition.y}px`
    this.textarea.style.fontSize = `${textNode.fontSize()}px`
    this.textarea.style.fontFamily = textNode.fontFamily()
    this.textarea.style.fontStyle = textNode.fontStyle()
    this.textarea.style.color = textNode.fill()
    this.textarea.style.textAlign = textNode.align()
    this.textarea.style.width = textNode.width() ? `${textNode.width()}px` : 'auto'
    this.textarea.style.display = 'block'

    // Hide the original text
    textNode.hide()
    textNode.getLayer()?.batchDraw()

    // Focus and select all
    this.textarea.focus()
    this.textarea.select()

    this.autoResizeTextarea()
  }

  /**
   * Auto-resize textarea to fit content
   */
  private autoResizeTextarea() {
    if (!this.textarea) return

    this.textarea.style.height = 'auto'
    this.textarea.style.height = `${this.textarea.scrollHeight}px`
  }

  /**
   * Commit text changes
   */
  private commitEditing() {
    if (!this.textarea || !this.currentText) return

    this.currentText.text(this.textarea.value)
    this.currentText.show()
    this.currentText.getLayer()?.batchDraw()

    this.textarea.style.display = 'none'
    this.currentText = null
  }

  /**
   * Cancel editing without saving
   */
  private cancelEditing() {
    if (!this.textarea || !this.currentText) return

    this.currentText.show()
    this.currentText.getLayer()?.batchDraw()

    this.textarea.style.display = 'none'
    this.currentText = null
  }

  /**
   * Enable transformer for text selection and resizing
   */
  enableTransformer(layer: Konva.Layer) {
    this.transformer = new Konva.Transformer({
      nodes: [],
      keepRatio: false,
      enabledAnchors: ['middle-left', 'middle-right'],
      boundBoxFunc: (oldBox, newBox) => {
        // Limit minimum size
        if (newBox.width < 50) {
          return oldBox
        }
        return newBox
      }
    })

    layer.add(this.transformer)

    // Select text on click
    this.stage.on('click', (e) => {
      if (e.target instanceof Konva.Text) {
        this.transformer?.nodes([e.target])
        layer.batchDraw()
      } else if (e.target === this.stage) {
        this.transformer?.nodes([])
        layer.batchDraw()
      }
    })
  }

  /**
   * Cleanup
   */
  destroy() {
    if (this.textarea) {
      document.body.removeChild(this.textarea)
      this.textarea = null
    }
    if (this.transformer) {
      this.transformer.destroy()
      this.transformer = null
    }
  }
}

