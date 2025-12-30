/**
 * ICAN Micro-App Component Type Definitions
 * Centralizes component-related type definitions
 */

import type { RouteLocationNormalizedLoaded } from 'vue-router'

export interface ICANComponentProps {
  title?: string
  subtitle?: string
  showHeader?: boolean
  className?: string
  isLoading?: boolean
  disabled?: boolean
}

export interface ICANBaseComponent {
  props: ICANComponentProps
  emits: string[]
  setup(): any
}

export interface ICANPageComponent extends ICANBaseComponent {
  route: RouteLocationNormalizedLoaded
  beforeRouteEnter?: () => void
  beforeRouteUpdate?: () => void
  beforeRouteLeave?: () => void
}

export interface ICANModalProps {
  isOpen: boolean
  title: string
  size?: 'small' | 'medium' | 'large' | 'fullscreen'
  closable?: boolean
  backdrop?: boolean
  animation?: boolean
}

export interface ICANFormProps {
  modelValue: any
  schema?: any
  validation?: any
  disabled?: boolean
  loading?: boolean
  showErrors?: boolean
  errorPosition?: 'top' | 'bottom' | 'inline'
}

export interface ICANTableProps {
  data: any[]
  columns: ICANTableColumn[]
  loading?: boolean
  pagination?: ICANPaginationConfig
  selection?: boolean
  sorting?: boolean
  filtering?: boolean
  actions?: ICANTableAction[]
}

export interface ICANTableColumn {
  key: string
  title: string
  width?: string | number
  sortable?: boolean
  filterable?: boolean
  align?: 'left' | 'center' | 'right'
  format?: (value: any, row: any) => string
  render?: (value: any, row: any) => any
}

export interface ICANTableAction {
  key: string
  label: string
  icon?: string
  color?: string
  visible?: (row: any) => boolean
  disabled?: (row: any) => boolean
  handler: (row: any) => void
}

export interface ICANPaginationConfig {
  page: number
  limit: number
  total: number
  showSizeChanger?: boolean
  showQuickJumper?: boolean
  showTotal?: boolean
  pageSizes?: number[]
}

export interface ICANChartProps {
  type: 'line' | 'bar' | 'pie' | 'doughnut' | 'area'
  data: any
  options?: any
  height?: string | number
  responsive?: boolean
  maintainAspectRatio?: boolean
}

export interface ICANCardProps {
  title?: string
  subtitle?: string
  icon?: string
  color?: string
  gradient?: boolean
  hoverable?: boolean
  clickable?: boolean
  loading?: boolean
  bordered?: boolean
  shadowed?: boolean
}

export interface ICANButtonProps {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'light' | 'dark'
  size?: 'small' | 'medium' | 'large'
  shape?: 'default' | 'round' | 'circle'
  type?: 'button' | 'submit' | 'reset'
  loading?: boolean
  disabled?: boolean
  block?: boolean
  icon?: string
  iconPosition?: 'left' | 'right'
}

export interface ICANInputProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search'
  placeholder?: string
  disabled?: boolean
  readonly?: boolean
  required?: boolean
  clearable?: boolean
  showPassword?: boolean
  maxLength?: number
  minLength?: number
  pattern?: string
  prefix?: string
  suffix?: string
  addonBefore?: string
  addonAfter?: string
}

export interface ICANSelectProps {
  options: ICANSelectOption[]
  multiple?: boolean
  searchable?: boolean
  clearable?: boolean
  placeholder?: string
  disabled?: boolean
  loading?: boolean
  remote?: boolean
  remoteMethod?: (query: string) => Promise<ICANSelectOption[]>
}

export interface ICANSelectOption {
  label: string
  value: any
  disabled?: boolean
  group?: string
  icon?: string
  description?: string
}

export interface ICANDatePickerProps {
  type?: 'date' | 'datetime' | 'daterange' | 'datetimerange' | 'month' | 'year'
  format?: string
  placeholder?: string | string[]
  disabled?: boolean
  clearable?: boolean
  shortcuts?: ICANDateShortcut[]
  disabledDate?: (date: Date) => boolean
}

export interface ICANDateShortcut {
  text: string
  value: Date | Date[]
}

export interface ICANUploadProps {
  accept?: string
  multiple?: boolean
  maxSize?: number
  maxCount?: number
  disabled?: boolean
  showFileList?: boolean
  listType?: 'text' | 'picture' | 'picture-card'
  beforeUpload?: (file: File) => boolean | Promise<boolean>
  customRequest?: (options: any) => void
}

export interface ICANTabsProps {
  activeKey?: string
  type?: 'line' | 'card' | 'border-card'
  position?: 'top' | 'right' | 'bottom' | 'left'
  closable?: boolean
  addable?: boolean
  lazy?: boolean
}

export interface ICANTabPane {
  key: string
  label: string
  disabled?: boolean
  closable?: boolean
  content: any
}

export interface ICANStepsProps {
  current: number
  direction?: 'horizontal' | 'vertical'
  size?: 'default' | 'small'
  status?: 'wait' | 'process' | 'finish' | 'error'
  progressDot?: boolean
}

export interface ICANStep {
  title: string
  description?: string
  status?: 'wait' | 'process' | 'finish' | 'error'
  icon?: string
  disabled?: boolean
}