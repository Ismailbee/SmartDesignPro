/**
 * Form Utilities for StickerTemplatePanel
 * Extracted for better maintainability and file size reduction
 */

// Date extraction from description text
export function extractDateFromDescription(desc: string): string | null {
  const datePatterns = [
    /(\d{1,2}(?:st|nd|rd|th)?\s+(?:January|February|March|April|May|June|July|August|September|October|November|December)\s*,?\s*\d{4})/i,
    /(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2}(?:st|nd|rd|th)?\s*,?\s*\d{4}/i,
    /\d{4}-\d{2}-\d{2}/,
    /\d{1,2}\/\d{1,2}\/\d{4}/
  ]
  
  for (const pattern of datePatterns) {
    const match = desc.match(pattern)
    if (match) return match[0].trim()
  }
  return null
}

// Courtesy extraction from description text
export function extractCourtesyFromDescription(desc: string): { text: string, prefix: string } | null {
  const courtesyPattern = /courtesy:\s*([^\n]+?)(?:\s*$|\.|\n)/i
  const courtesyMatch = desc.match(courtesyPattern)
  if (courtesyMatch) return { text: courtesyMatch[1].trim(), prefix: 'Courtesy:' }
  
  const cutCeePattern = /cut-cee:\s*([^\n]+?)(?:\s*$|\.|\n)/i
  const cutCeeMatch = desc.match(cutCeePattern)
  if (cutCeeMatch) return { text: cutCeeMatch[1].trim(), prefix: 'CUT-CEE:' }
  
  return null
}

// Update date and courtesy in SVG elements
export function updateDateAndCourtesyUtil(description: string, svgElements: any): void {
  const dateText = extractDateFromDescription(description)
  if (dateText && svgElements.dateText) {
    svgElements.dateText.textContent = dateText
  }

  const courtesyData = extractCourtesyFromDescription(description)
  if (courtesyData && svgElements.courtesyText) {
    svgElements.courtesyText.textContent = `${courtesyData.prefix} ${courtesyData.text}`
  }
}

// Courtesy keyword autocomplete map
export const COURTESY_KEYWORDS = [
  { trigger: 'cour', complete: 'courtesy:' },
  { trigger: 'court', complete: 'courtesy:' },
  { trigger: 'courte', complete: 'courtesy:' },
  { trigger: 'courtes', complete: 'courtesy:' },
  { trigger: 'coutesy', complete: 'courtesy:' },
  { trigger: 'coutees', complete: 'courtesy:' },
  { trigger: 'cut', complete: 'cut-cee:' },
  { trigger: 'cutcee', complete: 'cut-cee:' },
  { trigger: 'cut-cee', complete: 'cut-cee:' },
  { trigger: 'cutc', complete: 'cut-cee:' },
]

// Handle description keydown events (auto-pair parentheses and autocomplete)
export function handleDescriptionKeydownUtil(
  event: KeyboardEvent,
  formDataDescription: string,
  setDescription: (val: string) => void
): void {
  const textarea = event.target as HTMLTextAreaElement
  const cursorPos = textarea.selectionStart
  const textBeforeCursor = formDataDescription.substring(0, cursorPos)
  
  // Auto-pair parentheses
  if (event.key === '(') {
    event.preventDefault()
    const textAfterCursor = formDataDescription.substring(cursorPos)
    setDescription(textBeforeCursor + '()' + textAfterCursor)
    setTimeout(() => {
      textarea.selectionStart = cursorPos + 1
      textarea.selectionEnd = cursorPos + 1
    }, 0)
    return
  }
  
  // Auto-complete courtesy keywords
  if (event.key === ' ' || event.key === 'Tab') {
    const lastWord = textBeforeCursor.split(/\s+/).pop()?.toLowerCase() || ''
    const match = COURTESY_KEYWORDS.find(k => lastWord === k.trigger)
    
    if (match) {
      event.preventDefault()
      const wordsBeforeLast = textBeforeCursor.substring(0, textBeforeCursor.length - lastWord.length)
      const textAfterCursor = formDataDescription.substring(cursorPos)
      setDescription(wordsBeforeLast + match.complete + ' ' + textAfterCursor)
      
      setTimeout(() => {
        const newPos = wordsBeforeLast.length + match.complete.length + 1
        textarea.selectionStart = newPos
        textarea.selectionEnd = newPos
      }, 0)
    }
  }
}

