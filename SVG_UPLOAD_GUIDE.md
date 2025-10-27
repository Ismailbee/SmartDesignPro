# 📤 SVG to AWS S3/CloudFront Upload Script - User Guide

## 📋 Overview

This script automates the process of uploading SVG files from your local computer to AWS S3 and makes them accessible via CloudFront CDN.

---

## ✅ Prerequisites

### 1. Dependencies Installed
The required dependencies have been installed:
- ✅ `@aws-sdk/client-s3` - AWS SDK v3 for S3 operations
- ✅ `chokidar` - File system watcher for watch mode

### 2. AWS Configuration
The script is pre-configured with your AWS credentials:
- **S3 Bucket:** `designpro-storage`
- **Region:** `af-south-1` (Africa - Cape Town)
- **CloudFront Domain:** `d27paqapg0ahqm.cloudfront.net`

### 3. Directory Structure
The script expects SVG files in the `./svg/` directory:
```
your-project/
├── svg/
│   ├── wedding/
│   │   ├── sticker1.svg
│   │   └── sticker2.svg
│   ├── memo/
│   │   └── note1.svg
│   └── other-file.svg
├── upload-svgs-to-s3.js
└── cloudfront-urls.json (generated after upload)
```

---

## 🚀 Usage

### Basic Upload (Upload All SVG Files)
```bash
node upload-svgs-to-s3.cjs
```

This will:
1. Scan the `./svg/` directory recursively for all `.svg` files
2. Upload each file to S3 with proper Content-Type
3. Preserve the folder structure in S3
4. Generate `cloudfront-urls.json` with CloudFront URLs
5. Display a summary of uploads

### Dry Run Mode (Preview Without Uploading)
```bash
node upload-svgs-to-s3.cjs --dry-run
```

This will:
- Show what files would be uploaded
- Display the CloudFront URLs that would be generated
- **NOT** actually upload any files
- Useful for testing before real upload

### Watch Mode (Auto-Upload on Changes)
```bash
node upload-svgs-to-s3.cjs --watch
# or
node upload-svgs-to-s3.cjs -w
```

This will:
1. Upload all existing SVG files
2. Continue running and watch for changes
3. Automatically upload new or modified SVG files
4. Update `cloudfront-urls.json` after each upload
5. Press `Ctrl+C` to stop watching

---

## 📊 Output

### Console Output Example
```
========================================
🚀 SVG to S3/CloudFront Upload Script
========================================

🔍 Scanning for SVG files...

📋 Found 5 SVG file(s)

📤 Uploading: wedding/sticker1.svg...
   ✓ Uploaded successfully: https://d27paqapg0ahqm.cloudfront.net/wedding/sticker1.svg
📤 Uploading: wedding/sticker2.svg...
   ✓ Uploaded successfully: https://d27paqapg0ahqm.cloudfront.net/wedding/sticker2.svg
📤 Uploading: memo/note1.svg...
   ✓ Uploaded successfully: https://d27paqapg0ahqm.cloudfront.net/memo/note1.svg

💾 Saved URL mapping to: cloudfront-urls.json

========================================
📊 UPLOAD SUMMARY
========================================
✅ Total files uploaded: 5
❌ Total errors: 0
📁 Total files in mapping: 5
========================================

✅ Upload complete!
```

### Generated JSON File (`cloudfront-urls.json`)
```json
{
  "svg/wedding/sticker1.svg": "https://d27paqapg0ahqm.cloudfront.net/wedding/sticker1.svg",
  "svg/wedding/sticker2.svg": "https://d27paqapg0ahqm.cloudfront.net/wedding/sticker2.svg",
  "svg/memo/note1.svg": "https://d27paqapg0ahqm.cloudfront.net/memo/note1.svg",
  "svg/other-file.svg": "https://d27paqapg0ahqm.cloudfront.net/other-file.svg"
}
```

---

## 🎯 Features

### ✅ Implemented Features

1. **Recursive File Discovery**
   - Scans all subdirectories in `./svg/`
   - Finds all `.svg` files automatically

2. **Folder Structure Preservation**
   - Maintains exact folder hierarchy in S3
   - Example: `./svg/wedding/sticker1.svg` → `s3://designpro-storage/wedding/sticker1.svg`

3. **Proper S3 Configuration**
   - Sets `Content-Type: image/svg+xml`
   - Uses bucket policy for public access (ACL-free configuration)
   - Overwrites existing files automatically

4. **CloudFront URL Generation**
   - Generates accessible URLs for all uploaded files
   - Saves mapping to `cloudfront-urls.json`

5. **Watch Mode**
   - Monitors `./svg/` directory for changes
   - Auto-uploads new or modified files
   - Updates JSON mapping automatically

6. **Dry Run Mode**
   - Preview uploads without actually uploading
   - Test the script safely

