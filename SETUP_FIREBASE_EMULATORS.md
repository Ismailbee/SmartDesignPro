# 🔥 Setup Firebase Emulators (Work Offline)

This allows you to develop without internet connection or if Firebase is blocked.

## Step 1: Install Firebase Tools

```bash
npm install -g firebase-tools
```

## Step 2: Login to Firebase

```bash
firebase login
```

## Step 3: Initialize Emulators

```bash
firebase init emulators
```

**Select these options:**
- ✅ Authentication Emulator
- ✅ Firestore Emulator
- ✅ Storage Emulator

**Use default ports:**
- Authentication: 9099
- Firestore: 8080
- Storage: 9199

## Step 4: Create firebase.json

Create `firebase.json` in project root:

```json
{
  "emulators": {
    "auth": {
      "port": 9099
    },
    "firestore": {
      "port": 8080
    },
    "storage": {
      "port": 9199
    },
    "ui": {
      "enabled": true,
      "port": 4000
    }
  }
}
```

## Step 5: Update Firebase Config

Update `src/config/firebase.ts` to use emulators in development:

```typescript
// After initializing Firebase, add this:
if (import.meta.env.DEV) {
  // Use emulators in development
  connectAuthEmulator(auth, 'http://localhost:9099')
  connectFirestoreEmulator(db, 'localhost', 8080)
  connectStorageEmulator(storage, 'localhost', 9199)
  console.log('🔧 Using Firebase Emulators')
}
```

## Step 6: Start Emulators

```bash
firebase emulators:start
```

## Step 7: Start Your App

In a new terminal:

```bash
ionic serve
```

## Step 8: Test

1. Go to http://localhost:8100
2. Try to register/login
3. Data will be stored locally in emulators
4. View data at http://localhost:4000 (Emulator UI)

## Benefits

- ✅ Work offline
- ✅ No network issues
- ✅ Faster development
- ✅ Free (no Firebase quota)
- ✅ Easy testing

## Note

Emulator data is temporary and cleared when you stop the emulators.

