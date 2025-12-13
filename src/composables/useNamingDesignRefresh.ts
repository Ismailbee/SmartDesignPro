/**
 * Naming Design Refresh System
 *
 * Handles one-click design transformation between multiple themes
 * while preserving user information (names, dates, courtesy, etc.)
 *
 * Design Themes:
 * - Elegant: Classic serif, gold accents
 * - Modern: Clean sans-serif, minimal design
 * - Bold: Strong typography, vibrant colors
 * - Artistic: Hand-drawn style, decorative elements
 * - Minimal: Ultra-clean, negative space focus
 */

export interface DesignTheme {
  id: string
  name: string
  description: string
  fontFamily: string
  fontSize: number
  primaryColor: string
  secondaryColor: string
  backgroundColor: string
  style: 'elegant' | 'modern' | 'bold' | 'artistic' | 'minimal'
}

export function useNamingDesignRefresh() {
  const designThemes: DesignTheme[] = [
    {
      id: 'elegant',
      name: 'Elegant',
      description: 'Classic serif with gold accents',
      fontFamily: 'Cinzel Decorative',
      fontSize: 84,
      primaryColor: '#2d1b00',
      secondaryColor: '#b8860b',
      backgroundColor: '#fffacd',
      style: 'elegant'
    },
    {
      id: 'modern',
      name: 'Modern',
      description: 'Clean and minimal aesthetic',
      fontFamily: 'Montserrat',
      fontSize: 72,
      primaryColor: '#1a1a1a',
      secondaryColor: '#4f46e5',
      backgroundColor: '#f8f9fa',
      style: 'modern'
    },
    {
      id: 'bold',
      name: 'Bold',
      description: 'Strong and vibrant design',
      fontFamily: 'Arial Black',
      fontSize: 96,
      primaryColor: '#ffffff',
      secondaryColor: '#ff6b6b',
      backgroundColor: '#2c3e50',
      style: 'bold'
    },
    {
      id: 'artistic',
      name: 'Artistic',
      description: 'Decorative and hand-drawn style',
      fontFamily: 'Great Day Personal Use',
      fontSize: 68,
      primaryColor: '#4a3728',
      secondaryColor: '#d4a574',
      backgroundColor: '#f5e6d3',
      style: 'artistic'
    },
    {
      id: 'minimal',
      name: 'Minimal',
      description: 'Ultra-clean with negative space',
      fontFamily: 'Georgia',
      fontSize: 64,
      primaryColor: '#333333',
      secondaryColor: '#999999',
      backgroundColor: '#ffffff',
      style: 'minimal'
    }
  ]

  /**
   * Get all available design themes
   */
  const getDesignThemes = (): DesignTheme[] => {
    return designThemes
  }

  /**
   * Get a specific theme by ID
   */
  const getThemeById = (themeId: string): DesignTheme | undefined => {
    return designThemes.find(t => t.id === themeId)
  }

  /**
   * Apply a design theme to SVG content
   * Transforms the visual style while preserving all text content
   */
  const applyThemeToSVG = (
    svgContent: string,
    themeId: string,
    preserveText: boolean = true
  ): string => {
    const theme = getThemeById(themeId)
    if (!theme) {
      console.error(`Theme not found: ${themeId}`)
      return svgContent
    }

    let modifiedSVG = svgContent

    // 1. Update text elements with theme colors and fonts
    const textRegex = /(<text[^>]*)(fill="[^"]*")?([^>]*>)/g
    modifiedSVG = modifiedSVG.replace(textRegex, (match, before, fill, after) => {
      let newAttr = before
      // Add font-family if not present
      if (!newAttr.includes('font-family')) {
        newAttr += ` font-family="${theme.fontFamily}"`
      } else {
        newAttr = newAttr.replace(/font-family="[^"]*"/g, `font-family="${theme.fontFamily}"`)
      }

      // Add font-size if not present
      if (!newAttr.includes('font-size')) {
        newAttr += ` font-size="${theme.fontSize}"`
      } else {
        newAttr = newAttr.replace(/font-size="[^"]*"/g, `font-size="${theme.fontSize}"`)
      }

      // Update fill color
      if (fill) {
        newAttr = newAttr + fill.replace(/fill="[^"]*"/, `fill="${theme.primaryColor}"`)
      } else {
        newAttr += ` fill="${theme.primaryColor}"`
      }

      return newAttr + after
    })

    // 2. Update background/rectangle elements
    const rectRegex = /(<rect[^>]*)(fill="[^"]*")?([^>]*>)/g
    modifiedSVG = modifiedSVG.replace(rectRegex, (match, before, fill) => {
      if (before.includes('id="background"') || before.includes('class="background')) {
        return before + ` fill="${theme.backgroundColor}"` + '>'
      }
      return match
    })

    // 3. Update style definitions
    modifiedSVG = modifyStyleDefinitions(modifiedSVG, theme)

    // 4. Add theme identifier comment for tracking
    modifiedSVG = modifiedSVG.replace(
      /<svg/,
      `<!-- Theme: ${theme.id} (${theme.name}) -->\n<svg`
    )

    console.log(`✅ Applied theme "${theme.name}" (${theme.id})`)
    return modifiedSVG
  }

  /**
   * Modify CSS style definitions in SVG to apply theme
   */
  const modifyStyleDefinitions = (svgContent: string, theme: DesignTheme): string => {
    let modified = svgContent

    // Update style definitions for text elements
    const styleRegex = /(<style[^>]*>)([\s\S]*?)(<\/style>)/g
    modified = modified.replace(styleRegex, (match, openTag, styleContent, closeTag) => {
      let newStyle = styleContent

      // Replace font-family
      newStyle = newStyle.replace(
        /font-family:\s*[^;]+;/g,
        `font-family: ${theme.fontFamily};`
      )

      // Replace font-size
      newStyle = newStyle.replace(
        /font-size:\s*[^;]+;/g,
        `font-size: ${theme.fontSize}px;`
      )

      // Replace fill/color
      newStyle = newStyle.replace(
        /fill:\s*[^;]+;/g,
        `fill: ${theme.primaryColor};`
      )

      // Add secondary color to specific classes if they exist
      if (newStyle.includes('.secondary')) {
        newStyle = newStyle.replace(
          /\.secondary[^{]*{[^}]*fill:\s*[^;]+;/g,
          `.secondary { fill: ${theme.secondaryColor};`
        )
      }

      return openTag + newStyle + closeTag
    })

    return modified
  }

  /**
   * Refresh design by switching to a different theme
   * Maintains all text content and user information
   */
  const refreshDesignTheme = async (
    currentSVGContent: string,
    newThemeId: string,
    description: string = ''
  ): Promise<string> => {
    try {
      console.log(`🎨 Refreshing design to theme: ${newThemeId}`)

      // Apply new theme to SVG
      const refreshedSVG = applyThemeToSVG(currentSVGContent, newThemeId, true)

      console.log(`✅ Design refreshed successfully`)
      return refreshedSVG
    } catch (error) {
      console.error('Error refreshing design theme:', error)
      throw error
    }
  }

  /**
   * Get theme-specific SVG template
   * Returns a base SVG for a given theme ready to be populated with user data
   */
  const loadThemeTemplate = async (themeId: string): Promise<string> => {
    const theme = getThemeById(themeId)
    if (!theme) {
      throw new Error(`Theme not found: ${themeId}`)
    }

    try {
      const response = await fetch(`/svg/naming/${themeId}/template.svg`)
      if (!response.ok) {
        throw new Error(`Failed to load template: ${response.statusText}`)
      }

      let svgContent = await response.text()

      // Apply theme properties to loaded template
      svgContent = applyThemeToSVG(svgContent, themeId)

      return svgContent
    } catch (error) {
      console.error(`Error loading theme template for ${themeId}:`, error)
      throw error
    }
  }

  /**
   * Get a list of theme variations for quick switching
   */
  const getThemeVariations = (baseThemeId: string): DesignTheme[] => {
    const baseTheme = getThemeById(baseThemeId)
    if (!baseTheme) return []

    // Return all themes as variations
    return designThemes
  }

  /**
   * Create a custom theme based on existing theme
   */
  const createCustomTheme = (
    baseThemeId: string,
    customizations: Partial<DesignTheme>
  ): DesignTheme => {
    const baseTheme = getThemeById(baseThemeId)
    if (!baseTheme) {
      throw new Error(`Base theme not found: ${baseThemeId}`)
    }

    return {
      ...baseTheme,
      id: `custom-${Date.now()}`,
      name: customizations.name || `${baseTheme.name} Custom`,
      ...customizations
    }
  }

  /**
   * Export theme configuration as JSON
   */
  const exportTheme = (themeId: string): string => {
    const theme = getThemeById(themeId)
    if (!theme) {
      throw new Error(`Theme not found: ${themeId}`)
    }

    return JSON.stringify(theme, null, 2)
  }

  /**
   * Import theme from JSON configuration
   */
  const importTheme = (jsonConfig: string): DesignTheme => {
    try {
      const theme = JSON.parse(jsonConfig) as DesignTheme
      // Validate required fields
      if (!theme.id || !theme.name || !theme.fontFamily) {
        throw new Error('Invalid theme configuration')
      }
      return theme
    } catch (error) {
      console.error('Error importing theme:', error)
      throw error
    }
  }

  return {
    getDesignThemes,
    getThemeById,
    getThemeVariations,
    applyThemeToSVG,
    refreshDesignTheme,
    loadThemeTemplate,
    createCustomTheme,
    exportTheme,
    importTheme
  }
}
