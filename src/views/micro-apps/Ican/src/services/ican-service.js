/**
 * ICAN Service - Firebase Integration
 * Uses main SmartDesignPro Firebase for authentication and data storage
 * ENFORCES ONLINE-ONLY ACCESS - No offline mode allowed
 */

// Import from MAIN SmartDesignPro Firebase config
// Using relative path from ICAN services to main config
import { db, auth } from '../../../../../config/firebase'
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  query, 
  where,
  orderBy,
  limit as firestoreLimit,
  addDoc,
  serverTimestamp
} from 'firebase/firestore'

// Firestore collections - prefixed with 'ican_' to separate from main SmartDesignPro data
const COLLECTIONS = {
  BRANCHES: 'ican_branches',
  USERS: 'ican_users',
  INVOICES: 'ican_invoices',
  RECEIPTS: 'ican_receipts',
  COUNTERS: 'ican_counters',
  SIGNATURES: 'ican_signatures',
  ACTIVITIES: 'ican_activities' // New collection for activity tracking
};

console.log('✅ ICAN Service using MAIN SmartDesignPro Firebase');
console.log('📦 Firebase DB:', db ? 'Connected' : 'Not initialized');
console.log('🔐 Firebase Auth:', auth ? 'Available' : 'Not initialized');

// Validate Firebase initialization
if (!db) {
  console.error('❌ CRITICAL: Firebase DB not initialized! Check main Firebase config at src/config/firebase.ts');
  console.error('Make sure .env file has valid Firebase credentials');
  throw new Error('Firebase Firestore (db) is not initialized. Please check your Firebase configuration.');
}

if (!auth) {
  console.error('❌ CRITICAL: Firebase Auth not initialized! Check main Firebase config at src/config/firebase.ts');
  throw new Error('Firebase Auth is not initialized. Please check your Firebase configuration.');
}

// --- Helper Functions ---
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Check internet connectivity
const requireOnline = () => {
  if (!navigator.onLine) {
    throw new Error('🔴 No internet connection. ICAN requires an active internet connection to function.');
  }
};

const getStorage = (key, defaultVal = []) => {
  // Deprecated - localStorage no longer used for main data
  console.warn('⚠️ LocalStorage access deprecated. Use Firebase.');
  return defaultVal;
};

const setStorage = (key, value) => {
  // Deprecated - localStorage no longer used for main data
  console.warn('⚠️ LocalStorage write deprecated. Use Firebase.');
};

// --- ICAN Seed Service ---
export const ICANSeedService = {
  async forceReseedAllNigerianStates() {
    requireOnline();
    
    const nigerianStates = [
      "Abia State", "Adamawa State", "Akwa Ibom State", "Anambra State", 
      "Bauchi State", "Bayelsa State", "Benue State", "Borno State", 
      "Cross River State", "Delta State", "Ebonyi State", "Edo State", 
      "Ekiti State", "Enugu State", "FCT Abuja State", "Gombe State", 
      "Imo State", "Jigawa State", "Kaduna State", "Kano State", 
      "Katsina State", "Kebbi State", "Kogi State", "Kwara State", 
      "Lagos State", "Nasarawa State", "Niger State", "Ogun State", 
      "Ondo State", "Osun State", "Oyo State", "Plateau State", 
      "Rivers State", "Sokoto State", "Taraba State", "Yobe State", 
      "Zamfara State"
    ];

    try {
      const branchesRef = collection(db, COLLECTIONS.BRANCHES);
      const batch = [];
      
      for (let i = 0; i < nigerianStates.length; i++) {
        const state = nigerianStates[i];
        const branchId = `branch_${i + 1}`;
        const branchDoc = doc(db, COLLECTIONS.BRANCHES, branchId);
        
        const branchData = {
          id: branchId,
          name: state,
          location: state,
          password: 'niger123', // Default password - can be changed via Reset Password
          createdAt: serverTimestamp(),
          isActive: true
        };
        
        batch.push(setDoc(branchDoc, branchData));
      }
      
      await Promise.all(batch);
      console.log('✅ Seeded branches to Firebase');
      
      return nigerianStates.map((state, index) => ({
        id: `branch_${index + 1}`,
        name: state,
        location: state
      }));
    } catch (error) {
      console.error('❌ Error seeding branches:', error);
      throw new Error('Failed to seed branches to Firebase: ' + error.message);
    }
  },

  async seedDefaultBranches() {
    requireOnline();
    const branchesRef = collection(db, COLLECTIONS.BRANCHES);
    const snapshot = await getDocs(branchesRef);
    
    if (snapshot.empty) {
      return await this.forceReseedAllNigerianStates();
    }
  }
};

