# 📸 Laptop Images Setup Guide

## Overview

This guide walks you through setting up laptop product images with multiple angles (front, side, back, top open) and integrating them into your NextGen Tech Store platform.

## Workflow Steps

### Step 1: Open the Image URL Extractor

1. Start your dev server: `npm run dev`
2. Open your browser and navigate to: `http://localhost:3000/image-extractor.html`
3. This interactive tool helps you collect image URLs from Google Images

### Step 2: Manually Extract Image URLs

For each laptop model in the list:

1. **Click on the laptop name** to expand its section
2. For each angle (Front, Side, Back, Top Open):
   - Open the corresponding **Google Images search URL** from your `laptops-image-link.json` file
   - Find a **high-quality product photo** that meets these criteria:
     - **≥1000px wide** in resolution
     - **JPG or PNG format**
     - Product on **white or neutral background**
     - Skip lifestyle shots and thumbnails
   - **Right-click** on the image and select **"Open image in new tab"**
   - **Copy the image URL** from the browser address bar
   - **Paste it** into the corresponding field in the extractor tool

3. **Tips for selecting good images:**
   - Look for official manufacturer product shots
   - Amazon product images often work well
   - Avoid heavily edited or lifestyle photos
   - Aim for consistency in lighting and background

### Step 3: Export the Image URLs

1. After filling in URLs for all laptops and angles, click **"📥 Export JSON"**
2. This downloads a file named `laptop-direct-image-urls.json`
3. **Place this file in your project root** (same directory as `package.json`)

**File Location:** `c:\Users\dell\Desktop\Graduation-project\laptop-direct-image-urls.json`

### Step 4: Download Images to Your Server

Once you have the URLs file in place:

```bash
npm run download-images
```

This script will:
- Read each image URL from your JSON file
- Download the image with validation:
  - Check file size (must be >50KB, not a thumbnail)
  - Verify format (JPG/PNG/WebP)
  - Handle redirects automatically
- Save images to: `public/images/laptops/<brand-slug>-<model-slug>/`
  - Example: `public/images/laptops/alienware-m16-r2/`
  - Files named: `front.jpg`, `side.jpg`, `back.jpg`, `top.jpg`
- Generate a mapping file: `laptop-images-downloaded.json`
- Log any failures to: `image-download-failures.json`

### Step 5: Sync Images to Database

After images are downloaded, update your product database:

```bash
npm run sync-images
```

This script will:
- Match each laptop to its product in the database
- Update the product's `images` field with the file paths
- Set the main `image` field to the front view
- Log any matching failures

### Step 6: Verify Images Display

1. Open your browser to the store homepage
2. Click on any laptop product card
3. You should see:
   - **For products with all 4 angles:** Premium gallery with lightbox
     - Click the front image to open gallery
     - Navigate through angles with buttons
     - Click thumbnails to jump to specific angle
   - **For products with fewer images:** Standard gallery view

## File Structure After Setup

```
public/images/laptops/
├── alienware-m16-r2/
│   ├── front.jpg
│   ├── side.jpg
│   ├── back.jpg
│   └── top.jpg
├── asus-rog-zephyrus-g16/
│   ├── front.jpg
│   ├── side.jpg
│   ├── back.jpg
│   └── top.jpg
└── ... (more laptops)
```

## Database Schema

The product database has been updated to include:

```typescript
{
  // ... existing fields ...
  images: [
    "/images/laptops/brand-model/front.jpg",  // Front view (main)
    "/images/laptops/brand-model/side.jpg",   // Side view
    "/images/laptops/brand-model/back.jpg",   // Back view
    "/images/laptops/brand-model/top.jpg"     // Top open view
  ],
  image: "/images/laptops/brand-model/front.jpg"  // Main image
}
```

## Features Implemented

✅ **Image Gallery Component** (`src/components/LaptopGallery.tsx`)
- Shows front image as clickable thumbnail
- Lightbox modal with all 4 angles
- Navigation with Previous/Next buttons
- Thumbnail selector for quick angle switching
- `loading="lazy"` for performance
- Descriptive alt text for accessibility

