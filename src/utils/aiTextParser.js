import { AI_CONFIG, isAiConfigured, getPrimaryAiService } from '@/config/aiConfig.js';

/**
 * AI-Powered Text Parser for Organization Details
 * Supports multiple AI services with automatic fallback
 */

class AITextParser {
  constructor() {
    this.config = AI_CONFIG;
    this.primaryService = getPrimaryAiService();
    this.isConfigured = isAiConfigured();
    this.fallbackToRegex = this.config.FALLBACK.enabled;
    
    // Initialize service-specific configurations
    this.initializeServices();
  }

  initializeServices() {
    // Hugging Face configuration
    if (this.config.HUGGING_FACE.enabled && this.config.HUGGING_FACE.apiKey) {
      this.huggingFace = {
        apiKey: this.config.HUGGING_FACE.apiKey,
        baseUrl: this.config.HUGGING_FACE.baseUrl,
        nerModel: this.config.HUGGING_FACE.models.ner,
        textGenModel: this.config.HUGGING_FACE.models.textGeneration
      };
    }

    // OpenAI configuration
    if (this.config.OPENAI.enabled && this.config.OPENAI.apiKey) {
      this.openai = {
        apiKey: this.config.OPENAI.apiKey,
        baseUrl: this.config.OPENAI.baseUrl,
        model: this.config.OPENAI.model,
        maxTokens: this.config.OPENAI.maxTokens,
        temperature: this.config.OPENAI.temperature
      };
    }

    // Request configuration
    this.requestConfig = {
      timeout: this.config.REQUEST.timeoutMs,
      retryAttempts: this.config.REQUEST.retryAttempts,
      retryDelay: this.config.REQUEST.retryDelayMs
    };
  }

  /**
   * Main parsing function - AI-only mode
   */
  async parseOrganizationText(text) {
    // Check if AI is configured
    if (!this.isConfigured) {
      return {
        ...this.getEmptyResult(),
        method: 'not_configured',
        confidence: 'none',
        error: 'AI service not configured. Please add your API key to enable intelligent text parsing.'
      };
    }

    try {
      // AI-only parsing
      const aiResult = await this.parseWithAI(text);
      if (aiResult && this.isValidResult(aiResult)) {
        return {
          ...aiResult,
          method: 'ai',
          confidence: this.calculateConfidence(aiResult)
        };
      } else {
        // AI returned empty/invalid result
        return {
          ...this.getEmptyResult(),
          method: 'ai',
          confidence: 'low',
          error: 'AI could not extract meaningful information from the text. Try providing more structured business information.'
        };
      }
    } catch (error) {
      console.error('AI parsing failed:', error);
      return {
        ...this.getEmptyResult(),
        method: 'ai_error',
        confidence: 'none',
        error: `AI parsing failed: ${error.message}. Please check your internet connection and API configuration.`
      };
    }
  }

  /**
   * AI-powered parsing using Hugging Face NER
   */
  async parseWithAI(text) {
    const result = {
      organizationName: '',
      subtitle: '',
      addresses: [],
      phones: [],
      emails: [],
      websites: []
    };

    try {
      // Step 1: Extract named entities
      const entities = await this.extractEntities(text);
      
      // Step 2: Use GPT-like model for structured extraction
      const structuredData = await this.extractStructuredData(text);

      // Step 3: Combine and clean results
      result.organizationName = this.findOrganizationName(entities, structuredData, text);
      result.subtitle = this.findSubtitle(text, entities);
      result.addresses = this.findAddresses(entities, text);
      result.phones = this.findPhoneNumbers(entities, text);
      result.emails = this.findEmails(entities, text);
      result.websites = this.findWebsites(entities, text);

      return result;
    } catch (error) {
      console.error('AI parsing error:', error);
      throw error;
    }
  }

  /**
   * Extract named entities using configured AI service
   */
  async extractEntities(text) {
    if (this.primaryService === 'HUGGING_FACE' && this.huggingFace) {
      return await this.extractEntitiesHuggingFace(text);
    } else if (this.primaryService === 'OPENAI' && this.openai) {
      return await this.extractEntitiesOpenAI(text);
    }
    
    throw new Error('No AI service configured');
  }

