// Storage utility functions for ICAN app
// Handles localStorage operations for invoices and receipts

// Safe localStorage wrapper to handle errors
export const safeLocalStorage = {
  getItem(key) {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error(`Error reading ${key} from localStorage:`, error);
      return null;
    }
  },
  setItem(key, value) {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (error) {
      console.error(`Error writing ${key} to localStorage:`, error);
      return false;
    }
  },
  removeItem(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Error removing ${key} from localStorage:`, error);
      return false;
    }
  }
};

export const storageUtils = {
  // Save invoice to localStorage
  saveInvoice(invoice) {
    try {
      const invoices = this.getInvoices();
      invoices.push({
        ...invoice,
        id: Date.now(),
        createdAt: new Date().toISOString()
      });
      localStorage.setItem('ican_invoices', JSON.stringify(invoices));
      return true;
    } catch (error) {
      console.error('Error saving invoice:', error);
      return false;
    }
  },

  // Get all invoices from localStorage
  getInvoices() {
    try {
      const data = localStorage.getItem('ican_invoices');
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting invoices:', error);
      return [];
    }
  },

  // Save receipt to localStorage
  saveReceipt(receipt) {
    try {
      const receipts = this.getReceipts();
      receipts.push({
        ...receipt,
        id: Date.now(),
        createdAt: new Date().toISOString()
      });
      localStorage.setItem('ican_receipts', JSON.stringify(receipts));
      return true;
    } catch (error) {
      console.error('Error saving receipt:', error);
      return false;
    }
  },

  // Get all receipts from localStorage
  getReceipts() {
    try {
      const data = localStorage.getItem('ican_receipts');
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting receipts:', error);
      return [];
    }
  },

  // Delete invoice by ID
  deleteInvoice(id) {
    try {
      const invoices = this.getInvoices();
      const filtered = invoices.filter(inv => inv.id !== id);
      localStorage.setItem('ican_invoices', JSON.stringify(filtered));
      return true;
    } catch (error) {
      console.error('Error deleting invoice:', error);
      return false;
    }
  },

  // Delete receipt by ID
  deleteReceipt(id) {
    try {
      const receipts = this.getReceipts();
      const filtered = receipts.filter(rec => rec.id !== id);
      localStorage.setItem('ican_receipts', JSON.stringify(filtered));
      return true;
    } catch (error) {
      console.error('Error deleting receipt:', error);
      return false;
    }
  },

  // Clear all data
  clearAll() {
    localStorage.removeItem('ican_invoices');
    localStorage.removeItem('ican_receipts');
  }
};

export default storageUtils;
