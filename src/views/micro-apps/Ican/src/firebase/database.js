/**
 * Firebase Database Service - LocalStorage Implementation
 * Provides compatibility layer for invoice/receipt/signature operations
 */

const STORAGE_KEYS = {
  SIGNATURES: 'ican_signatures',
  INVOICES: 'ican_invoices',
  RECEIPTS: 'ican_receipts'
};

// Helper function to get data from localStorage
const getStorage = (key, defaultVal = []) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultVal;
  } catch (e) {
    console.error(`Error reading ${key} from localStorage:`, e);
    return defaultVal;
  }
};

// Helper function to save data to localStorage
const setStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (e) {
    console.error(`Error saving ${key} to localStorage:`, e);
    return false;
  }
};

/**
 * Get all signatures for a specific branch
 * @param {string} branchId - The branch identifier
 * @returns {Promise<{success: boolean, signatures?: Array, error?: string}>}
 */
export async function getAllSignatures(branchId) {
  try {
    console.log('🔍 getAllSignatures called for branch:', branchId);
    
    // Get all signatures
    const allSignatures = getStorage(STORAGE_KEYS.SIGNATURES, []);
    console.log('📦 Total signatures in storage:', allSignatures.length);
    
    // Filter by branch if branchId is provided
    let signatures = allSignatures;
    if (branchId) {
      signatures = allSignatures.filter(sig => sig.branch === branchId || sig.branchId === branchId);
      console.log(`🎯 Filtered signatures for branch "${branchId}":`, signatures.length);
    }
    
    return {
      success: true,
      signatures: signatures,
      data: signatures
    };
  } catch (error) {
    console.error('❌ Error in getAllSignatures:', error);
    return {
      success: false,
      signatures: [],
      error: error.message
    };
  }
}

/**
 * Save an invoice to localStorage
 * @param {string} branchId - The branch identifier
 * @param {Object} invoiceData - The invoice data to save
 * @returns {Promise<{success: boolean, id?: string, error?: string}>}
 */