// --- ICAN Branch Service ---
export const ICANBranchService = {
  async getAllBranches() {
    requireOnline();
    
    try {
      const branchesRef = collection(db, COLLECTIONS.BRANCHES);
      const snapshot = await getDocs(branchesRef);
      
      if (snapshot.empty) {
        console.log('📌 No branches found, seeding...');
        return await ICANSeedService.forceReseedAllNigerianStates();
      }
      
      const branches = [];
      snapshot.forEach(doc => {
        branches.push({ id: doc.id, ...doc.data() });
      });
      
      return branches;
    } catch (error) {
      console.error('❌ Error fetching branches:', error);
      throw new Error('Failed to load branches from Firebase: ' + error.message);
    }
  },

  async testFirebaseConnection() {
    requireOnline();
    
    try {
      console.log('🔍 Testing Firebase connection...');
      const testRef = collection(db, COLLECTIONS.BRANCHES);
      const snapshot = await getDocs(query(testRef, firestoreLimit(5)));
      
      const branchNames = [];
      snapshot.forEach(doc => {
        branchNames.push(doc.data().name);
      });
      
      console.log('✅ Firebase connection successful!', { 
        branchCount: snapshot.size, 
        branches: branchNames
      });
      
      return {
        connected: true,
        branches: branchNames.sort()
      };
    } catch (error) {
      console.error('❌ Firebase connection test failed:', error);
      return {
        connected: false,
        branches: [],
        error: error.message
      };
    }
  },

  async verifyBranchCredentials(branchName, password) {
    requireOnline();
    
    try {
      const branchesRef = collection(db, COLLECTIONS.BRANCHES);
      const q = query(branchesRef, where('name', '==', branchName));
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        console.log('❌ Branch not found:', branchName);
        return null;
      }
      
      const branchDoc = snapshot.docs[0];
      const branch = { id: branchDoc.id, ...branchDoc.data() };
      
      // Verify password matches exactly
      if (branch.password === password) {
        console.log('✅ Branch credentials verified:', branchName);
        return branch;
      }
      
      console.log('❌ Invalid branch password');
      return null;
    } catch (error) {
      console.error('❌ Error verifying branch credentials:', error);
      throw new Error('Failed to verify branch credentials: ' + error.message);
    }
  },

  async createBranch(branchData) {
    requireOnline();
    
    try {
      const branchesRef = collection(db, COLLECTIONS.BRANCHES);
      const docRef = await addDoc(branchesRef, {
        ...branchData,
        createdAt: serverTimestamp()
      });
      
      console.log('✅ Branch created:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('❌ Error creating branch:', error);
      throw new Error('Failed to create branch: ' + error.message);
    }
  },

  async updateBranchPassword(branchId, newPassword) {
    requireOnline();
    
    try {
      const branchRef = doc(db, COLLECTIONS.BRANCHES, branchId);
      await updateDoc(branchRef, {
        password: newPassword,
        passwordUpdatedAt: serverTimestamp(),
        passwordUpdatedBy: 'admin'
      });
      
      console.log('✅ Branch password updated:', branchId);
      return true;
    } catch (error) {
      console.error('❌ Error updating branch password:', error);
      throw new Error('Failed to update branch password: ' + error.message);
    }
  },

  // Utility function to reset a specific branch password to default (niger123)
  async resetBranchToDefaultPassword(branchName) {
    requireOnline();
    
    try {
      const branchesRef = collection(db, COLLECTIONS.BRANCHES);
      const q = query(branchesRef, where('name', '==', branchName));
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        throw new Error(`Branch "${branchName}" not found`);
      }
      
      const branchDoc = snapshot.docs[0];
      const branchRef = doc(db, COLLECTIONS.BRANCHES, branchDoc.id);
      
      await updateDoc(branchRef, {
        password: 'niger123',
        passwordUpdatedAt: serverTimestamp(),
        passwordUpdatedBy: 'system_reset'
      });
      
      console.log(`✅ Branch "${branchName}" password reset to default (niger123)`);
      return true;
    } catch (error) {
      console.error('❌ Error resetting branch password:', error);
      throw new Error('Failed to reset branch password: ' + error.message);
    }
  }
};