// Validation warning generator
export function generateValidationWarnings(
  data: { name1?: string | null, name2?: string | null, date?: string | null, courtesy?: string | null },
  description: string
): string[] {
  const warnings: string[] = []
  
  // Only show warnings if user has started typing
  if (description.trim()) {
    if (!data.date) {
      warnings.push('You did not include the date.')
    }
    if (!data.courtesy) {
      warnings.push('You did not include the courtesy.')
    }
    if (!data.name1 && !data.name2) {
      warnings.push('You did not include the name')
    }
  }
  
  return warnings
}

// Apply custom heading to SVG elements
export function applyCustomHeadingUtil(
  svgElement: SVGElement | null,
  customHeadingValue: string | null
): void {
  if (!svgElement || !customHeadingValue) {
    return
  }

  // If you want the decorative title to keep its original template sizing
  // (no auto-scale / auto-fit / auto-spacing), keep this enabled.
  const DISABLE_CUSTOM_TITLE_AUTOSIZE = true

  // Defensive: if multiple pipelines injected a title replacement, remove duplicates.
  // Keep a single best candidate (prefer a <g> with <text> nodes).
  const allReplacements = Array.from(svgElement.querySelectorAll('#wedding-title-replacement'))
  if (allReplacements.length > 1) {
    const preferred =
      (allReplacements.find(
        el => el.tagName.toLowerCase() === 'g' && (el as SVGGElement).querySelector('text')
      ) as Element | undefined) || allReplacements[0]

    allReplacements.forEach(el => {
      if (el !== preferred) el.remove()
    })
    console.warn('applyCustomHeadingUtil: removed duplicate #wedding-title-replacement nodes:', {
      before: allReplacements.length,
      keptTag: preferred?.tagName
    })
  }

  // Preferred: update the decorative title replacement (injected from /titles/alhamdulillah/t1.svg).
  const titleReplacement = svgElement.querySelector('#wedding-title-replacement') as SVGGElement | null
  if (titleReplacement) {
    // Ensure base title nodes stay hidden to avoid any overlap.
    ;['blessing-text', 'occasion-text', 'event-type-text', 'ceremony-text'].forEach(id => {
      const el = svgElement.querySelector(`#${id}`) as SVGElement | null
      if (el) el.setAttribute('display', 'none')
    })

    const titleTexts = Array.from(titleReplacement.querySelectorAll('text')) as SVGTextElement[]

    const tokens = customHeadingValue.trim().split(/\s+/).filter(Boolean)
    const upperTokens = tokens.map(t => t.toUpperCase())
    const tokenCountAll = upperTokens.length

    // Most title SVGs we inject have 4 positioned <text> nodes (top -> bottom).
    // Treat them as 4 LINES, not 4 WORDS, to avoid layout overlap.
    if (titleTexts.length >= 4) {
      // Reset any prior per-line y adjustments to keep edits stable.
      titleTexts.slice(0, 4).forEach(t => {
        const currentY = t.getAttribute('y')
        if (!t.getAttribute('data-orig-y')) {
          t.setAttribute('data-orig-y', currentY ?? '')
        }
        const origY = t.getAttribute('data-orig-y')
        if (origY === null) return
        if (origY === '') t.removeAttribute('y')
        else t.setAttribute('y', origY)
        t.removeAttribute('display')

        const currentFontSize = t.getAttribute('font-size')
        if (!t.getAttribute('data-orig-font-size') && currentFontSize) {
          t.setAttribute('data-orig-font-size', currentFontSize)
        }

        // Reset font-size back to original on each run so scaling doesn't accumulate.
        const origFontSize = t.getAttribute('data-orig-font-size')
        if (origFontSize) {
          t.setAttribute('font-size', origFontSize)
        }
      })

      let line1 = tokens[0] || ''
      let line2 = ''
      let line3 = ''
      let line4 = ''

      const idxWedding = upperTokens.indexOf('WEDDING')
      const idxCeremony = upperTokens.indexOf('CEREMONY')

      if (idxWedding >= 0) {
        line3 = 'WEDDING'

        // Prefer keeping "ON YOUR" together on line2.
        const beforeWedding = upperTokens.slice(1, idxWedding)
        const onIdx = beforeWedding.indexOf('ON')
        if (onIdx >= 0 && beforeWedding[onIdx + 1] === 'YOUR') {
          line2 = 'ON YOUR'
        } else {
          line2 = beforeWedding.join(' ')
        }

        const afterWedding = upperTokens.slice(idxWedding + 1).filter(t => t !== 'CEREMONY')
        if (afterWedding.length > 0) {
          line4 = afterWedding.join(' ')
        } else if (idxCeremony >= 0) {
          line4 = 'CEREMONY'
        }
      } else {
        // Generic fallback for non-wedding headings.
        if (upperTokens.length === 1) {
          line2 = ''
          line3 = ''
          line4 = ''
        } else if (upperTokens.length === 2) {
          line2 = upperTokens[1]
          line3 = ''
          line4 = ''
        } else if (upperTokens.length === 3) {
          line2 = upperTokens[1]
          line3 = upperTokens[2]
          line4 = ''
        } else {
          line2 = upperTokens.slice(1, -1).join(' ')
          line3 = upperTokens[upperTokens.length - 1]
          line4 = ''
        }
      }

      titleTexts[0].textContent = line1
      titleTexts[1].textContent = line2
      titleTexts[2].textContent = line3
      titleTexts[3].textContent = line4

      // Hide unused lines so short headings don't look "spaced out".
      const lines = [line1, line2, line3, line4]
      titleTexts.slice(0, 4).forEach((t, i) => {
        if (!lines[i]?.trim()) t.setAttribute('display', 'none')
        else t.removeAttribute('display')
      })

      // If the heading is very short (e.g., 1–3 words like "Together Forever"),
      // scale up the decorative title text so it doesn't look tiny.
      // We ONLY do this for non-standard headings (i.e., no explicit WEDDING layout).
      if (idxWedding < 0) {
        if (DISABLE_CUSTOM_TITLE_AUTOSIZE) {
          // Keep original font sizes and y positions.
        } else {
        const tokenCount = upperTokens.length
        let fontScale = 1

        // Defaults for short titles so they look like a headline (without becoming oversized).
        if (tokenCount <= 1) fontScale = 2.2
        else if (tokenCount === 2) fontScale = 1.85
        else if (tokenCount === 3) fontScale = 1.45

        // Apply scale to visible lines only, restoring original sizes otherwise.
        titleTexts.slice(0, 4).forEach((t, i) => {
          const orig = t.getAttribute('data-orig-font-size')
          if (!orig) return

          const origNum = Number(orig)
          if (!Number.isFinite(origNum) || origNum <= 0) return

          if (!lines[i]?.trim()) {
            t.setAttribute('font-size', String(origNum))
            return
          }

          const scaled = Math.min(origNum * fontScale, origNum * 2.2)
          t.setAttribute('font-size', String(scaled))
        })

        // Auto-fit: scale the visible lines up to fill the available decorative-title width.
        // This makes short headings like "Together Forever" look intentionally bold.
        const vb = titleReplacement.getAttribute('data-title-viewbox') || ''
        const vbParts = vb.split(/\s+|,/).map(v => Number(v)).filter(v => Number.isFinite(v))
        if (vbParts.length >= 4) {
          const vbW = vbParts[2]
          // Fill more of the available width for short titles.
          const targetWidth = vbW * 0.88

          // Measure the widest visible line.
          let maxLineWidth = 0
          titleTexts.slice(0, 4).forEach((t, i) => {
            if (!lines[i]?.trim()) return
            try {
              const bbox = t.getBBox()
              if (Number.isFinite(bbox.width)) {
                maxLineWidth = Math.max(maxLineWidth, bbox.width)
              }
            } catch {
              // Some browsers can throw if the element isn't renderable yet.
            }
          })

          if (maxLineWidth > 0) {
            // Compute an additional scale factor and clamp to avoid absurd sizes.
            const extraScale = Math.max(1, Math.min(targetWidth / maxLineWidth, 3.0))

            titleTexts.slice(0, 4).forEach((t, i) => {
              if (!lines[i]?.trim()) return
              const current = Number(t.getAttribute('font-size') || '')
              if (!Number.isFinite(current) || current <= 0) return
              t.setAttribute('font-size', String(current * extraScale))
            })

            // Keep line spacing proportional after scaling so 2-line titles don't overlap.
            // We use the original y deltas (from the injected SVG) and scale them by the
            // effective font-size scale factor.
            const effectiveScale = extraScale * fontScale
            let prevVisibleIndex: number | null = null
            let prevOrigY: number | null = null
            let prevNewY: number | null = null

            for (let i = 0; i < 4; i++) {
              if (!lines[i]?.trim()) continue
              const t = titleTexts[i]
              const origYRaw = t.getAttribute('data-orig-y') ?? t.getAttribute('y')
              const origY = origYRaw ? Number(origYRaw) : NaN
              if (!Number.isFinite(origY)) continue

              if (prevVisibleIndex === null) {
                // Keep the first visible line at its original y.
                t.setAttribute('y', String(origY))
                prevVisibleIndex = i
                prevOrigY = origY
                prevNewY = origY
                continue
              }

              if (prevOrigY === null || prevNewY === null) continue
              const origDelta = origY - prevOrigY
              const newY = prevNewY + origDelta * effectiveScale
              t.setAttribute('y', String(newY))

              prevVisibleIndex = i
              prevOrigY = origY
              prevNewY = newY
            }

            // Special-case: for 2-word headings like "Together Forever", the original
            // template's line spacing is very wide (and scaling it makes it *huge*).
            // Use a tighter, font-size-based gap so the two words sit together.
            if (tokenCount === 2 && lines[0]?.trim() && lines[1]?.trim()) {
              const t0 = titleTexts[0]
              const t1 = titleTexts[1]

              const y0Raw = t0.getAttribute('y') ?? t0.getAttribute('data-orig-y')
              const y0 = y0Raw ? Number(y0Raw) : NaN
              const fs0 = Number(t0.getAttribute('font-size') || '')
              const fs1 = Number(t1.getAttribute('font-size') || '')

              if (Number.isFinite(y0) && Number.isFinite(fs0) && Number.isFinite(fs1)) {
                const maxFs = Math.max(fs0, fs1)

                // Prefer a bbox/line-height derived gap (tighter than font-size).
                let measuredHeight = 0
                try {
                  measuredHeight = Math.max(t0.getBBox().height || 0, t1.getBBox().height || 0)
                } catch {
                  // getBBox can fail if not renderable; we'll fall back below.
                }

                const baseGap = measuredHeight > 0 ? measuredHeight * 0.9 : maxFs * 0.65
                const gap = Math.max(18, Math.min(baseGap, maxFs * 0.8))
                t0.setAttribute('y', String(y0))
                t1.setAttribute('y', String(y0 + gap))
              }
            }
          }
        }
        }
      }

      // If the second line is blank, move the first line down a bit
      // so it doesn't look too far away from the main title word.
      if (!DISABLE_CUSTOM_TITLE_AUTOSIZE) {
        if (!line2.trim() && line3.trim()) {
          const y2 = titleTexts[1].getAttribute('y')
          if (y2) titleTexts[0].setAttribute('y', y2)
        } else if (line1.trim() && line2.trim() && !(idxWedding < 0 && tokenCountAll === 2)) {
          // If both line1 and line2 are present, add a bit more breathing room.
          const origY1Raw = titleTexts[0].getAttribute('data-orig-y') ?? titleTexts[0].getAttribute('y')
          const origY1 = origY1Raw ? Number(origY1Raw) : NaN
          if (Number.isFinite(origY1)) {
            titleTexts[0].setAttribute('y', String(origY1 - 12))
          }
        }
      }

      // Center-align custom headings so short words (e.g., "Happy") don't look left-shifted.
      // We use the injected title SVG's viewBox width to compute a stable center X.
      const vb = titleReplacement.getAttribute('data-title-viewbox') || ''
      const vbParts = vb.split(/\s+|,/).map(v => Number(v)).filter(v => Number.isFinite(v))
      if (vbParts.length >= 4) {
        const vbX = vbParts[0]
        const vbW = vbParts[2]
        const centerX = vbX + vbW / 2
        titleTexts.slice(0, 4).forEach(t => {
          t.setAttribute('text-anchor', 'middle')
          t.setAttribute('x', String(centerX))
        })
      }

    } else if (titleTexts.length > 0) {
      // Fallback: set full heading on first line, clear others.
      titleTexts[0].textContent = customHeadingValue
      titleTexts.slice(1).forEach(t => (t.textContent = ''))
    } else {
      console.warn('applyCustomHeadingUtil: #wedding-title-replacement has no <text> nodes')
    }
    return
  }
  
  const blessingText = svgElement.querySelector('#blessing-text') as SVGTextElement
  const occasionText = svgElement.querySelector('#occasion-text') as SVGTextElement
  const eventTypeText = svgElement.querySelector('#event-type-text') as SVGTextElement
  const ceremonyText = svgElement.querySelector('#ceremony-text') as SVGTextElement
  
  // Some templates may keep these nodes but hide them.
  ;[blessingText, occasionText, eventTypeText, ceremonyText].forEach(el => {
    if (el) {
      el.removeAttribute('display')
      ;(el as any).style && ((el as any).style.display = '')
    }
  })

  const headingParts = customHeadingValue.split(/\s+/)

  if (headingParts.length >= 4 && blessingText && occasionText && eventTypeText && ceremonyText) {
    blessingText.textContent = headingParts[0]
    occasionText.textContent = headingParts[1].toUpperCase()
    eventTypeText.textContent = headingParts[2].toUpperCase()
    ceremonyText.textContent = headingParts.slice(3).join(' ').toUpperCase()
  } else if (headingParts.length === 3 && blessingText && occasionText && eventTypeText) {
    blessingText.textContent = headingParts[0]
    occasionText.textContent = headingParts[1].toUpperCase()
    eventTypeText.textContent = headingParts[2].toUpperCase()
    if (ceremonyText) ceremonyText.textContent = ''
  } else if (headingParts.length === 2 && blessingText && occasionText) {
    blessingText.textContent = headingParts[0]
    occasionText.textContent = headingParts[1].toUpperCase()
    if (eventTypeText) eventTypeText.textContent = ''
    if (ceremonyText) ceremonyText.textContent = ''
  } else if (headingParts.length === 1 && blessingText) {
    blessingText.textContent = headingParts[0]
    if (occasionText) occasionText.textContent = ''
    if (eventTypeText) eventTypeText.textContent = ''
    if (ceremonyText) ceremonyText.textContent = ''
  } else {
    console.warn('applyCustomHeadingUtil: could not apply heading - missing expected title text elements', {
      hasBlessing: !!blessingText,
      hasOccasion: !!occasionText,
      hasEventType: !!eventTypeText,
      hasCeremony: !!ceremonyText
    })
  }
}

// Apply heading font to SVG elements
export function applyHeadingFontUtil(
  svgElement: SVGElement | null,
  selectedFont: 'playfair' | 'lato' | null
): void {
  if (!svgElement || !selectedFont) return
  
  const fontFamily = selectedFont === 'playfair'
    ? "'Playfair Display', Georgia, serif"
    : "'Lato', 'Helvetica Neue', Arial, sans-serif"
  
  const fontWeight = selectedFont === 'playfair' ? '700' : '400'
  
  const headingElements = [
    svgElement.querySelector('#blessing-text'),
    svgElement.querySelector('#occasion-text'),
    svgElement.querySelector('#event-type-text'),
    svgElement.querySelector('#ceremony-text')
  ].filter(Boolean) as Element[]
  
  headingElements.forEach(el => {
    (el as HTMLElement).style.fontFamily = fontFamily;
    (el as HTMLElement).style.fontWeight = fontWeight
  })
}
