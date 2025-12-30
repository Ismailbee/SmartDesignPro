/**
 * ICAN Micro-App Service Type Definitions
 * Centralizes service-related type definitions
 */

export interface ICANFirebaseService {
  // Authentication methods
  signIn(email: string, password: string): Promise<any>
  signOut(): Promise<void>
  getCurrentUser(): any
  
  // Database methods
  saveData(collection: string, data: any): Promise<string>
  getData(collection: string, id?: string): Promise<any>
  updateData(collection: string, id: string, data: any): Promise<void>
  deleteData(collection: string, id: string): Promise<void>
  
  // Storage methods
  uploadFile(file: File, path: string): Promise<string>
  downloadFile(path: string): Promise<string>
  deleteFile(path: string): Promise<void>
}

export interface ICANSSOService {
  generateSSOToken(user: any): Promise<string>
  generateAuthURL(user: any): Promise<string>
  validateUser(email: string): Promise<boolean>
  redirectToICANApp(user: any): Promise<void>
}

export interface ICANApiService {
  get<T>(endpoint: string, params?: any): Promise<T>
  post<T>(endpoint: string, data?: any): Promise<T>
  put<T>(endpoint: string, data?: any): Promise<T>
  delete<T>(endpoint: string): Promise<T>
}

export interface ICANNotificationService {
  showSuccess(message: string): void
  showError(message: string): void
  showInfo(message: string): void
  showWarning(message: string): void
}

export interface ICANValidationService {
  validateEmail(email: string): boolean
  validatePhone(phone: string): boolean
  validatePassword(password: string): { isValid: boolean; errors: string[] }
  validateRequired(value: any): boolean
  validateMinLength(value: string, minLength: number): boolean
  validateMaxLength(value: string, maxLength: number): boolean
}