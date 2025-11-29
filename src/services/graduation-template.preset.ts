/**
 * Graduation Template Preset
 * Advanced Konva-based layout for graduation stickers
 */

import { SvgLayoutManager, TextPlaceholder } from './svg-layout.service'

export interface GraduationTemplateConfig {
  backgroundUrl?: string
  studentName?: string
  schoolName?: string
  year?: string
  degree?: string
}

/**
 * Create a classic graduation template layout
 */
export async function createGraduationTemplate(
  layoutManager: SvgLayoutManager,
  config: GraduationTemplateConfig
) {
  // 1. Load Background (Gold/Black theme usually works well for graduation)
  // If no URL provided, we'll rely on the background color set in the manager
  if (config.backgroundUrl) {
    await layoutManager.loadSvgBackground(config.backgroundUrl, 'cover')
  }

  // 2. "CLASS OF" Text (Curved or arched usually, but standard for now)
  const classOfText: TextPlaceholder = {
    id: 'class_of_text',
    text: 'CLASS OF',
    x: 0.5,
    y: 0.15,
    fontSize: 24,
    fontFamily: 'Arial Black, sans-serif',
    fontStyle: 'bold',
    fill: '#FFD700', // Gold
    align: 'center',
    width: 300,
    draggable: true,
    editable: true
  }

  // 3. Year (Large)
  const yearText: TextPlaceholder = {
    id: 'year_text',
    text: config.year || '2025',
    x: 0.5,
    y: 0.28,
    fontSize: 80,
    fontFamily: 'Impact, sans-serif',
    fontStyle: 'bold',
    fill: '#FFFFFF', // White
    align: 'center',
    width: 400,
    draggable: true,
    editable: true
  }

  // 4. "CONGRATS" Banner
  const congratsText: TextPlaceholder = {
    id: 'congrats_text',
    text: 'CONGRATULATIONS',
    x: 0.5,
    y: 0.45,
    fontSize: 32,
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    fill: '#FFD700',
    align: 'center',
    width: 500,
    draggable: true,
    editable: true
  }

  // 5. Student Name (The star of the show)
  const nameText: TextPlaceholder = {
    id: 'student_name',
    text: config.studentName || 'STUDENT NAME',
    x: 0.5,
    y: 0.60,
    fontSize: 48,
    fontFamily: 'Arial, sans-serif',
    fontStyle: 'bold',
    fill: '#FFFFFF',
    align: 'center',
    width: 550,
    draggable: true,
    editable: true
  }

  // 6. School/Degree
  const schoolText: TextPlaceholder = {
    id: 'school_text',
    text: config.schoolName || 'University of Excellence',
    x: 0.5,
    y: 0.75,
    fontSize: 20,
    fontFamily: 'Arial, sans-serif',
    fontStyle: 'normal',
    fill: '#CCCCCC',
    align: 'center',
    width: 400,
    draggable: true,
    editable: true
  }

  // Add all placeholders to the manager
  layoutManager.addTextPlaceholder(classOfText)
  layoutManager.addTextPlaceholder(yearText)
  layoutManager.addTextPlaceholder(congratsText)
  layoutManager.addTextPlaceholder(nameText)
  layoutManager.addTextPlaceholder(schoolText)

  return layoutManager
}
