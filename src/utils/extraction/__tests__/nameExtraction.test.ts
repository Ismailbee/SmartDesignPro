/**
 * Name Extraction Test
 * 
 * Run with: npx vitest run src/utils/extraction/__tests__/nameExtraction.test.ts
 * Or watch: npx vitest src/utils/extraction/__tests__/nameExtraction.test.ts
 */

import { describe, it, expect } from 'vitest'
import { 
  extractNamesFromBrackets, 
  hasBracketedNames,
  formatNamesAsBrackets 
} from '../nameExtraction'

describe('Name Extraction - Bracket Notation', () => {
  
  describe('extractNamesFromBrackets', () => {
    
    it('extracts two full names with ampersand', () => {
      const result = extractNamesFromBrackets('Wedding of (Mustapa Mohammed & Salamatu Abdulrahman)')
      
      expect(result).not.toBeNull()
      expect(result?.name1).toBe('Mustapa Mohammed')
      expect(result?.name2).toBe('Salamatu Abdulrahman')
      expect(result?.name1First).toBe('Mustapa')
      expect(result?.name1Last).toBe('Mohammed')
      expect(result?.name2First).toBe('Salamatu')
      expect(result?.name2Last).toBe('Abdulrahman')
      expect(result?.source).toBe('bracket')
      expect(result?.confidence).toBe('high')
    })

    it('extracts single-word names', () => {
      const result = extractNamesFromBrackets('(Aisha & Suleiman)')
      
      expect(result).not.toBeNull()
      expect(result?.name1).toBe('Aisha')
      expect(result?.name2).toBe('Suleiman')
      expect(result?.name1First).toBe('Aisha')
      expect(result?.name1Last).toBeNull()
      expect(result?.name2First).toBe('Suleiman')
      expect(result?.name2Last).toBeNull()
    })

    it('extracts names with "and" separator', () => {
      const result = extractNamesFromBrackets('(John Smith and Mary Jane)')
      
      expect(result).not.toBeNull()
      expect(result?.name1).toBe('John Smith')
      expect(result?.name2).toBe('Mary Jane')
    })

    it('extracts names from square brackets', () => {
      const result = extractNamesFromBrackets('[Ahmed Hassan & Fatima Ali]')
      
      expect(result).not.toBeNull()
      expect(result?.name1).toBe('Ahmed Hassan')
      expect(result?.name2).toBe('Fatima Ali')
    })

    it('handles names with multiple last names', () => {
      const result = extractNamesFromBrackets('(Juan Carlos Rodriguez & Maria Del Carmen)')
      
      expect(result).not.toBeNull()
      expect(result?.name1First).toBe('Juan')
      expect(result?.name1Last).toBe('Carlos Rodriguez')
      expect(result?.name2First).toBe('Maria')
      expect(result?.name2Last).toBe('Del Carmen')
    })

    it('returns null for text without brackets', () => {
      const result = extractNamesFromBrackets('John & Mary without brackets')
      expect(result).toBeNull()
    })

    it('returns null for empty brackets', () => {
      const result = extractNamesFromBrackets('()')
      expect(result).toBeNull()
    })

    it('returns null for single name in brackets', () => {
      const result = extractNamesFromBrackets('(John Smith)')
      expect(result).toBeNull()
    })

    it('handles lowercase names and capitalizes them', () => {
      const result = extractNamesFromBrackets('(john doe & jane smith)')
      
      expect(result?.name1).toBe('John Doe')
      expect(result?.name2).toBe('Jane Smith')
    })

    it('handles extra whitespace', () => {
      const result = extractNamesFromBrackets('(  Ahmed   &   Fatima  )')
      
      expect(result?.name1).toBe('Ahmed')
      expect(result?.name2).toBe('Fatima')
    })

    it('extracts names with "with" separator', () => {
      const result = extractNamesFromBrackets('(Michael with Sarah)')
      
      expect(result).not.toBeNull()
      expect(result?.name1).toBe('Michael')
      expect(result?.name2).toBe('Sarah')
    })

    it('extracts names with "+" separator', () => {
      const result = extractNamesFromBrackets('(David + Emma)')
      
      expect(result).not.toBeNull()
      expect(result?.name1).toBe('David')
      expect(result?.name2).toBe('Emma')
    })
  })

  describe('hasBracketedNames', () => {
    
    it('returns true for text with bracketed names', () => {
      expect(hasBracketedNames('Wedding (John & Mary)')).toBe(true)
      expect(hasBracketedNames('[Ahmed and Fatima]')).toBe(true)
    })

    it('returns false for text without brackets', () => {
      expect(hasBracketedNames('John & Mary')).toBe(false)
    })

    it('returns false for brackets without separator', () => {
      expect(hasBracketedNames('(John Smith)')).toBe(false)
    })

    it('returns false for empty string', () => {
      expect(hasBracketedNames('')).toBe(false)
    })
  })

  describe('formatNamesAsBrackets', () => {
    
    it('formats two names with ampersand', () => {
      expect(formatNamesAsBrackets('John Smith', 'Mary Jane')).toBe('(John Smith & Mary Jane)')
    })

    it('formats single name', () => {
      expect(formatNamesAsBrackets('John Smith', '')).toBe('(John Smith)')
    })

    it('returns empty string for no names', () => {
      expect(formatNamesAsBrackets('', '')).toBe('')
    })
  })
})

/**
 * SVG Injection Simulation Test
 * 
 * This simulates how names would be injected into the name1.svg template
 */
describe('SVG Name Injection Simulation', () => {
  
  it('maps extracted names to SVG element IDs', () => {
    // Simulate extraction
    const result = extractNamesFromBrackets('(Mustapa Mohammed & Salamatu Abdulrahman)')
    
    // This is how names would be injected into name1.svg
    const svgNameMapping = {
      'name1-first': result?.name1First,       // "Mustapa"
      'name1-last': result?.name1Last?.toUpperCase(), // "MOHAMMED"
      'name2-first': result?.name2First,       // "Salamatu"
      'name2-last': result?.name2Last?.toUpperCase(), // "ABDULRAHMAN"
      'name-separator': '&'
    }

    expect(svgNameMapping['name1-first']).toBe('Mustapa')
    expect(svgNameMapping['name1-last']).toBe('MOHAMMED')
    expect(svgNameMapping['name2-first']).toBe('Salamatu')
    expect(svgNameMapping['name2-last']).toBe('ABDULRAHMAN')
    expect(svgNameMapping['name-separator']).toBe('&')
  })

  it('handles single-word names for SVG', () => {
    const result = extractNamesFromBrackets('(Aisha & Suleiman)')
    
    const svgNameMapping = {
      'name1-first': result?.name1First,       // "Aisha"
      'name1-last': result?.name1Last?.toUpperCase() || '', // empty
      'name2-first': result?.name2First,       // "Suleiman"
      'name2-last': result?.name2Last?.toUpperCase() || '', // empty
    }

    expect(svgNameMapping['name1-first']).toBe('Aisha')
    expect(svgNameMapping['name1-last']).toBe('')
    expect(svgNameMapping['name2-first']).toBe('Suleiman')
    expect(svgNameMapping['name2-last']).toBe('')
  })
})
