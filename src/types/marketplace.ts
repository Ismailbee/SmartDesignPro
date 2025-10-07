/**
 * Template Marketplace Type Definitions
 */

// Template Categories
export type TemplateCategory =
  | 'stickers'
  | 'receipt-invoice'
  | 'flyers-posters'
  | 'exercise-books'
  | 'business-cards'
  | 'flex-banners'
  | 'social-media'
  | 'clock-design'
  | 'tags-labels'
  | 'forms'
  | 'cloth-patterns'
  | 'all'

// Template Access Level
export type TemplateAccessLevel = 'free' | 'premium' | 'exclusive'

// Template Status
export type TemplateStatus = 'pending' | 'approved' | 'rejected' | 'draft'

// Template Format
export type TemplateFormat = 'svg' | 'psd' | 'pdf' | 'png' | 'json'

// Sort Options
export type TemplateSortBy = 'popular' | 'newest' | 'trending' | 'price-low' | 'price-high'

// Template Interface
export interface Template {
  id: string
  title: string
  description: string
  category: TemplateCategory
  tags: string[]
  thumbnailUrl: string
  previewUrl: string
  fileUrl: string
  format: TemplateFormat
  accessLevel: TemplateAccessLevel
  price: number // 0 for free templates
  status: TemplateStatus
  downloads: number
  likes: number
  views: number
  createdBy: string
  createdByName: string
  createdAt: string
  updatedAt: string
  width: number
  height: number
  isPremium: boolean
  isExclusive: boolean
  isFeatured: boolean
}

// Template Upload Data
export interface TemplateUploadData {
  title: string
  description: string
  category: TemplateCategory
  tags: string[]
  accessLevel: TemplateAccessLevel
  price: number
  file: File
  thumbnail?: File
  width: number
  height: number
}

// Template Filters
export interface TemplateFilters {
  category?: TemplateCategory
  accessLevel?: TemplateAccessLevel
  sortBy?: TemplateSortBy
  search?: string
  tags?: string[]
  minPrice?: number
  maxPrice?: number
  isPremium?: boolean
  isFeatured?: boolean
}

// Template Search Response
export interface TemplateSearchResponse {
  templates: Template[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

// Category Config
export interface CategoryConfig {
  id: TemplateCategory
  name: string
  icon: string
  description: string
  color: string
}

// User Template Library
export interface UserTemplateLibrary {
  userId: string
  savedTemplates: string[] // Template IDs
  purchasedTemplates: string[] // Template IDs
  uploadedTemplates: string[] // Template IDs
}

// Template Purchase
export interface TemplatePurchase {
  id: string
  userId: string
  templateId: string
  price: number
  purchasedAt: string
}

// Template Like
export interface TemplateLike {
  userId: string
  templateId: string
  likedAt: string
}

// Marketplace State
export interface MarketplaceState {
  templates: Template[]
  filteredTemplates: Template[]
  selectedTemplate: Template | null
  filters: TemplateFilters
  isLoading: boolean
  error: string | null
  page: number
  hasMore: boolean
  userLibrary: UserTemplateLibrary | null
  isPreviewOpen: boolean
  isUploadModalOpen: boolean
}

// Category Definitions
export const TEMPLATE_CATEGORIES: Record<TemplateCategory, CategoryConfig> = {
  all: {
    id: 'all',
    name: 'All Templates',
    icon: '🎨',
    description: 'Browse all available templates',
    color: '#667eea'
  },
  stickers: {
    id: 'stickers',
    name: 'Stickers',
    icon: '🏷️',
    description: 'Custom stickers and decals',
    color: '#f56565'
  },
  'receipt-invoice': {
    id: 'receipt-invoice',
    name: 'Receipt & Invoice',
    icon: '🧾',
    description: 'Professional receipts and invoices',
    color: '#48bb78'
  },
  'flyers-posters': {
    id: 'flyers-posters',
    name: 'Flyers & Posters',
    icon: '📄',
    description: 'Eye-catching flyers and posters',
    color: '#ed8936'
  },
  'exercise-books': {
    id: 'exercise-books',
    name: 'Exercise Books',
    icon: '📓',
    description: 'Journals and exercise books',
    color: '#9f7aea'
  },
  'business-cards': {
    id: 'business-cards',
    name: 'Business Cards',
    icon: '💼',
    description: 'Professional business cards',
    color: '#38b2ac'
  },
  'flex-banners': {
    id: 'flex-banners',
    name: 'Flex Banners',
    icon: '🎪',
    description: 'Large format banners',
    color: '#e53e3e'
  },
  'social-media': {
    id: 'social-media',
    name: 'Social Media',
    icon: '📱',
    description: 'Social media content templates',
    color: '#667eea'
  },
  'clock-design': {
    id: 'clock-design',
    name: 'Clock Design',
    icon: '🕐',
    description: 'Custom clock face designs',
    color: '#d69e2e'
  },
  'tags-labels': {
    id: 'tags-labels',
    name: 'Tags & Labels',
    icon: '🏷️',
    description: 'Product tags and labels',
    color: '#805ad5'
  },
  forms: {
    id: 'forms',
    name: 'Forms',
    icon: '📋',
    description: 'Business forms and documents',
    color: '#319795'
  },
  'cloth-patterns': {
    id: 'cloth-patterns',
    name: 'Cloth Patterns',
    icon: '👕',
    description: 'Textile and fabric patterns',
    color: '#dd6b20'
  }
}

// Access Level Labels
export const ACCESS_LEVEL_LABELS: Record<TemplateAccessLevel, string> = {
  free: 'Free',
  premium: 'Premium',
  exclusive: 'Exclusive'
}

// Access Level Colors
export const ACCESS_LEVEL_COLORS: Record<TemplateAccessLevel, string> = {
  free: '#48bb78',
  premium: '#ed8936',
  exclusive: '#9f7aea'
}

// Popular Tags
export const POPULAR_TAGS = [
  'modern',
  'minimal',
  'colorful',
  'professional',
  'creative',
  'elegant',
  'bold',
  'vintage',
  'abstract',
  'geometric',
  'floral',
  'corporate',
  'playful',
  'luxury',
  'simple'
]

