# Database Setup Guide

This project now supports **Vercel Postgres** for production deployment!

## 🚀 Quick Setup (Vercel Postgres)

### 1. Create a Vercel Postgres Database

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click on **Storage** tab
3. Click **Create Database**
4. Select **Postgres**
5. Choose a name (e.g., `mirziyo-portfolio-db`)
6. Select a region close to your users
7. Click **Create**

### 2. Get Your Database Credentials

After creating the database:
1. Go to your database in Vercel Dashboard
2. Click on **.env.local** tab
3. Copy all the environment variables

### 3. Add Environment Variables to Netlify

1. Go to [Netlify Dashboard](https://app.netlify.com)
2. Select your site (`mirziyo-muhammadiyev`)
3. Go to **Site configuration** → **Environment variables**
4. Click **Add a variable**
5. Add each of these variables from Vercel:
   - `POSTGRES_URL`
   - `POSTGRES_PRISMA_URL`
   - `POSTGRES_URL_NON_POOLING`
   - `POSTGRES_USER`
   - `POSTGRES_HOST`
   - `POSTGRES_PASSWORD`
   - `POSTGRES_DATABASE`

### 4. Deploy

Once you've added the environment variables, redeploy your site:

```bash
netlify deploy --prod --build
```

## 📝 How It Works

- **With Postgres**: Data is persisted in the database (production)
- **Without Postgres**: Uses file-based storage (development only)

The app automatically detects if `POSTGRES_URL` is set and uses the appropriate database.

## 🔄 Database Initialization

The database tables are automatically created on first run. The schema includes:

- **essays** - Your essay posts
- **works** - Your academic works
- **blog_posts** - LinkedIn blog posts with reactions
- **quotes** - Quote collection
- **reactions** - User reactions to blog posts

## 🛠️ Local Development

For local development, you can either:

1. **Use file-based storage** (default, no setup needed)
2. **Connect to Vercel Postgres**:
   - Copy `env.example` to `.env.local`
   - Add your Vercel Postgres credentials
   - Restart your dev server

## ⚠️ Important Notes

- The file-based database (`data/database.json`) is only for development
- On Netlify without Postgres, data will reset on each deployment
- **Always use Postgres for production!**

## 🎯 Migration from File-Based Storage

If you have existing data in `data/database.json`, you'll need to manually migrate it to Postgres. The easiest way:

1. Set up Postgres as described above
2. Use the admin panel to recreate your content
3. Or write a migration script (contact developer if needed)

## 📚 Additional Resources

- [Vercel Postgres Docs](https://vercel.com/docs/storage/vercel-postgres)
- [Netlify Environment Variables](https://docs.netlify.com/environment-variables/overview/)
