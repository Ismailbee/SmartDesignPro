/**
 * SVG Layering System Demo
 * Complete examples showing how to use the professional layering system
 */

import Konva from 'konva'
import { SvgLayoutManager, TextPlaceholder, SvgAsset } from '../services/svg-layout.service'
import { TextEditingService } from '../services/text-editing.service'
import { createWeddingTemplate, createFreedomCeremonyTemplate } from '../services/wedding-template.preset'

/**
 * Example 1: Basic Setup
 * Minimal example to get started
 */
export async function basicSetupExample(container: HTMLDivElement) {
  // Create Konva stage
  const stage = new Konva.Stage({
    container,
    width: 1024,
    height: 576
  })

  // Initialize layout manager
  const layoutManager = new SvgLayoutManager(stage, {
    width: 1024,
    height: 576,
    backgroundColor: '#f5f5f5'
  })

  // Enable text editing
  const textEditor = new TextEditingService(stage)
  textEditor.enableTransformer(layoutManager.getLayers().text)

  // Load SVG background
  await layoutManager.loadSvgBackground('/templates/freedom-ceremony-preview.svg', 'cover')

  // Add a simple text
  layoutManager.addTextPlaceholder({
    id: 'title',
    text: 'Hello World',
    x: 0.5,
    y: 0.5,
    fontSize: 48,
    fill: '#183C54',
    align: 'center'
  })

  return { layoutManager, textEditor, stage }
}

/**
 * Example 2: Wedding Template
 * Pre-configured wedding ceremony design
 */
export async function weddingTemplateExample(container: HTMLDivElement) {
  const stage = new Konva.Stage({
    container,
    width: 1024,
    height: 576
  })

  const layoutManager = new SvgLayoutManager(stage, {
    width: 1024,
    height: 576
  })

  const textEditor = new TextEditingService(stage)
  textEditor.enableTransformer(layoutManager.getLayers().text)

  // Load wedding template
  await createWeddingTemplate(layoutManager, {
    backgroundUrl: '/templates/freedom-ceremony-preview.svg',
    mainMessage: 'Alhamdulillah on your wedding',
    coupleName: 'HANNATU MUSA',
    date: '28 September, 2025',
    outCeeName: 'OUT-CEE: MAI JAMA\'A FAMILY'
  })

  // Show alignment guides
  layoutManager.toggleGuides(true)

  return { layoutManager, textEditor, stage }
}

/**
 * Example 3: Freedom Ceremony Template
 * Complete freedom ceremony design with all elements
 */
export async function freedomCeremonyExample(container: HTMLDivElement) {
  const stage = new Konva.Stage({
    container,
    width: 1024,
    height: 576
  })

  const layoutManager = new SvgLayoutManager(stage, {
    width: 1024,
    height: 576
  })

  const textEditor = new TextEditingService(stage)
  textEditor.enableTransformer(layoutManager.getLayers().text)

  // Load freedom ceremony template
  await createFreedomCeremonyTemplate(layoutManager, {
    backgroundUrl: '/templates/freedom-ceremony-preview.svg',
    coupleName: 'HANNATU MUSA',
    date: '28th SEPTEMBER 2025',
    outCeeName: 'MAI JAMA\'A FAMILY'
  })

  return { layoutManager, textEditor, stage }
}

/**
 * Example 4: Custom Layout with Assets
 * Build a custom design with decorative elements
 */
export async function customLayoutWithAssetsExample(container: HTMLDivElement) {
  const stage = new Konva.Stage({
    container,
    width: 1024,
    height: 576
  })

  const layoutManager = new SvgLayoutManager(stage, {
    width: 1024,
    height: 576,
    backgroundColor: '#ffffff'
  })

  const textEditor = new TextEditingService(stage)
  textEditor.enableTransformer(layoutManager.getLayers().text)

  // Load background
  await layoutManager.loadSvgBackground('/templates/freedom-ceremony-preview.svg', 'cover')

  // Add main title
  layoutManager.addTextPlaceholder({
    id: 'main_title',
    text: 'Alhamdulillah',
    x: 0.5,
    y: 0.2,
    fontSize: 64,
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    fill: '#183C54',
    align: 'center'
  })

  // Add subtitle
  layoutManager.addTextPlaceholder({
    id: 'subtitle',
    text: 'ON YOUR SPECIAL DAY',
    x: 0.5,
    y: 0.35,
    fontSize: 24,
    fontFamily: 'Arial, sans-serif',
    fill: '#2C7A8C',
    align: 'center'
  })

  // Add couple names
  layoutManager.addTextPlaceholder({
    id: 'couple',
    text: 'HANNATU & MUSA',
    x: 0.5,
    y: 0.55,
    fontSize: 56,
    fontFamily: 'Arial Black, sans-serif',
    fontStyle: 'bold',
    fill: '#FFFFFF',
    align: 'center'
  })

  // Add date
  layoutManager.addTextPlaceholder({
    id: 'date',
    text: '28 September, 2025',
    x: 0.5,
    y: 0.7,
    fontSize: 32,
    fill: '#FFD700',
    align: 'center'
  })

  // Add decorative assets (if available)
  try {
    await layoutManager.addSvgAsset({
      id: 'star_left',
      url: '/assets/star.svg',
      x: 0.2,
      y: 0.2,
      scale: 0.3
    })

    await layoutManager.addSvgAsset({
      id: 'star_right',
      url: '/assets/star.svg',
      x: 0.8,
      y: 0.2,
      scale: 0.3
    })
  } catch (error) {
    console.log('Decorative assets not available')
  }

  return { layoutManager, textEditor, stage }
}

