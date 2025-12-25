/**
 * DEPRECATED: This file is no longer used
 * ICAN now uses the main SmartDesignPro Firebase configuration
 * 
 * All ICAN Firebase operations are handled through:
 * @/config/firebase (main SmartDesignPro Firebase)
 * 
 * This file is kept for reference only and should NOT be imported.
 * If you see imports from this file, replace them with:
 * import { db, auth } from '@/config/firebase'
 */

// THIS FILE IS DEPRECATED - DO NOT USE
const DEPRECATED_NOTICE = `
⚠️ DEPRECATED: This ICAN Firebase config is no longer used.
✅ ICAN now uses the main SmartDesignPro Firebase: @/config/firebase
📦 All ICAN data is stored in the main Firebase with 'ican_' prefix.
`;

console.error('❌ DEPRECATED: Do not import from src/views/micro-apps/Ican/src/config/firebase.js');
console.error(DEPRECATED_NOTICE);
console.log('✅ Use: import { db, auth } from "@/config/firebase" instead');

// DO NOT IMPORT FROM THIS FILE
// Use: import { db, auth } from '@/config/firebase'
export const db = null;
export const auth = null;
