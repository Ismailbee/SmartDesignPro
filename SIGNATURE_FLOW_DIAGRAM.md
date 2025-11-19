# 📊 Signature Integration Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         SIGNATURE INTEGRATION FLOW                           │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────┐
│  SCENARIO 1: Creating Signature from Invoice Page                            │
└──────────────────────────────────────────────────────────────────────────────┘

    ┌─────────────┐
    │ Invoice Page│
    │  (Step 1)   │
    └──────┬──────┘
           │
           │ User fills invoice details
           │ Scrolls to "Digital Signatures" section
           │
    ┌──────▼──────┐
    │ Click       │
    │"Create New" │
    │   Button    │
    └──────┬──────┘
           │
           │ 🔐 localStorage.setItem('signatureReturnPath', '/invoice')
           │ 🔐 localStorage.setItem('signatureReturnType', 'invoice')
           │ 🚀 router.push('/signature')
           │
    ┌──────▼──────────┐
    │ Signature Page  │
    │    (Step 2)     │
    └──────┬──────────┘
           │
           │ User draws signature on canvas
           │ Chooses color, pen size
           │
    ┌──────▼──────┐
    │ Click       │
    │   "Save     │
    │ Signature"  │
    └──────┬──────┘
           │
           │ 💾 Save to Firebase: saveSignature(branch, signatureData)
           │ 📍 localStorage.getItem('signatureReturnPath') → '/invoice'
           │ 📍 localStorage.getItem('signatureReturnType') → 'invoice'
           │
    ┌──────▼──────────────────────────────────────────────┐
    │ Confirmation Prompt:                                 │
    │ "✅ Signature saved successfully!"                   │
    │ "Would you like to return to Invoice page           │
    │  to use this signature?"                             │
    │                                                      │
    │        [OK]          [Cancel]                        │
    └──────┬───────────────────┬────────────────────────────┘
           │                   │
           │ User clicks OK    │ User clicks Cancel
           │                   │
    ┌──────▼──────┐    ┌──────▼──────┐
    │ Clear       │    │ Stay on     │
    │ localStorage│    │ Signature   │
    │ items       │    │ Page        │
    └──────┬──────┘    └─────────────┘
           │
           │ 🧹 localStorage.removeItem('signatureReturnPath')
           │ 🧹 localStorage.removeItem('signatureReturnType')
           │ 🚀 router.push('/invoice')
           │
    ┌──────▼──────────┐
    │ Invoice Page    │
    │   (Step 3)      │
    │                 │
    │ 🔄 visibilitychange event triggered
    │ 📥 loadSignatures() called
    │ ✨ New signature appears in dropdown
    └─────────────────┘


┌──────────────────────────────────────────────────────────────────────────────┐
│  SCENARIO 2: Using Existing Signatures                                       │
└──────────────────────────────────────────────────────────────────────────────┘

    ┌─────────────┐
    │ Invoice /   │
    │Receipt Page │
    └──────┬──────┘
           │
           │ onMounted: loadSignatures()
           │
    ┌──────▼─────────────────────────────────┐
    │ Firebase Database Query:               │
    │ getAllSignatures(branch)               │
    │                                        │
    │ Returns: {                             │
    │   success: true,                       │
    │   data: [signature1, signature2, ...]  │
    │ }                                      │
    └──────┬─────────────────────────────────┘
           │
           │ Populate savedSignatures array
           │ Auto-select primary signature if exists
           │
    ┌──────▼──────────────────────────────────────┐
    │ Digital Signatures Section:                 │
    │                                             │
    │ ┌─────────────────────────────┐             │
    │ │ Signature 1 (Left)          │             │
    │ │ [Dropdown ▼] No signature   │             │
    │ │              Signature A    │             │
    │ │              Signature B (Primary)        │
    │ │              Signature C    │             │
    │ └─────────────────────────────┘             │
    │                                             │
    │ ┌─────────────────────────────┐             │
    │ │ Signature 2 (Right)         │             │
    │ │ [Dropdown ▼] No signature   │             │
    │ │              Signature A    │             │
    │ │              Signature B (Primary)        │
    │ │              Signature C    │             │
    │ └─────────────────────────────┘             │
    └──────┬──────────────────────────────────────┘
           │
           │ User selects signature from dropdown
           │
    ┌──────▼──────────────────────────┐
    │ handleSignature1Change() /      │
    │ handleSignature2Change()        │
    │                                 │
    │ Find selected signature by ID   │
    │ Set signatureImage1/2 = dataURL │
    └──────┬──────────────────────────┘
           │
    ┌──────▼──────────────────────┐
    │ Preview Shows:              │
    │ ┌─────────────────────────┐ │
    │ │ [Signature Image]       │ │
    │ └─────────────────────────┘ │
    └─────────────────────────────┘