/**
 * Example 5: Programmatic Text Updates
 * Show how to update text dynamically
 */
export async function dynamicTextUpdateExample(container: HTMLDivElement) {
  const stage = new Konva.Stage({
    container,
    width: 1024,
    height: 576
  })

  const layoutManager = new SvgLayoutManager(stage, {
    width: 1024,
    height: 576
  })

  const textEditor = new TextEditingService(stage)
  textEditor.enableTransformer(layoutManager.getLayers().text)

  await layoutManager.loadSvgBackground('/templates/freedom-ceremony-preview.svg', 'cover')

  // Add text
  layoutManager.addTextPlaceholder({
    id: 'dynamic_text',
    text: 'Initial Text',
    x: 0.5,
    y: 0.5,
    fontSize: 48,
    fill: '#183C54',
    align: 'center'
  })

  // Update text after 2 seconds
  setTimeout(() => {
    layoutManager.updateText('dynamic_text', 'Updated Text!')
  }, 2000)

  // Update text color after 4 seconds
  setTimeout(() => {
    const textNode = layoutManager.getTextNode('dynamic_text')
    if (textNode) {
      textNode.fill('#DC143C')
      textNode.fontSize(64)
      textNode.getLayer()?.batchDraw()
    }
  }, 4000)

  return { layoutManager, textEditor, stage }
}

/**
 * Example 6: Export Functionality
 * Show how to export layouts and images
 */
export async function exportExample(container: HTMLDivElement) {
  const stage = new Konva.Stage({
    container,
    width: 1024,
    height: 576
  })

  const layoutManager = new SvgLayoutManager(stage, {
    width: 1024,
    height: 576
  })

  const textEditor = new TextEditingService(stage)
  textEditor.enableTransformer(layoutManager.getLayers().text)

  await createWeddingTemplate(layoutManager, {
    backgroundUrl: '/templates/freedom-ceremony-preview.svg',
    mainMessage: 'Alhamdulillah',
    coupleName: 'HANNATU MUSA',
    date: '28 September, 2025'
  })

  // Export as JSON
  const exportJSON = () => {
    const layout = layoutManager.exportLayout()
    console.log('Layout JSON:', layout)
    
    const blob = new Blob([JSON.stringify(layout, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'layout.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  // Export as PNG
  const exportPNG = () => {
    const dataURL = stage.toDataURL({
      pixelRatio: 3,
      mimeType: 'image/png'
    })
    
    const link = document.createElement('a')
    link.download = 'design.png'
    link.href = dataURL
    link.click()
  }

  // Export as JPG
  const exportJPG = () => {
    const dataURL = stage.toDataURL({
      pixelRatio: 3,
      mimeType: 'image/jpeg',
      quality: 0.95
    })
    
    const link = document.createElement('a')
    link.download = 'design.jpg'
    link.href = dataURL
    link.click()
  }

  return { layoutManager, textEditor, stage, exportJSON, exportPNG, exportJPG }
}

/**
 * Example 7: Responsive Canvas
 * Show how layout adapts to different sizes
 */
export async function responsiveCanvasExample(container: HTMLDivElement) {
  const stage = new Konva.Stage({
    container,
    width: 1024,
    height: 576
  })

  const layoutManager = new SvgLayoutManager(stage, {
    width: 1024,
    height: 576
  })

  const textEditor = new TextEditingService(stage)
  textEditor.enableTransformer(layoutManager.getLayers().text)

  await layoutManager.loadSvgBackground('/templates/freedom-ceremony-preview.svg', 'cover')

  layoutManager.addTextPlaceholder({
    id: 'responsive_text',
    text: 'Resize Me!',
    x: 0.5,
    y: 0.5,
    fontSize: 48,
    fill: '#183C54',
    align: 'center'
  })

  // Resize canvas after 3 seconds
  setTimeout(() => {
    stage.width(1920)
    stage.height(1080)
    // Text automatically repositions due to normalized coordinates!
  }, 3000)

  return { layoutManager, textEditor, stage }
}

/**
 * Utility: Create demo buttons
 */
export function createDemoControls(
  layoutManager: SvgLayoutManager,
  textEditor: TextEditingService,
  stage: Konva.Stage
) {
  const controls = document.createElement('div')
  controls.style.cssText = 'padding: 16px; background: #2a2a2a; display: flex; gap: 12px;'

  const addButton = (text: string, onClick: () => void) => {
    const btn = document.createElement('button')
    btn.textContent = text
    btn.style.cssText = 'padding: 8px 16px; background: #00D9FF; color: #000; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;'
    btn.onclick = onClick
    controls.appendChild(btn)
  }

  addButton('Toggle Guides', () => {
    const visible = layoutManager.getLayers().guides.visible()
    layoutManager.toggleGuides(!visible)
  })

  addButton('Export JSON', () => {
    const layout = layoutManager.exportLayout()
    console.log(layout)
  })

  addButton('Export PNG', () => {
    const dataURL = stage.toDataURL({ pixelRatio: 3 })
    const link = document.createElement('a')
    link.download = 'design.png'
    link.href = dataURL
    link.click()
  })

  addButton('Clear', () => {
    layoutManager.clear()
  })

  return controls
}

