/**
 * Wedding Template Preset
 * Pre-configured layout for wedding/ceremony designs
 */

import { SvgLayoutManager, TextPlaceholder, SvgAsset } from './svg-layout.service'

export interface WeddingTemplateConfig {
  backgroundUrl: string
  mainMessage?: string
  coupleName?: string
  date?: string
  outCeeName?: string
}

/**
 * Create a wedding ceremony template layout
 */
export async function createWeddingTemplate(
  layoutManager: SvgLayoutManager,
  config: WeddingTemplateConfig
) {
  // Load SVG background
  await layoutManager.loadSvgBackground(config.backgroundUrl, 'cover')

  // Add main message text (positioned in the lighter wave area)
  const mainText: TextPlaceholder = {
    id: 'main_text',
    text: config.mainMessage || 'Alhamdulillah on your wedding',
    x: 0.5, // Center horizontally
    y: 0.22, // Upper portion (lighter wave area)
    fontSize: 48,
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    fill: '#183C54', // Dark blue matching the waves
    align: 'center',
    width: 800,
    draggable: true,
    editable: true
  }

  // Add couple name text (positioned in the dark blue area)
  const coupleText: TextPlaceholder = {
    id: 'couple_name',
    text: config.coupleName || 'HANNATU  •  MUSA',
    x: 0.5, // Center horizontally
    y: 0.52, // Middle portion (dark blue area)
    fontSize: 64,
    fontFamily: 'Arial, sans-serif',
    fontStyle: 'bold',
    fill: '#FFFFFF', // White for contrast
    align: 'center',
    width: 900,
    draggable: true,
    editable: true
  }

  // Add date text (positioned below couple name)
  const dateText: TextPlaceholder = {
    id: 'date_text',
    text: config.date || '28 September, 2025',
    x: 0.5, // Center horizontally
    y: 0.68, // Lower portion
    fontSize: 36,
    fontFamily: 'Arial, sans-serif',
    fontStyle: 'normal',
    fill: '#FFD700', // Gold/yellow matching the accent
    align: 'center',
    width: 600,
    draggable: true,
    editable: true
  }

  // Add out-cee/family name (positioned at bottom)
  const outCeeText: TextPlaceholder = {
    id: 'outcee_text',
    text: config.outCeeName || 'OUT-CEE: MAI JAMA\'A FAMILY',
    x: 0.5, // Center horizontally
    y: 0.85, // Bottom portion
    fontSize: 24,
    fontFamily: 'Arial, sans-serif',
    fontStyle: 'normal',
    fill: '#FFFFFF',
    align: 'center',
    width: 700,
    draggable: true,
    editable: true
  }

  // Add all text placeholders
  layoutManager.addTextPlaceholder(mainText)
  layoutManager.addTextPlaceholder(coupleText)
  layoutManager.addTextPlaceholder(dateText)
  layoutManager.addTextPlaceholder(outCeeText)

  return layoutManager
}

/**
 * Freedom Ceremony Template (based on your original design)
 */
export async function createFreedomCeremonyTemplate(
  layoutManager: SvgLayoutManager,
  config: WeddingTemplateConfig
) {
  // Load SVG background
  await layoutManager.loadSvgBackground(config.backgroundUrl, 'cover')

  // "Alhamdulillah" in script font
  const alhamdulillahText: TextPlaceholder = {
    id: 'alhamdulillah_text',
    text: 'Alhamdulillah',
    x: 0.25,
    y: 0.15,
    fontSize: 32,
    fontFamily: 'Brush Script MT, cursive',
    fontStyle: 'italic',
    fill: '#183C54',
    align: 'left',
    draggable: true
  }

  // "ON YOUR" text
  const onYourText: TextPlaceholder = {
    id: 'on_your_text',
    text: 'ON YOUR',
    x: 0.25,
    y: 0.25,
    fontSize: 24,
    fontFamily: 'Arial, sans-serif',
    fill: '#183C54',
    align: 'left',
    draggable: true
  }

  // "FREEDOM" text (large blue)
  const freedomText: TextPlaceholder = {
    id: 'freedom_text',
    text: 'FREEDOM',
    x: 0.25,
    y: 0.35,
    fontSize: 72,
    fontFamily: 'Arial Black, sans-serif',
    fontStyle: 'bold',
    fill: '#183C54',
    align: 'left',
    draggable: true
  }

  // "CEREMONY" text (large red)
  const ceremonyText: TextPlaceholder = {
    id: 'ceremony_text',
    text: 'CEREMONY',
    x: 0.25,
    y: 0.48,
    fontSize: 72,
    fontFamily: 'Arial Black, sans-serif',
    fontStyle: 'bold',
    fill: '#DC143C',
    align: 'left',
    draggable: true
  }

  // First name (white)
  const firstNameText: TextPlaceholder = {
    id: 'first_name',
    text: config.coupleName?.split(' ')[0] || 'HANNATU',
    x: 0.25,
    y: 0.62,
    fontSize: 48,
    fontFamily: 'Arial, sans-serif',
    fontStyle: 'bold',
    fill: '#FFFFFF',
    align: 'left',
    draggable: true
  }

  // Last name (yellow)
  const lastNameText: TextPlaceholder = {
    id: 'last_name',
    text: config.coupleName?.split(' ')[1] || 'MUSA',
    x: 0.25,
    y: 0.72,
    fontSize: 48,
    fontFamily: 'Arial, sans-serif',
    fontStyle: 'bold',
    fill: '#FFD700',
    align: 'left',
    draggable: true
  }

  // Date badge text
  const dateBadgeText: TextPlaceholder = {
    id: 'date_badge',
    text: config.date || '28th\nSEPTEMBER\n2025',
    x: 0.75,
    y: 0.35,
    fontSize: 20,
    fontFamily: 'Arial, sans-serif',
    fontStyle: 'bold',
    fill: '#183C54',
    align: 'center',
    width: 150,
    draggable: true
  }

  // Out-Cee text
  const outCeeText: TextPlaceholder = {
    id: 'outcee_text',
    text: config.outCeeName || 'OUT-CEE:\nMAI JAMA\'A FAMILY',
    x: 0.25,
    y: 0.88,
    fontSize: 18,
    fontFamily: 'Arial, sans-serif',
    fill: '#FFFFFF',
    align: 'left',
    draggable: true
  }

  // Add all text placeholders
  layoutManager.addTextPlaceholder(alhamdulillahText)
  layoutManager.addTextPlaceholder(onYourText)
  layoutManager.addTextPlaceholder(freedomText)
  layoutManager.addTextPlaceholder(ceremonyText)
  layoutManager.addTextPlaceholder(firstNameText)
  layoutManager.addTextPlaceholder(lastNameText)
  layoutManager.addTextPlaceholder(dateBadgeText)
  layoutManager.addTextPlaceholder(outCeeText)

  return layoutManager
}

/**
 * Add decorative assets to the template
 */
export async function addDecorativeAssets(
  layoutManager: SvgLayoutManager,
  assets: SvgAsset[]
) {
  for (const asset of assets) {
    await layoutManager.addSvgAsset(asset)
  }
}

