# Deployment Guide

## Step 1: Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `gesture-control-player` (or your preferred name)
3. Description: "Minority Report style gesture control interface using Next.js and MediaPipe"
4. Choose Public or Private
5. **DO NOT** initialize with README, .gitignore, or license (we already have these)
6. Click "Create repository"

## Step 2: Push to GitHub

After creating the repository, GitHub will show you commands. Use these:

```bash
git remote add origin https://github.com/YOUR_USERNAME/gesture-control-player.git
git branch -M main
git push -u origin main
```

Replace `YOUR_USERNAME` with your GitHub username.

## Step 3: Deploy to Vercel

### Option A: Using Vercel CLI (Recommended)

1. Login to Vercel:
```bash
vercel login
```

2. Deploy:
```bash
vercel
```

3. Follow the prompts:
   - Set up and deploy? **Yes**
   - Which scope? (Select your account)
   - Link to existing project? **No**
   - Project name? (Press Enter for default)
   - Directory? (Press Enter for `./`)
   - Override settings? **No**

4. For production deployment:
```bash
vercel --prod
```

### Option B: Using Vercel Dashboard

1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Vercel will auto-detect Next.js settings
4. Click "Deploy"

## Important Notes

- The app uses MediaPipe which requires COOP/COEP headers (already configured in `next.config.js`)
- Make sure your GitHub repository is connected to Vercel for automatic deployments
- The app will be available at `https://your-project.vercel.app`

## Environment Variables

No environment variables are needed for this deployment.

