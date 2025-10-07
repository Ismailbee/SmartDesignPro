# 🚀 Template Marketplace - Quick Start Guide

## ⚡ Get Started in 3 Minutes

### Step 1: Install Dependencies (30 seconds)

```bash
# Backend dependencies are already in your package.json
# Just make sure they're installed
npm install
```

### Step 2: Start Marketplace Server (10 seconds)

```bash
node marketplace-server.js
```

You should see:
```
============================================================
🎨 Template Marketplace Server
============================================================
🚀 Server running on http://localhost:3004
📊 Health check: http://localhost:3004/health
💾 Database: marketplace.db
📁 Uploads: marketplace-uploads/
============================================================
✅ Seeded 6 sample templates
============================================================
Endpoints:
  GET    /api/templates
  GET    /api/templates/:id
  POST   /api/templates/upload
  PUT    /api/templates/:id
  DELETE /api/templates/:id
  POST   /api/templates/:id/like
  POST   /api/templates/:id/purchase
  GET    /api/user/:userId/library
  POST   /api/user/:userId/library/save
============================================================
```

### Step 3: Test the API (1 minute)

Open your browser or use curl:

```bash
# View all templates
curl http://localhost:3004/api/templates

# View business card templates
curl "http://localhost:3004/api/templates?category=business-cards"

# View free templates
curl "http://localhost:3004/api/templates?accessLevel=free"

# Search for "modern" templates
curl "http://localhost:3004/api/templates?search=modern"
```

---

## 🎯 Try These Examples

### Example 1: Browse Templates by Category

```bash
# Stickers
curl "http://localhost:3004/api/templates?category=stickers"

# Flyers & Posters
curl "http://localhost:3004/api/templates?category=flyers-posters"

# Social Media
curl "http://localhost:3004/api/templates?category=social-media"

# Business Cards
curl "http://localhost:3004/api/templates?category=business-cards"
```

### Example 2: Filter by Access Level

```bash
# Free templates only
curl "http://localhost:3004/api/templates?accessLevel=free"

# Premium templates only
curl "http://localhost:3004/api/templates?accessLevel=premium"

# Exclusive templates only
curl "http://localhost:3004/api/templates?accessLevel=exclusive"
```

### Example 3: Sort Templates

```bash
# Most popular
curl "http://localhost:3004/api/templates?sortBy=popular"

# Newest first
curl "http://localhost:3004/api/templates?sortBy=newest"

# Trending
curl "http://localhost:3004/api/templates?sortBy=trending"

# Price: Low to High
curl "http://localhost:3004/api/templates?sortBy=price-low"

# Price: High to Low
curl "http://localhost:3004/api/templates?sortBy=price-high"
```

### Example 4: Search Templates

```bash
# Search by keyword
curl "http://localhost:3004/api/templates?search=business"

# Search with filters
curl "http://localhost:3004/api/templates?search=modern&category=business-cards&accessLevel=free"
```

### Example 5: Get Single Template

```bash
# First, get a template ID from the list
curl http://localhost:3004/api/templates

# Then fetch that specific template
curl "http://localhost:3004/api/templates/TEMPLATE_ID_HERE"
```

---

## 📊 Sample Templates Available

The server comes with 6 pre-seeded templates:

1. **Modern Business Card** (Free)
   - Category: Business Cards
   - Downloads: 1,250 | Likes: 340 | Views: 5,600

2. **Colorful Event Flyer** (Premium - ₦200)
   - Category: Flyers & Posters
   - Downloads: 890 | Likes: 210 | Views: 3,400

3. **Professional Invoice Template** (Free)
   - Category: Receipt & Invoice
   - Downloads: 2,100 | Likes: 450 | Views: 7,800

4. **Instagram Post Template** (Free)
   - Category: Social Media
   - Downloads: 3,200 | Likes: 680 | Views: 9,500

5. **Vintage Sticker Pack** (Premium - ₦150)
   - Category: Stickers
   - Downloads: 560 | Likes: 180 | Views: 2,300

6. **Luxury Brand Banner** (Exclusive - ₦500)
   - Category: Flex Banners
   - Downloads: 120 | Likes: 95 | Views: 890