7. **Error Handling**
   - Graceful error handling with descriptive messages
   - Continues uploading even if some files fail
   - Reports errors in summary

8. **Progress Logging**
   - Real-time upload progress
   - Clear success/error messages
   - Detailed summary at the end

---

## 📁 File Structure in S3

After upload, your S3 bucket will have this structure:

```
s3://designpro-storage/
├── wedding/
│   ├── sticker1.svg
│   └── sticker2.svg
├── memo/
│   └── note1.svg
└── other-file.svg
```

Each file is accessible via CloudFront:
- `https://d27paqapg0ahqm.cloudfront.net/wedding/sticker1.svg`
- `https://d27paqapg0ahqm.cloudfront.net/wedding/sticker2.svg`
- `https://d27paqapg0ahqm.cloudfront.net/memo/note1.svg`
- `https://d27paqapg0ahqm.cloudfront.net/other-file.svg`

---

## 🔧 Troubleshooting

### Issue: "Source directory not found"
**Solution:** Create the `./svg/` directory and add your SVG files:
```bash
mkdir svg
# Add your SVG files to the svg directory
```

### Issue: "No SVG files found"
**Solution:** Ensure you have `.svg` files in the `./svg/` directory or subdirectories.

### Issue: Upload fails with AWS error
**Possible causes:**
1. **Invalid credentials** - Check AWS Access Key and Secret Key
2. **Bucket doesn't exist** - Verify bucket name is correct
3. **Insufficient permissions** - Ensure IAM user has S3 PutObject permission
4. **Region mismatch** - Verify region is `af-south-1`

### Issue: Files upload but CloudFront URLs don't work
**Solution:**
1. Verify CloudFront distribution is configured correctly
2. Check that CloudFront origin points to the S3 bucket
3. Wait a few minutes for CloudFront cache to update
4. Ensure bucket policy allows public access

### Issue: Watch mode not detecting changes
**Solution:**
1. Ensure you're not in dry-run mode (`--dry-run` disables watch mode)
2. Check that files are being saved in the `./svg/` directory
3. Verify file extensions are `.svg` (case-insensitive)

---

## 🎨 Use Cases

### Use Case 1: Initial Bulk Upload
Upload all existing SVG files at once:
```bash
node upload-svgs-to-s3.cjs
```

### Use Case 2: Development Workflow
Auto-upload files as you create/modify them:
```bash
node upload-svgs-to-s3.cjs --watch
```
Leave this running while you work on SVG files.

### Use Case 3: Testing Before Upload
Preview what will be uploaded:
```bash
node upload-svgs-to-s3.cjs --dry-run
```

### Use Case 4: Re-upload Specific Files
1. Delete entries from `cloudfront-urls.json` for files you want to re-upload
2. Run the script again - it will upload missing files

---

## 📝 Notes

### File Overwriting
- The script **overwrites** existing files in S3 without warning
- This is intentional for easy updates
- If you need versioning, enable S3 bucket versioning

### CloudFront Caching
- CloudFront caches files for performance
- After uploading, it may take a few minutes for changes to propagate
- To force refresh, you can invalidate CloudFront cache (separate process)

### JSON Mapping File
- `cloudfront-urls.json` is updated after each upload
- You can use this file in your application to reference CloudFront URLs
- The file persists between script runs

### Security Note
- AWS credentials are hardcoded in the script for convenience
- For production use, consider using environment variables or AWS credentials file
- Never commit AWS credentials to public repositories

---

## 🚀 Quick Start Checklist

- [x] Dependencies installed (`@aws-sdk/client-s3`, `chokidar`)
- [x] Created `./svg/` directory with subdirectories (wedding/, memo/)
- [ ] Add SVG files to `./svg/` directory (with subdirectories if needed)
- [ ] Run `node test-svg-upload.cjs` to verify setup
- [ ] Run `node upload-svgs-to-s3.cjs --dry-run` to preview
- [ ] Run `node upload-svgs-to-s3.cjs` to upload
- [ ] Check `cloudfront-urls.json` for CloudFront URLs
- [ ] Test CloudFront URLs in browser
- [ ] (Optional) Use `--watch` mode for automatic uploads

---

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Verify AWS credentials and permissions
3. Ensure S3 bucket and CloudFront distribution are configured correctly
4. Check console output for specific error messages

---

## ✨ Summary

**Script Files:**
- Main script: `upload-svgs-to-s3.cjs`
- Test script: `test-svg-upload.cjs`

**Output File:** `cloudfront-urls.json`
**Source Directory:** `./svg/`

**Commands:**
- Test setup: `node test-svg-upload.cjs`
- Upload all: `node upload-svgs-to-s3.cjs`
- Dry run: `node upload-svgs-to-s3.cjs --dry-run`
- Watch mode: `node upload-svgs-to-s3.cjs --watch`

**Ready to use!** 🎉