// --- ICAN User Service ---
export const ICANUserService = {
  async findUser(email, branchId) {
    requireOnline();
    
    try {
      const usersRef = collection(db, COLLECTIONS.USERS);
      const q = query(usersRef, where('email', '==', email), where('branchId', '==', branchId));
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        return null;
      }
      
      const userDoc = snapshot.docs[0];
      return { id: userDoc.id, ...userDoc.data() };
    } catch (error) {
      console.error('❌ Error finding user:', error);
      throw new Error('Failed to find user: ' + error.message);
    }
  },

  async authenticateUser(email, branchId) {
    return this.findUser(email, branchId);
  },
  
  async getUserByEmailAndBranch(email, branchId) {
    return this.findUser(email, branchId);
  },

  async getUsersByBranch(branchId) {
    requireOnline();
    
    try {
      const usersRef = collection(db, COLLECTIONS.USERS);
      const q = query(usersRef, where('branchId', '==', branchId));
      const snapshot = await getDocs(q);
      
      const users = [];
      snapshot.forEach(doc => {
        users.push({ id: doc.id, ...doc.data() });
      });
      
      return users;
    } catch (error) {
      console.error('❌ Error fetching users:', error);
      throw new Error('Failed to fetch users: ' + error.message);
    }
  },

  async createUser(userData) {
    requireOnline();
    
    try {
      const usersRef = collection(db, COLLECTIONS.USERS);
      const docRef = await addDoc(usersRef, {
        ...userData,
        createdAt: serverTimestamp()
      });
      
      console.log('✅ User created:', docRef.id);
      
      // Log user creation activity
      await this.logActivity(docRef.id, {
        type: 'USER_CREATED',
        timestamp: serverTimestamp(),
        details: {
          email: userData.email,
          branch: userData.branch,
          role: userData.role
        }
      });
      
      return docRef.id;
    } catch (error) {
      console.error('❌ Error creating user:', error);
      throw new Error('Failed to create user: ' + error.message);
    }
  },

  async updateUser(userId, updates) {
    requireOnline();
    
    try {
      const userRef = doc(db, COLLECTIONS.USERS, userId);
      await updateDoc(userRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
      
      console.log('✅ User updated:', userId);
      return true;
    } catch (error) {
      console.error('❌ Error updating user:', error);
      throw new Error('Failed to update user: ' + error.message);
    }
  },

  async isEmailUsedForBranchLogin(email) {
    requireOnline();
    
    try {
      const usersRef = collection(db, COLLECTIONS.USERS);
      const q = query(usersRef, where('email', '==', email), where('isBranchUser', '==', true));
      const snapshot = await getDocs(q);
      
      return !snapshot.empty;
    } catch (error) {
      console.error('❌ Error checking email:', error);
      return false;
    }
  },

  async resetUserPassword(userId, newPassword, adminEmail) {
    requireOnline();
    
    try {
      await this.updateUser(userId, { password: newPassword });
      
      // Log password reset
      await this.logActivity(userId, {
        type: 'PASSWORD_RESET',
        timestamp: serverTimestamp(),
        details: {
          resetBy: adminEmail
        }
      });
      
      return true;
    } catch (error) {
      console.error('❌ Error resetting password:', error);
      throw new Error('Failed to reset password: ' + error.message);
    }
  },

  // NEW: Activity Logging Method
  async logActivity(userId, activityData) {
    requireOnline();
    
    try {
      const activitiesRef = collection(db, COLLECTIONS.ACTIVITIES);
      await addDoc(activitiesRef, {
        userId,
        ...activityData,
        timestamp: serverTimestamp(),
        createdAt: serverTimestamp()
      });
      
      console.log('✅ Activity logged:', activityData.type);
      return true;
    } catch (error) {
      console.error('❌ Error logging activity:', error);
      // Don't throw error for logging failures - they shouldn't block main operations
      return false;
    }
  },

  // NEW: Get User Activities
  async getUserActivities(userId, limitCount = 50) {
    requireOnline();
    
    try {
      const activitiesRef = collection(db, COLLECTIONS.ACTIVITIES);
      const q = query(
        activitiesRef, 
        where('userId', '==', userId),
        orderBy('timestamp', 'desc'),
        firestoreLimit(limitCount)
      );
      const snapshot = await getDocs(q);
      
      const activities = [];
      snapshot.forEach(doc => {
        activities.push({ id: doc.id, ...doc.data() });
      });
      
      return activities;
    } catch (error) {
      console.error('❌ Error fetching activities:', error);
      return [];
    }
  },

  // NEW: Get All Activities (for admin monitoring)
  async getAllActivities(limitCount = 100) {
    requireOnline();
    
    try {
      const activitiesRef = collection(db, COLLECTIONS.ACTIVITIES);
      const q = query(
        activitiesRef,
        orderBy('timestamp', 'desc'),
        firestoreLimit(limitCount)
      );
      const snapshot = await getDocs(q);
      
      const activities = [];
      snapshot.forEach(doc => {
        activities.push({ id: doc.id, ...doc.data() });
      });
      
      return activities;
    } catch (error) {
      console.error('❌ Error fetching all activities:', error);
      return [];
    }
  }
};

