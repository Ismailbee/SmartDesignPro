/**
 * SVG Layout Service
 * Professional-grade SVG background and text layering for Konva.js
 * Inspired by Canva and Fotor's layering architecture
 */

import Konva from 'konva'

export interface TextPlaceholder {
  id: string
  text: string
  x: number // Normalized 0-1
  y: number // Normalized 0-1
  fontSize: number
  fontFamily?: string
  fontStyle?: string
  fill: string
  align?: string
  width?: number
  draggable?: boolean
  editable?: boolean
}

export interface SvgAsset {
  id: string
  url: string
  x: number // Normalized 0-1
  y: number // Normalized 0-1
  scale: number
  draggable?: boolean
  rotation?: number
}

export interface LayoutConfig {
  width: number
  height: number
  backgroundColor?: string
}

/**
 * SVG Layout Manager
 * Manages layers, backgrounds, and text positioning like professional editors
 */
export class SvgLayoutManager {
  private stage: Konva.Stage
  private backgroundLayer: Konva.Layer
  private assetsLayer: Konva.Layer
  private textLayer: Konva.Layer
  private guidesLayer: Konva.Layer
  private config: LayoutConfig
  private textNodes: Map<string, Konva.Text> = new Map()
  private assetNodes: Map<string, Konva.Image> = new Map()

  constructor(stage: Konva.Stage, config: LayoutConfig) {
    this.stage = stage
    this.config = config

    // Create layers in professional order (bottom to top)
    this.backgroundLayer = new Konva.Layer({ name: 'background', listening: false })
    this.assetsLayer = new Konva.Layer({ name: 'assets' })
    this.textLayer = new Konva.Layer({ name: 'text' })
    this.guidesLayer = new Konva.Layer({ name: 'guides', visible: false })

    // Add layers to stage
    this.stage.add(this.backgroundLayer)
    this.stage.add(this.assetsLayer)
    this.stage.add(this.textLayer)
    this.stage.add(this.guidesLayer)

    // Set stage size
    this.stage.width(config.width)
    this.stage.height(config.height)

    // Add background color if specified
    if (config.backgroundColor) {
      this.addBackgroundColor(config.backgroundColor)
    }

    // Initialize guides
    this.createGuides()
  }

  /**
   * Add background color rectangle
   */
  private addBackgroundColor(color: string) {
    const rect = new Konva.Rect({
      x: 0,
      y: 0,
      width: this.config.width,
      height: this.config.height,
      fill: color,
      listening: false
    })
    this.backgroundLayer.add(rect)
    this.backgroundLayer.batchDraw()
  }

  /**
   * Load SVG background (like Canva's background layer)
   */
  async loadSvgBackground(url: string, fit: 'cover' | 'contain' | 'fill' = 'cover'): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      
      img.onload = () => {
        const { scale, x, y } = this.calculateImageFit(img.width, img.height, fit)
        
        const konvaImage = new Konva.Image({
          id: 'svg-background',
          image: img,
          x,
          y,
          scaleX: scale,
          scaleY: scale,
          listening: false // Background should not be interactive
        })

        this.backgroundLayer.add(konvaImage)
        this.backgroundLayer.batchDraw()
        resolve()
      }

