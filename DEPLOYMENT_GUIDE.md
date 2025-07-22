# RPGVault Deployment Guide

## Complete Setup Instructions for Railway Hosting

### Prerequisites
- GitHub account (to connect your code)
- Railway account (free to start)
- Your domain (therpgvault.com)

### Step 1: Get Your Code on GitHub

1. **Create a GitHub repository:**
   - Go to github.com and create a new repository
   - Name it "rpgvault" or similar
   - Don't initialize with README (you'll upload your existing code)

2. **Upload your code:**
   - Download all your project files from Replit
   - Upload them to your new GitHub repository
   - Make sure all files are included (package.json, server/, client/, shared/, etc.)

### Step 2: Deploy to Railway

1. **Sign up for Railway:**
   - Go to railway.app
   - Sign up with your GitHub account
   - This automatically connects Railway to your GitHub

2. **Create a new project:**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your rpgvault repository
   - Railway will automatically detect it's a Node.js app

3. **Add PostgreSQL database:**
   - In your Railway project dashboard
   - Click "New Service"
   - Select "Database" → "PostgreSQL"
   - Railway will create and configure the database automatically

### Step 3: Configure Environment Variables

In your Railway project dashboard, go to "Variables" tab and add:

```
NODE_ENV=production
SESSION_SECRET=your-super-secure-random-string-here
SENDGRID_API_KEY=your-sendgrid-key-if-you-want-email
```

**Important:** Railway automatically provides `DATABASE_URL` - you don't need to set this manually.

### Step 4: Deploy Your Database Schema

After deployment:
1. Railway will give you a database connection URL
2. Your app will automatically run database migrations on first startup
3. You may need to run the seeding scripts to populate initial data

### Step 5: Connect Your Domain

1. **In Railway dashboard:**
   - Go to your project settings
   - Click "Domains" tab
   - Click "Add Domain"
   - Enter: therpgvault.com

2. **In your domain provider (where you bought therpgvault.com):**
   - Add a CNAME record pointing to the Railway URL they provide
   - Or add A records if they prefer IP addresses

### Step 6: SSL Certificate

Railway automatically provides SSL certificates for custom domains. Your site will be accessible via https://therpgvault.com within a few minutes of DNS propagation.

## Expected Costs

- **Railway**: $5/month for hobby plan (includes database)
- **Domain**: $10-15/year (you already have this)
- **Total**: About $5/month ongoing

## What Happens After Deployment

✅ Your full website will be live at https://therpgvault.com
✅ All 166 RPG adventures will be available
✅ User registration and login will work
✅ Forum system will be functional
✅ Admin features will be accessible
✅ Reviews and rankings will work
✅ Email features will work (if you add SendGrid key)

## Troubleshooting

If you encounter issues:
1. Check Railway logs in the dashboard
2. Ensure all environment variables are set
3. Verify DNS propagation (can take 24-48 hours)
4. Database migrations run automatically on first deploy

## Alternative Hosting Options

If Railway doesn't work for you:
- **Render**: Similar to Railway, good PostgreSQL support
- **Vercel**: Excellent for frontend, requires separate database
- **DigitalOcean App Platform**: Full-stack friendly
- **Heroku**: Classic choice, higher cost

Would you like me to help you with any specific part of this process?