// --- ICAN Counter Service ---
export const ICANCounterService = {
  async getNextCounter(type, branchId) {
    requireOnline();
    
    try {
      const counterKey = `${branchId}_${type}`;
      const counterRef = doc(db, COLLECTIONS.COUNTERS, counterKey);
      const counterDoc = await getDoc(counterRef);
      
      let nextValue = 1;
      if (counterDoc.exists()) {
        nextValue = (counterDoc.data().value || 0) + 1;
      }
      
      await setDoc(counterRef, {
        value: nextValue,
        lastUpdated: serverTimestamp()
      });
      
      return nextValue;
    } catch (error) {
      console.error('❌ Error getting counter:', error);
      throw new Error('Failed to get counter: ' + error.message);
    }
  },

  async getMemberCount(branchId) {
    requireOnline();
    
    try {
      const usersRef = collection(db, COLLECTIONS.USERS);
      const q = query(usersRef, where('branchId', '==', branchId), where('isMember', '==', true));
      const snapshot = await getDocs(q);
      
      return snapshot.size;
    } catch (error) {
      console.error('❌ Error getting member count:', error);
      return 0;
    }
  },
  
  async incrementMemberCount(branchId) {
    // Member count is calculated dynamically
    return true;
  }
};

// --- ICAN Invoice Service ---
export const ICANInvoiceService = {
  async createInvoice(invoiceData) {
    requireOnline();
    
    try {
      const invoicesRef = collection(db, COLLECTIONS.INVOICES);
      const id = invoiceData.id || `INV-${Date.now()}`;
      const invoiceRef = doc(db, COLLECTIONS.INVOICES, id);
      
      await setDoc(invoiceRef, {
        ...invoiceData,
        id,
        createdAt: serverTimestamp()
      });
      
      // Log invoice creation activity
      if (invoiceData.userId) {
        await ICANUserService.logActivity(invoiceData.userId, {
          type: 'INVOICE_CREATED',
          timestamp: serverTimestamp(),
          details: {
            invoiceId: id,
            branch: invoiceData.branch,
            amount: invoiceData.totalAmount || 0
          }
        });
      }
      
      console.log('✅ Invoice created:', id);
      return id;
    } catch (error) {
      console.error('❌ Error creating invoice:', error);
      throw new Error('Failed to create invoice: ' + error.message);
    }
  },

  async getInvoicesByBranch(branchId, limit = 50) {
    requireOnline();
    
    try {
      const invoicesRef = collection(db, COLLECTIONS.INVOICES);
      // Query without orderBy to avoid requiring composite index
      const q = query(
        invoicesRef,
        where('branchId', '==', branchId)
      );
      const snapshot = await getDocs(q);
      
      const invoices = [];
      snapshot.forEach(doc => {
        invoices.push({ id: doc.id, ...doc.data() });
      });
      
      // Sort and limit in JavaScript to avoid composite index requirement
      invoices.sort((a, b) => {
        const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
        const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
        return dateB - dateA; // desc order
      });
      
      return invoices.slice(0, limit);
    } catch (error) {
      console.error('❌ Error fetching invoices:', error);
      console.error('Error details:', error.message);
      return [];
    }
  }
};