✅ **Image Download Script** (`scripts/downloadLaptopImages.ts`)
- Downloads from direct image URLs
- Validates image quality and format
- Handles HTTP redirects
- Rate-limited requests (500ms between downloads)
- Error logging for manual replacement

✅ **Database Sync Script** (`scripts/syncImagesToDatabase.ts`)
- Maps laptop names to database products
- Updates product records with image paths
- Fuzzy matching for product identification
- Error reporting for investigation

✅ **Manual URL Extractor** (`public/image-extractor.html`)
- User-friendly interface for collecting URLs
- All 22 laptop models pre-configured
- Validates URL format
- Generates properly formatted JSON
- One-click JSON download

## Handling Failed Downloads

If some images fail to download:

1. Check `image-download-failures.json` for details
2. The file lists laptop name and angle that failed
3. You have two options:
   - Find a better image URL manually and re-run the download
   - Skip that image (placeholder will display on product page)

Example failure log:
```json
[
  {
    "laptop": "Alienware m16 R2",
    "angle": "side",
    "success": false,
    "error": "Failed to download or validate image"
  }
]
```

## Troubleshooting

### Images not showing on product pages?

1. **Verify files exist:**
   ```bash
   ls public/images/laptops/
   ```

2. **Check database records:**
   - Admin panel → Manage Products
   - Look for products with images populated

3. **Check browser console:**
   - Right-click → Inspect → Console tab
   - Look for 404 errors or image load failures

### Product names not matching?

The sync script uses fuzzy matching. If a product doesn't match:

1. Check exact product names in your database
2. Update `laptop-direct-image-urls.json` keys to match exactly
3. Re-run `npm run sync-images`

### Images are too small/wrong format?

1. Use the extractor tool again
2. Select larger, clearer images from Google Images
3. Re-run `npm run download-images`
4. Re-run `npm run sync-images`

## Admin Panel Integration

In the admin product management panel (`/admin/manage`):

- Image URL fields now support up to 4 images per product
- When creating a new product:
  1. Fill in product details
  2. Paste the 4 image URLs in the image fields
  3. Save the product
  4. Images will be organized in order: front, side, back, top

## Performance Optimization

- **Lazy loading:** All images use `loading="lazy"`
- **Proper alt text:** Improves SEO and accessibility
- **4:3 aspect ratio:** Consistent across gallery
- **Image format:** JPG/PNG/WebP for web compatibility
- **File organization:** Logical directory structure for easy maintenance

## Next Steps

After setup is complete:

1. ✅ Images are downloaded and saved to disk
2. ✅ Database is updated with image paths
3. ✅ Product pages display gallery views
4. ✅ Gallery component supports lightbox navigation
5. Test on different devices to verify responsive layout
6. Monitor image load times and optimize if needed

## API References

### Image Gallery Component

```typescript
import LaptopGallery from '@/components/LaptopGallery';

<LaptopGallery
  images={{
    front: '/images/laptops/brand-model/front.jpg',
    side: '/images/laptops/brand-model/side.jpg',
    back: '/images/laptops/brand-model/back.jpg',
    top: '/images/laptops/brand-model/top.jpg'
  }}
  productName="Dell XPS 13 Plus"
  brandModel="Dell XPS 13 Plus"
/>
```

## Command Reference

```bash
# Extract URLs and create mapping file (manual UI tool)
# Visit: http://localhost:3000/image-extractor.html

# Download all images
npm run download-images

# Sync images to database
npm run sync-images

# Clear all product images (reset)
npm run clear-images
```

## File Checklist

- [ ] `laptops-image-link.json` - Google Images search URLs (provided)
- [ ] `laptop-direct-image-urls.json` - Direct image URLs (generated by you)
- [ ] `laptop-images-downloaded.json` - Download confirmation (auto-generated)
- [ ] `image-download-failures.json` - Failed downloads list (if any)
- [ ] `public/images/laptops/*/` - Downloaded image files (auto-created)

---

**Last Updated:** May 12, 2026  
**For Questions:** Check the troubleshooting section or review script output logs
