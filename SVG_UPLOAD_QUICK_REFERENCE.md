# 🚀 SVG Upload - Quick Reference Card

## ⚡ Quick Commands

```bash
# Test setup
node test-svg-upload.cjs

# Preview upload (no actual upload)
node upload-svgs-to-s3.cjs --dry-run

# Upload all SVG files
node upload-svgs-to-s3.cjs

# Upload and watch for changes
node upload-svgs-to-s3.cjs --watch
```

---

## 📁 Directory Structure

```
./svg/
├── wedding/        # Wedding-related SVGs
├── memo/           # Memo-related SVGs
└── [other]/        # Any other subdirectories
```

---

## 🔗 AWS Configuration

| Setting | Value |
|---------|-------|
| S3 Bucket | `designpro-storage` |
| Region | `af-south-1` |
| CloudFront | `d27paqapg0ahqm.cloudfront.net` |

---

## 📤 Upload Flow

1. Add SVG files to `./svg/` directory
2. Run `node upload-svgs-to-s3.cjs`
3. Check `cloudfront-urls.json` for URLs
4. Test URLs in browser

---

## 🔗 URL Format

**Local:** `./svg/wedding/sticker1.svg`  
**S3:** `s3://designpro-storage/wedding/sticker1.svg`  
**CloudFront:** `https://d27paqapg0ahqm.cloudfront.net/wedding/sticker1.svg`

---

## ✅ Checklist

- [x] Dependencies installed
- [x] Directory structure created
- [ ] Add SVG files
- [ ] Test setup
- [ ] Preview upload
- [ ] Upload files
- [ ] Verify URLs

---

## 📊 Output File

**File:** `cloudfront-urls.json`

**Format:**
```json
{
  "svg/wedding/sticker1.svg": "https://d27paqapg0ahqm.cloudfront.net/wedding/sticker1.svg"
}
```

---

## 🔧 Troubleshooting

| Issue | Solution |
|-------|----------|
| No SVG files found | Add .svg files to ./svg/ |
| Upload fails | Check AWS credentials |
| URLs don't work | Wait for CloudFront cache |

---

## 📚 Documentation

- **Full Guide:** `SVG_UPLOAD_GUIDE.md`
- **Summary:** `SVG_UPLOAD_COMPLETE_SUMMARY.md`
- **This Card:** `SVG_UPLOAD_QUICK_REFERENCE.md`

---

## 🎯 Common Use Cases

### Initial Upload
```bash
node upload-svgs-to-s3.cjs
```

### Development Workflow
```bash
node upload-svgs-to-s3.cjs --watch
```
Leave running while working on SVGs.

### Testing
```bash
node upload-svgs-to-s3.cjs --dry-run
```

---

**Ready to upload!** 🚀

