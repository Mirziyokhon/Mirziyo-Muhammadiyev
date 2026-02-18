# Automatic Media Deletion Feature

## Overview
When you delete essays, blog posts, or works that contain media files (images/videos), the system now automatically deletes the associated media files from the `/public/uploads/` folder.

## What's Changed

### 1. Database Layer (`lib/db.ts`)
- Added `deleteMediaFiles()` helper method that:
  - Extracts media file paths from image URLs and content
  - Supports multiple formats:
    - Direct image URLs (e.g., `image: "/uploads/photo.jpg"`)
    - Markdown images (e.g., `![alt](/uploads/photo.jpg)`)
    - HTML img tags (e.g., `<img src="/uploads/photo.jpg">`)
    - HTML video tags (e.g., `<video src="/uploads/video.mp4">`)
    - Video source tags (e.g., `<source src="/uploads/video.mp4">`)
  - Deletes each file from the filesystem
  - Logs successful deletions and errors

- Updated delete methods to be async:
  - `deleteEssay()` - now deletes media from essay content
  - `deleteBlogPost()` - now deletes media from post image and content
  - `deleteWork()` - now deletes media from work image and content

### 2. API Routes
Updated all DELETE endpoints to handle async operations:
- `/app/api/admin/essays/route.ts`
- `/app/api/admin/blog/route.ts`
- `/app/api/admin/works/route.ts`

## How It Works

1. When you delete an essay/post/work, the system:
   - Retrieves the item from the database
   - Scans the `image` field and `content` for media URLs
   - Extracts all `/uploads/` file paths
   - Deletes each file from the filesystem
   - Removes the item from the database
   - Saves the updated database

2. Console logs show:
   - `🗑️  Deleted media file: filename.jpg` - successful deletion
   - `❌ Error deleting file filename.jpg: [error]` - if deletion fails

## Benefits

- **No orphaned files**: Media files are automatically cleaned up
- **Saves disk space**: Unused files don't accumulate over time
- **Cleaner uploads folder**: Only active media remains
- **Safe operation**: Only deletes files from `/uploads/` folder

## Important Notes

- Files are only deleted if they exist in `/public/uploads/`
- If a file is referenced by multiple posts, it will be deleted when the first post is deleted
- Errors during file deletion don't prevent the post/work from being deleted
- All deletions are logged to the console for debugging
