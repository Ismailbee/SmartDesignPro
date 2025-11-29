# Performance Improvements

We have optimized the app to prevent hanging and freezing on mobile devices.

## Changes Made

1.  **Smoother Typing (Debouncing)**:
    *   **Issue**: The app was recalculating the entire design (checking for keywords like "Wedding", "Nikkah", replacing SVGs, updating text) on *every single keystroke*. This caused the keyboard to lag or the app to freeze while typing.
    *   **Fix**: Added a "debounce" delay (500ms). The app now waits for you to stop typing for half a second before processing the design updates.

2.  **Faster Camera & OCR**:
    *   **Issue**: The text scanner was using the "Best" accuracy model, which downloads large files (~20MB) and uses significant CPU/Memory, causing hangs on older phones.
    *   **Fix**: Switched to the "Fast" model (`tessdata_fast`). It is much lighter and faster, perfect for mobile devices, with minimal loss in accuracy for clear text.
    *   **Optimization**: Reduced the camera capture quality slightly (from 90% to 80%) to reduce memory usage and processing time without noticeably affecting visual quality.

## How to Apply Changes

To see these improvements on your Android device, you must rebuild the app:

1.  **Build the Web Assets**:
    ```bash
    npm run build
    ```

2.  **Sync with Android**:
    ```bash
    npx cap sync android
    ```

3.  **Run the App**:
    *   Open Android Studio (`npx cap open android`) and run the app again.
    *   Or, if you are just testing the web version, restart your dev server.