export async function saveInvoice(branchId, invoiceData) {
  try {
    console.log('💾 saveInvoice called for branch:', branchId);
    
    // Get existing invoices
    const invoices = getStorage(STORAGE_KEYS.INVOICES, []);
    
    // Create invoice with ID if not present
    const invoice = {
      ...invoiceData,
      id: invoiceData.id || `INV-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      branchId: branchId,
      branch: branchId,
      createdAt: invoiceData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Add to invoices array
    invoices.push(invoice);
    
    // Save back to localStorage
    const saved = setStorage(STORAGE_KEYS.INVOICES, invoices);
    
    if (saved) {
      console.log('✅ Invoice saved successfully:', invoice.id);
      return {
        success: true,
        id: invoice.id,
        invoice: invoice
      };
    } else {
      throw new Error('Failed to save invoice to localStorage');
    }
  } catch (error) {
    console.error('❌ Error in saveInvoice:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Save a receipt to localStorage
 * @param {string} branchId - The branch identifier
 * @param {Object} receiptData - The receipt data to save
 * @returns {Promise<{success: boolean, id?: string, error?: string}>}
 */
export async function saveReceipt(branchId, receiptData) {
  try {
    console.log('💾 saveReceipt called for branch:', branchId);
    
    // Get existing receipts
    const receipts = getStorage(STORAGE_KEYS.RECEIPTS, []);
    
    // Create receipt with ID if not present
    const receipt = {
      ...receiptData,
      id: receiptData.id || `REC-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      branchId: branchId,
      branch: branchId,
      createdAt: receiptData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Add to receipts array
    receipts.push(receipt);
    
    // Save back to localStorage
    const saved = setStorage(STORAGE_KEYS.RECEIPTS, receipts);
    
    if (saved) {
      console.log('✅ Receipt saved successfully:', receipt.id);
      return {
        success: true,
        id: receipt.id,
        receipt: receipt
      };
    } else {
      throw new Error('Failed to save receipt to localStorage');
    }
  } catch (error) {
    console.error('❌ Error in saveReceipt:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Get all invoices for a specific branch
 * @param {string} branchId - The branch identifier
 * @returns {Promise<{success: boolean, invoices?: Array, error?: string}>}
 */
export async function getInvoices(branchId) {
  try {
    const allInvoices = getStorage(STORAGE_KEYS.INVOICES, []);
    let invoices = allInvoices;
    
    if (branchId) {
      invoices = allInvoices.filter(inv => inv.branch === branchId || inv.branchId === branchId);
    }
    
    // Sort by creation date, newest first
    invoices.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    return {
      success: true,
      invoices: invoices
    };
  } catch (error) {
    console.error('❌ Error in getInvoices:', error);
    return {
      success: false,
      invoices: [],
      error: error.message
    };
  }
}

/**
 * Get all receipts for a specific branch
 * @param {string} branchId - The branch identifier
 * @returns {Promise<{success: boolean, receipts?: Array, error?: string}>}
 */
export async function getReceipts(branchId) {
  try {
    const allReceipts = getStorage(STORAGE_KEYS.RECEIPTS, []);
    let receipts = allReceipts;
    
    if (branchId) {
      receipts = allReceipts.filter(rec => rec.branch === branchId || rec.branchId === branchId);
    }
    
    // Sort by creation date, newest first
    receipts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    return {
      success: true,
      receipts: receipts
    };
  } catch (error) {
    console.error('❌ Error in getReceipts:', error);
    return {
      success: false,
      receipts: [],
      error: error.message
    };
  }
}

/**
 * Save a signature to localStorage
 * @param {string} branchId - The branch identifier
 * @param {Object} signatureData - The signature data to save
 * @returns {Promise<{success: boolean, id?: string, error?: string}>}
 */
export async function saveSignature(branchId, signatureData) {
  try {
    console.log('💾 saveSignature called for branch:', branchId);
    
    // Get existing signatures
    const signatures = getStorage(STORAGE_KEYS.SIGNATURES, []);
    
    // Create signature with ID if not present
    const signature = {
      ...signatureData,
      id: signatureData.id || `SIG-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      branchId: branchId,
      branch: branchId,
      createdAt: signatureData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Add to signatures array
    signatures.push(signature);
    
    // Save back to localStorage
    const saved = setStorage(STORAGE_KEYS.SIGNATURES, signatures);
    
    if (saved) {
      console.log('✅ Signature saved successfully:', signature.id);
      return {
        success: true,
        id: signature.id,
        signature: signature
      };
    } else {
      throw new Error('Failed to save signature to localStorage');
    }
  } catch (error) {
    console.error('❌ Error in saveSignature:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Delete a signature from localStorage
 * @param {string} signatureId - The signature ID to delete
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function deleteSignature(signatureId) {
  try {
    console.log('🗑️ deleteSignature called for ID:', signatureId);
    
    // Get existing signatures
    const signatures = getStorage(STORAGE_KEYS.SIGNATURES, []);
    
    // Filter out the signature to delete
    const updatedSignatures = signatures.filter(sig => sig.id !== signatureId);
    
    // Check if signature was found and removed
    if (signatures.length === updatedSignatures.length) {
      throw new Error(`Signature with ID ${signatureId} not found`);
    }
    
    // Save back to localStorage
    const saved = setStorage(STORAGE_KEYS.SIGNATURES, updatedSignatures);
    
    if (saved) {
      console.log('✅ Signature deleted successfully:', signatureId);
      return {
        success: true
      };
    } else {
      throw new Error('Failed to delete signature from localStorage');
    }
  } catch (error) {
    console.error('❌ Error in deleteSignature:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Export default object with all functions
export default {
  getAllSignatures,
  saveInvoice,
  saveReceipt,
  getInvoices,
  getReceipts,
  saveSignature,
  deleteSignature
};