┌──────────────────────────────────────────────────────────────────────────────┐
│  SCENARIO 3: Back Button Navigation                                          │
└──────────────────────────────────────────────────────────────────────────────┘

    ┌─────────────────┐
    │ Signature Page  │
    └────────┬────────┘
             │
             │ User clicks "Back" button
             │
    ┌────────▼────────────────────────────────┐
    │ handleBack() checks:                    │
    │ localStorage.getItem('signatureReturn   │
    │ Path')                                  │
    └────────┬────────────────────────────────┘
             │
    ┌────────▼────────────┐
    │ Return path exists? │
    └────┬───────────┬────┘
         │ YES       │ NO
         │           │
    ┌────▼────┐  ┌──▼────────────┐
    │ Return  │  │ Go to Invoice/│
    │ to path │  │ Receipt       │
    │ stored  │  │ Selection     │
    │         │  │ Page          │
    │ Examples│  └───────────────┘
    │ /invoice│
    │ /receipt│
    └─────────┘


┌──────────────────────────────────────────────────────────────────────────────┐
│  DATA FLOW DIAGRAM                                                            │
└──────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────┐
│   Browser Storage    │
│                      │
│  authenticatedMember │◄──────────────┐
│  {                   │               │
│    name: "John Doe"  │               │
│    branch: "Minna"   │               │
│    role: "Admin"     │               │
│  }                   │               │
└──────────┬───────────┘               │
           │                           │
           │ Used to fetch             │
           │ branch-specific           │
           │ signatures                │
           │                           │
           ▼                           │
┌────────────────────────┐     ┌───────┴──────────┐
│ Firebase Database      │     │   Vue Component  │
│                        │     │   (Invoice/      │
│ signatures_Minna: [    │◄───►│    Receipt/      │
│   {                    │     │    Signature)    │
│     id: "SIG-123",     │     └──────────────────┘
│     name: "Sig 1",     │              │
│     dataURL: "data:...",│              │
│     isPrimary: true,   │              │
│     branch: "Minna",   │              │
│     createdAt: "..."   │              │
│   },                   │              │
│   ...                  │              │
│ ]                      │              │
└────────────────────────┘              │
                                        │
┌───────────────────────────────────────▼──────┐
│         Temporary Navigation Storage         │
│                                              │
│  signatureReturnPath: "/invoice"            │
│  signatureReturnType: "invoice"             │
│                                              │
│  (Cleared after returning to origin page)   │
└──────────────────────────────────────────────┘


┌──────────────────────────────────────────────────────────────────────────────┐
│  COMPONENT COMMUNICATION                                                      │
└──────────────────────────────────────────────────────────────────────────────┘

    InvoicePage.vue
    ├── handleCreateSignature()
    │   ├── Set signatureReturnPath = '/invoice'
    │   ├── Set signatureReturnType = 'invoice'
    │   └── Navigate to /signature
    │
    ├── loadSignatures()
    │   └── Call getAllSignatures(branch)
    │
    ├── handleSignature1Change()
    │   └── Update signatureImage1
    │
    └── handleSignature2Change()
        └── Update signatureImage2

    ReceiptPage.vue
    ├── handleCreateSignature()
    │   ├── Set signatureReturnPath = '/receipt'
    │   ├── Set signatureReturnType = 'receipt'
    │   └── Navigate to /signature
    │
    ├── loadSignatures()
    │   └── Call getAllSignatures(branch)
    │
    ├── handleSignature1Change()
    │   └── Update signatureImage1
    │
    └── handleSignature2Change()
        └── Update signatureImage2

    SignaturePage.vue
    ├── loadSignatures()
    │   └── Call getAllSignatures(branch)
    │
    ├── saveSignature()
    │   ├── Call saveSignatureDB(branch, data)
    │   ├── Check returnPath and returnType
    │   ├── Show confirmation prompt
    │   └── Navigate back if confirmed
    │
    ├── deleteSignature(id)
    │   └── Call deleteSignatureDB(branch, id)
    │
    ├── selectSignature(id)
    │   └── Set selectedSignature = id
    │
    └── handleBack()
        ├── Check signatureReturnPath
        └── Navigate to appropriate page

    database.js
    ├── getAllSignatures(branch)
    │   └── Return signatures from localStorage
    │
    ├── saveSignature(branch, data)
    │   └── Save to localStorage key: signatures_${branch}
    │
    └── deleteSignature(branch, id)
        └── Remove from localStorage


┌──────────────────────────────────────────────────────────────────────────────┐
│  STATE MANAGEMENT                                                             │
└──────────────────────────────────────────────────────────────────────────────┘

    Component State (ref):
    ┌────────────────────────────────────┐
    │ savedSignatures: []                │  ← Loaded from Firebase
    │ selectedSignature1: ''             │  ← User selection
    │ selectedSignature2: ''             │  ← User selection
    │ signatureImage1: null              │  ← dataURL for preview
    │ signatureImage2: null              │  ← dataURL for preview
    │ loadingSignatures: false           │  ← Loading state
    └────────────────────────────────────┘

    Temporary Navigation State (localStorage):
    ┌────────────────────────────────────┐
    │ signatureReturnPath: string        │  ← Where to return
    │ signatureReturnType: string        │  ← Document type
    └────────────────────────────────────┘

    Persistent Storage (localStorage):
    ┌────────────────────────────────────┐
    │ authenticatedMember: object        │  ← User info
    │ signatures_${branch}: array        │  ← Signature data
    └────────────────────────────────────┘


┌──────────────────────────────────────────────────────────────────────────────┐
│  EVENT FLOW                                                                   │
└──────────────────────────────────────────────────────────────────────────────┘

1. Page Load (Invoice/Receipt)
   └─► onMounted
       └─► loadSignatures()
           └─► getAllSignatures(branch)
               └─► Update savedSignatures
                   └─► Auto-select primary

2. Create New Signature
   └─► Click "Create New"
       └─► handleCreateSignature()
           └─► Store return path
               └─► Navigate to /signature

3. Draw and Save
   └─► Click "Save Signature"
       └─► saveSignature()
           └─► Save to database
               └─► Check return path
                   └─► Show prompt
                       └─► Navigate back (if confirmed)

4. Return to Origin Page
   └─► visibilitychange event
       └─► document.hidden === false
           └─► loadSignatures()
               └─► New signature appears

5. Select Signature
   └─► Change dropdown selection
       └─► handleSignature1/2Change()
           └─► Update signatureImage1/2
               └─► Preview updates


┌──────────────────────────────────────────────────────────────────────────────┐
│  SUCCESS INDICATORS                                                           │
└──────────────────────────────────────────────────────────────────────────────┘

✅ Navigation Context Preserved
   - returnPath stored before navigation
   - returnType identifies document

✅ Seamless Return
   - Confirmation prompt appears
   - User can choose to return or stay
   - Automatic navigation on confirmation

✅ Auto-Refresh
   - visibilitychange event listener active
   - loadSignatures() called on page visibility
   - New signatures appear without manual refresh

✅ Branch Isolation
   - Signatures stored per branch
   - Only branch members see their signatures
   - No cross-contamination

✅ Data Persistence
   - Signatures saved to localStorage
   - Survives page refresh
   - Available across sessions

✅ User Experience
   - Clear visual feedback
   - Intuitive workflow
   - No data loss
   - Professional interface
```

---

## 🎯 Key Takeaways

1. **Context is King**: The system remembers where you came from
2. **User Choice**: Confirmation prompts give control
3. **Auto-Magic**: Signatures reload automatically
4. **Branch Safety**: Data isolation per organization
5. **Firebase Integration**: Unified data access layer
6. **Seamless Flow**: Minimal interruption to workflow

---

**Architecture Summary**: The integration uses a combination of localStorage for temporary navigation state and branch-specific signature storage, with Vue Router for seamless navigation and the Document Visibility API for automatic data refresh. 🏗️✨