---

## 🎨 Template Categories

Browse templates in these categories:

1. 🏷️ **Stickers** - Custom stickers and decals
2. 🧾 **Receipt & Invoice** - Professional receipts and invoices
3. 📄 **Flyers & Posters** - Eye-catching flyers and posters
4. 📓 **Exercise Books** - Journals and exercise books
5. 💼 **Business Cards** - Professional business cards
6. 🎪 **Flex Banners** - Large format banners
7. 📱 **Social Media** - Social media content templates
8. 🕐 **Clock Design** - Custom clock face designs
9. 🏷️ **Tags & Labels** - Product tags and labels
10. 📋 **Forms** - Business forms and documents
11. 👕 **Cloth Patterns** - Textile and fabric patterns

---

## 🔧 Advanced Queries

### Combine Multiple Filters:

```bash
# Free business cards, sorted by popularity
curl "http://localhost:3004/api/templates?category=business-cards&accessLevel=free&sortBy=popular"

# Premium templates under ₦300
curl "http://localhost:3004/api/templates?accessLevel=premium&maxPrice=300"

# Featured templates only
curl "http://localhost:3004/api/templates?isFeatured=true"

# Search "modern" in social media category
curl "http://localhost:3004/api/templates?search=modern&category=social-media"
```

### Pagination:

```bash
# First page (12 templates)
curl "http://localhost:3004/api/templates?page=1&pageSize=12"

# Second page
curl "http://localhost:3004/api/templates?page=2&pageSize=12"

# Show 24 templates per page
curl "http://localhost:3004/api/templates?page=1&pageSize=24"
```

---

## 🧪 Test User Actions

### Like a Template:

```bash
curl -X POST http://localhost:3004/api/templates/TEMPLATE_ID/like \
  -H "Content-Type: application/json" \
  -d '{"userId": "user-123"}'
```

### Purchase a Template:

```bash
curl -X POST http://localhost:3004/api/templates/TEMPLATE_ID/purchase \
  -H "Content-Type: application/json" \
  -d '{"userId": "user-123"}'
```

### Save to Library:

```bash
curl -X POST http://localhost:3004/api/user/user-123/library/save \
  -H "Content-Type: application/json" \
  -d '{"templateId": "TEMPLATE_ID"}'
```

### Get User Library:

```bash
curl http://localhost:3004/api/user/user-123/library
```

---

## 📁 File Structure

After starting the server, you'll see:

```
your-project/
├── marketplace-server.js          # Server code
├── marketplace-server-package.json # Dependencies
├── marketplace.db                  # SQLite database (auto-created)
└── marketplace-uploads/            # Uploaded files (auto-created)
```

---

## 🐛 Troubleshooting

### Server won't start?

```bash
# Check if port 3004 is in use
netstat -ano | findstr :3004

# Kill the process if needed
taskkill /PID <process_id> /F

# Restart server
node marketplace-server.js
```

### Database issues?

```bash
# Delete and recreate database
del marketplace.db
node marketplace-server.js
# Database will be recreated with sample data
```

### No templates showing?

The server automatically seeds 6 sample templates on first run. If you don't see them:

```bash
# Delete database and restart
del marketplace.db
node marketplace-server.js
```

---

## 📊 Database Location

The SQLite database is stored at:
```
c:\ProgramData\Corel\Messages\540111125_707000\EN\MessageCache1\Messages\the real project\marketplace.db
```

You can view it with any SQLite browser (e.g., DB Browser for SQLite).

---

## 🎯 What's Next?

Now that the backend is running, you can:

1. **Test the API** - Use the examples above
2. **Create UI Components** - Build the frontend marketplace panel
3. **Upload Templates** - Add your own templates via the API
4. **Integrate with Editor** - Connect to your design editor

---

## 📚 More Information

- **Full Documentation:** See `MARKETPLACE_IMPLEMENTATION_SUMMARY.md`
- **API Reference:** See API Endpoints section in the summary
- **Component Guide:** See Remaining Components section

---

## 🎉 You're All Set!

**The marketplace backend is running! Start exploring templates! 🚀🎨**

**Happy Designing! 🎨**