// --- ICAN Receipt Service ---
export const ICANReceiptService = {
  async createReceipt(receiptData) {
    requireOnline();
    
    try {
      const receiptsRef = collection(db, COLLECTIONS.RECEIPTS);
      const id = receiptData.id || `REC-${Date.now()}`;
      const receiptRef = doc(db, COLLECTIONS.RECEIPTS, id);
      
      await setDoc(receiptRef, {
        ...receiptData,
        id,
        createdAt: serverTimestamp()
      });
      
      // Log receipt creation activity
      if (receiptData.userId) {
        await ICANUserService.logActivity(receiptData.userId, {
          type: 'RECEIPT_CREATED',
          timestamp: serverTimestamp(),
          details: {
            receiptId: id,
            branch: receiptData.branch,
            amount: receiptData.amount || 0
          }
        });
      }
      
      console.log('✅ Receipt created:', id);
      return id;
    } catch (error) {
      console.error('❌ Error creating receipt:', error);
      throw new Error('Failed to create receipt: ' + error.message);
    }
  },

  async getReceiptsByBranch(branchId, limit = 50) {
    requireOnline();
    
    try {
      const receiptsRef = collection(db, COLLECTIONS.RECEIPTS);
      // Query without orderBy to avoid requiring composite index
      const q = query(
        receiptsRef,
        where('branchId', '==', branchId)
      );
      const snapshot = await getDocs(q);
      
      const receipts = [];
      snapshot.forEach(doc => {
        receipts.push({ id: doc.id, ...doc.data() });
      });
      
      // Sort and limit in JavaScript to avoid composite index requirement
      receipts.sort((a, b) => {
        const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
        const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
        return dateB - dateA; // desc order
      });
      
      return receipts.slice(0, limit);
    } catch (error) {
      console.error('❌ Error fetching receipts:', error);
      console.error('Error details:', error.message);
      return [];
    }
  }
};

// --- ICAN Stats Service ---
export const ICANStatsService = {
  async getBranchStatistics(branchId) {
    requireOnline();
    
    const invoices = await ICANInvoiceService.getInvoicesByBranch(branchId, 10);
    const receipts = await ICANReceiptService.getReceiptsByBranch(branchId, 10);
    
    return {
      recentInvoices: invoices,
      recentReceipts: receipts
    };
  }
};

// Firebase service export
export const ICANFirebaseService = {
  db,
  auth,
  collections: COLLECTIONS
};

// Export activity logging helper for external use
export const logActivity = ICANUserService.logActivity;

// Export a default object for convenience
export default {
  ICANBranchService,
  ICANUserService,
  ICANSeedService,
  ICANCounterService,
  ICANInvoiceService,
  ICANReceiptService,
  ICANStatsService,
  ICANFirebaseService,
  logActivity
};