  /**
   * Extract entities using Hugging Face NER
   */
  async extractEntitiesHuggingFace(text) {
    const response = await fetch(`${this.huggingFace.baseUrl}/${this.huggingFace.nerModel}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.huggingFace.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        inputs: text,
        options: { wait_for_model: true }
      })
    });

    if (!response.ok) {
      throw new Error(`Hugging Face NER API error: ${response.status}`);
    }

    return await response.json();
  }

  /**
   * Extract entities using OpenAI
   */
  async extractEntitiesOpenAI(text) {
    const response = await fetch(`${this.openai.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.openai.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: this.openai.model,
        messages: [{
          role: 'user',
          content: `Extract organization information from this text in JSON format: "${text}". Return only valid JSON with fields: organizationName, subtitle, addresses (array), phones (array), emails (array), websites (array).`
        }],
        max_tokens: this.openai.maxTokens,
        temperature: this.openai.temperature
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const result = await response.json();
    return result.choices?.[0]?.message?.content;
  }

  /**
   * Use structured extraction for organization data
   */
  async extractStructuredData(text) {
    if (this.primaryService === 'OPENAI' && this.openai) {
      // OpenAI already provides structured data
      return null;
    }

    if (this.primaryService === 'HUGGING_FACE' && this.huggingFace) {
      return await this.extractStructuredDataHuggingFace(text);
    }

    return null;
  }

  /**
   * Extract structured data using Hugging Face text generation
   */
  async extractStructuredDataHuggingFace(text) {
    const prompt = `Extract organization information from this text in JSON format:
Text: "${text}"

Extract: company name, tagline/subtitle, addresses, phone numbers, emails, websites.
Format as valid JSON only:`;

    try {
      const response = await fetch(`${this.huggingFace.baseUrl}/${this.huggingFace.textGenModel}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.huggingFace.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_length: 200,
            temperature: 0.3
          }
        })
      });

      if (response.ok) {
        const result = await response.json();
        return this.parseAIResponse(result);
      }
    } catch (error) {
      console.warn('Hugging Face structured extraction failed:', error);
    }

    return null;
  }

  /**
   * Find organization name with AI assistance
   */
  findOrganizationName(entities, structuredData, text) {
    // Try structured data first
    if (structuredData?.organizationName || structuredData?.companyName) {
      return structuredData.organizationName || structuredData.companyName;
    }

    // Look for ORG entities from NER
    const orgEntities = entities.filter(e => e.entity_group === 'ORG' || e.entity === 'B-ORG');
    if (orgEntities.length > 0) {
      // Return the longest organization name (likely most complete)
      return orgEntities.reduce((longest, current) => 
        current.word.length > longest.length ? current.word : longest, ''
      );
    }

    // Enhanced regex fallback with AI insights
    const patterns = [
      /(?:company|corp|corporation|ltd|limited|inc|incorporated|llc|group|enterprises?|solutions?|services?)[\s]*:?\s*([^.\n]+)/gi,
      /^([^.\n]*(?:company|corp|corporation|ltd|limited|inc|incorporated|llc|group|enterprises?|solutions?|services?))/gim,
      /\(([^)]+(?:company|corp|corporation|ltd|limited|inc|incorporated|llc|group|enterprises?|solutions?|services?)[^)]*)\)/gi
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        return match[1]?.trim() || match[0]?.trim();
      }
    }

    return '';
  }

  /**
   * Find addresses with AI assistance
   */
  findAddresses(entities, text) {
    const addresses = [];
    
    // Look for LOCATION entities that might be addresses
    const _locationEntities = entities.filter(e => 
      e.entity_group === 'LOC' || e.entity === 'B-LOC' || e.entity === 'I-LOC'
    );

    // Enhanced address detection
    const addressPatterns = [
      /(?:address|located at|headquartered at|office)[\s:]*([^.\n]+(?:street|st|avenue|ave|road|rd|boulevard|blvd|lane|ln|drive|dr|place|pl|way|court|ct)[^.\n]*)/gi,
      /\d+\s+[^.\n]*(?:street|st|avenue|ave|road|rd|boulevard|blvd|lane|ln|drive|dr|place|pl|way|court|ct)[^.\n]*/gi,
      /(?:p\.?o\.?\s*box\s*\d+)[^.\n]*/gi
    ];

    for (const pattern of addressPatterns) {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        const address = (match[1] || match[0]).trim();
        if (address && !addresses.includes(address)) {
          addresses.push(address);
        }
      }
    }

    return addresses;
  }

  /**
   * Find phone numbers with enhanced patterns
   */
  findPhoneNumbers(entities, text) {
    const phones = [];
    
    const phonePatterns = [
      /(?:phone|tel|telephone|call|contact|mobile|cell)[\s:]*([+]?[\d\s\-().]{10,})/gi,
      /[+]?[\d\s\-().]{10,}/g
    ];

    for (const pattern of phonePatterns) {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        const phone = (match[1] || match[0]).trim();
        // Validate phone number format
        if (this.isValidPhone(phone) && !phones.includes(phone)) {
          phones.push(phone);
        }
      }
    }

    return phones;
  }

  /**
   * Find emails with enhanced detection
   */
  findEmails(entities, text) {
    const emails = [];
    const emailPattern = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    
    const matches = text.matchAll(emailPattern);
    for (const match of matches) {
      if (!emails.includes(match[0])) {
        emails.push(match[0]);
      }
    }

    return emails;
  }

  /**
   * Find websites/URLs
   */
  findWebsites(entities, text) {
    const websites = [];
    const urlPattern = /https?:\/\/[^\s]+|www\.[^\s]+\.[a-z]{2,}/gi;
    
    const matches = text.matchAll(urlPattern);
    for (const match of matches) {
      if (!websites.includes(match[0])) {
        websites.push(match[0]);
      }
    }

    return websites;
  }

  /**
   * Current regex method as fallback
   */
  parseWithRegex(text) {
    const result = {
      organizationName: '',
      subtitle: '',
      addresses: [],
      phones: []
    };

    // Organization name (enhanced)
    const orgPatterns = [
      /\(([^)]+)\)/,
      /^([^.\n]*(?:company|corp|corporation|ltd|limited|inc|incorporated|llc|group))/gim
    ];
    
    for (const pattern of orgPatterns) {
      const match = text.match(pattern);
      if (match) {
        result.organizationName = match[1]?.trim() || match[0]?.trim();
        break;
      }
    }

    // Subtitle
    const subtitleMatch = text.match(/"([^"]+)"/);
    if (subtitleMatch) {
      result.subtitle = subtitleMatch[1].trim();
    }

    // Addresses
    const addressRegex = /(?:^|\n)([^\n]*(?:address|Address):\s*([^\n]+))/gim;
    let addressMatch;
    while ((addressMatch = addressRegex.exec(text)) !== null) {
      const addressPart = addressMatch[2].trim();
      if (addressPart) {
        result.addresses.push(addressPart);
      }
    }

    // Phone numbers
    const phoneRegex = /(?:^|\n)([^\n]*(?:phone|tel|contact|call):\s*([^\n]+))/gim;
    let phoneMatch;
    while ((phoneMatch = phoneRegex.exec(text)) !== null) {
      const phonePart = phoneMatch[2].trim();
      if (phonePart) {
        result.phones.push(phonePart);
      }
    }

    return result;
  }

  /**
   * Calculate confidence based on AI result completeness
   */
  calculateConfidence(result) {
    let score = 0;
    
    // Organization name is most important
    if (result.organizationName && result.organizationName.length > 2) score += 40;
    
    // Contact information
    if (result.addresses && result.addresses.length > 0) score += 25;
    if (result.phones && result.phones.length > 0) score += 20;
    if (result.emails && result.emails.length > 0) score += 10;
    
    // Additional information
    if (result.subtitle) score += 3;
    if (result.websites && result.websites.length > 0) score += 2;
    
    // Return confidence level
    if (score >= 80) return 'high';
    if (score >= 50) return 'medium';
    return 'low';
  }

  /**
   * Validation helpers
   */
  isValidPhone(phone) {
    const cleaned = phone.replace(/[^\d]/g, '');
    return cleaned.length >= 10 && cleaned.length <= 15;
  }

  isValidResult(result) {
    return result.organizationName || result.addresses.length > 0 || result.phones.length > 0;
  }

  getEmptyResult() {
    return {
      organizationName: '',
      subtitle: '',
      addresses: [],
      phones: [],
      emails: [],
      websites: [],
      method: 'none',
      confidence: 'none'
    };
  }

  parseAIResponse(response) {
    try {
      // Try to extract JSON from the AI response
      const jsonMatch = response[0]?.generated_text?.match(/\{[^}]+\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      console.warn('Failed to parse AI response as JSON:', error);
    }
    return null;
  }
}

// Export singleton instance
export const aiTextParser = new AITextParser();
export default AITextParser;