      img.onerror = () => reject(new Error(`Failed to load SVG: ${url}`))
      img.src = url
    })
  }

  /**
   * Calculate image fit (cover/contain/fill) like CSS object-fit
   */
  private calculateImageFit(imgWidth: number, imgHeight: number, fit: 'cover' | 'contain' | 'fill') {
    const stageWidth = this.config.width
    const stageHeight = this.config.height
    const imgRatio = imgWidth / imgHeight
    const stageRatio = stageWidth / stageHeight

    let scale = 1
    let x = 0
    let y = 0

    if (fit === 'cover') {
      // Fill entire stage, crop if needed
      scale = Math.max(stageWidth / imgWidth, stageHeight / imgHeight)
      x = (stageWidth - imgWidth * scale) / 2
      y = (stageHeight - imgHeight * scale) / 2
    } else if (fit === 'contain') {
      // Fit inside stage, show all content
      scale = Math.min(stageWidth / imgWidth, stageHeight / imgHeight)
      x = (stageWidth - imgWidth * scale) / 2
      y = (stageHeight - imgHeight * scale) / 2
    } else {
      // Fill - stretch to fit
      scale = stageWidth / imgWidth
      // For fill, we'd need different scaleX and scaleY
    }

    return { scale, x, y }
  }

  /**
   * Add text placeholder with professional positioning
   */
  addTextPlaceholder(config: TextPlaceholder): Konva.Text {
    const text = new Konva.Text({
      id: config.id,
      text: config.text,
      fontSize: config.fontSize,
      fontFamily: config.fontFamily || 'Arial',
      fontStyle: config.fontStyle || 'normal',
      fill: config.fill,
      align: config.align || 'center',
      width: config.width,
      draggable: config.draggable !== false,
      listening: true
    })

    // Position using normalized coordinates
    this.positionNode(text, config.x, config.y)

    // Center the text on its position
    if (config.align === 'center') {
      text.offsetX(text.width() / 2)
    }

    this.textLayer.add(text)
    this.textNodes.set(config.id, text)
    this.textLayer.batchDraw()

    return text
  }

  /**
   * Add SVG asset (ribbon, icon, decoration)
   */
  async addSvgAsset(config: SvgAsset): Promise<Konva.Image> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'

      img.onload = () => {
        const konvaImage = new Konva.Image({
          id: config.id,
          image: img,
          scaleX: config.scale,
          scaleY: config.scale,
          rotation: config.rotation || 0,
          draggable: config.draggable !== false,
          listening: true
        })

        // Position using normalized coordinates
        this.positionNode(konvaImage, config.x, config.y)

        // Center the asset on its position
        konvaImage.offsetX(img.width / 2)
        konvaImage.offsetY(img.height / 2)

        this.assetsLayer.add(konvaImage)
        this.assetNodes.set(config.id, konvaImage)
        this.assetsLayer.batchDraw()

        resolve(konvaImage)
      }

      img.onerror = () => reject(new Error(`Failed to load asset: ${config.url}`))
      img.src = config.url
    })
  }

  /**
   * Position node using normalized coordinates (0-1)
   */
  private positionNode(node: Konva.Node, normalizedX: number, normalizedY: number) {
    node.x(this.config.width * normalizedX)
    node.y(this.config.height * normalizedY)
  }

  /**
   * Create alignment guides (like Canva)
   */
  private createGuides() {
    const centerX = this.config.width / 2
    const centerY = this.config.height / 2

    // Vertical center guide
    const vLine = new Konva.Line({
      points: [centerX, 0, centerX, this.config.height],
      stroke: '#00D9FF',
      strokeWidth: 1,
      dash: [5, 5],
      listening: false
    })

    // Horizontal center guide
    const hLine = new Konva.Line({
      points: [0, centerY, this.config.width, centerY],
      stroke: '#00D9FF',
      strokeWidth: 1,
      dash: [5, 5],
      listening: false
    })

    this.guidesLayer.add(vLine, hLine)
  }

  /**
   * Show/hide alignment guides
   */
  toggleGuides(visible: boolean) {
    this.guidesLayer.visible(visible)
    this.guidesLayer.batchDraw()
  }

  /**
   * Get text node by ID
   */
  getTextNode(id: string): Konva.Text | undefined {
    return this.textNodes.get(id)
  }

  /**
   * Get asset node by ID
   */
  getAssetNode(id: string): Konva.Image | undefined {
    return this.assetNodes.get(id)
  }

  /**
   * Update text content
   */
  updateText(id: string, newText: string) {
    const textNode = this.textNodes.get(id)
    if (textNode) {
      textNode.text(newText)
      this.textLayer.batchDraw()
    }
  }

  /**
   * Get all layers
   */
  getLayers() {
    return {
      background: this.backgroundLayer,
      assets: this.assetsLayer,
      text: this.textLayer,
      guides: this.guidesLayer
    }
  }

  /**
   * Export current layout as JSON
   */
  exportLayout() {
    return {
      config: this.config,
      texts: Array.from(this.textNodes.entries()).map(([id, node]) => ({
        id,
        text: node.text(),
        x: node.x() / this.config.width,
        y: node.y() / this.config.height,
        fontSize: node.fontSize(),
        fill: node.fill()
      })),
      assets: Array.from(this.assetNodes.entries()).map(([id, node]) => ({
        id,
        x: node.x() / this.config.width,
        y: node.y() / this.config.height,
        scale: node.scaleX(),
        rotation: node.rotation()
      }))
    }
  }

  /**
   * Clear all content
   */
  clear() {
    this.backgroundLayer.destroyChildren()
    this.assetsLayer.destroyChildren()
    this.textLayer.destroyChildren()
    this.textNodes.clear()
    this.assetNodes.clear()
    this.stage.batchDraw()
  }
}

