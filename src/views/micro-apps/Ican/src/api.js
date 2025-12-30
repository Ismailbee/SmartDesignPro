// Legacy API compatibility
// This file now exports Firebase-based services instead of localhost API
export { 
  getBranches,
  authenticateUser,
  getDashboardData,
  createInvoice,
  getNextInvoiceNumber,
  createReceipt,
  getNextReceiptNumber,
  getInvoices,
  getReceipts,
  verifyPassword,
  getCurrentUser,
  getBranchIdByName,
  API_BASE
} from './api-service'
