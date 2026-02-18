# 🚀 Deploy JobHunt AI - Step by Step

## What We're Building

Your job search dashboard will have:
- ✅ **Frontend** (Vercel) - The website people see
- ✅ **Backend API** (Render) - Handles user accounts & data
- ✅ **Database** (SQLite) - Stores profiles, saved jobs, etc.

---

## 📋 BEFORE YOU START

Make sure these files are in your GitHub repo:
- ✅ `render.yaml` (in root folder)
- ✅ `vercel.json` (in root folder)
- ✅ `src/hooks/useAuth.ts` (updated with API_URL)

---

## STEP 1: Deploy Backend to Render (5 minutes)

### 1.1 Go to Render.com
1. Open https://render.com
2. Click **"Get Started for Free"**
3. Sign up with your **GitHub account**

### 1.2 Create Web Service
1. Click **"New +"** (blue button top right)
2. Select **"Web Service"**
3. Find your repo `Jobhuntai` and click **"Connect"**

### 1.3 Configure Settings
Fill in these exact values:

| Setting | Value |
|---------|-------|
| **Name** | `jobhunt-api` |
| **Root Directory** | `server` |
| **Runtime** | `Python 3` |
| **Build Command** | `pip install -r requirements.txt` |
| **Start Command** | `uvicorn api:app --host 0.0.0.0 --port 10000` |
| **Plan** | `Free` |

### 1.4 Deploy
1. Click **"Create Web Service"**
2. Wait 2-3 minutes for build to complete
3. You'll see a green "Live" badge when ready

### 1.5 Copy Your API URL
Your URL will look like:
```
https://jobhunt-api-abc123.onrender.com
```

**Write this down!** You'll need it in Step 3.

---

## STEP 2: Update Frontend Code (2 minutes)

### 2.1 Edit Environment Variable
1. Go to your GitHub repo: https://github.com/jondik14/Jobhuntai
2. Click on `src` → `hooks` → `useAuth.tsx`
3. Click the **pencil icon** (Edit)
4. Find this line near the top:
```typescript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
```

5. Replace it with your Render URL:
```typescript
const API_URL = 'https://YOUR-RENDER-URL.onrender.com/api';
```

**Example:**
```typescript
const API_URL = 'https://jobhunt-api-abc123.onrender.com/api';
```

6. Scroll down, click **"Commit changes..."**
7. Click **"Commit directly to main branch"**
8. Click **"Commit changes"**

✅ Your code is now updated!

---

## STEP 3: Deploy Frontend to Vercel (3 minutes)

### 3.1 Go to Vercel.com
1. Open https://vercel.com
2. Sign up with your **GitHub account**
3. Click **"Add New..."** → **"Project"**

### 3.2 Import Your Repo
1. Find `Jobhuntai` in the list
2. Click **"Import"**

### 3.3 Configure Project
Vercel auto-detects most settings. Just verify:

| Setting | Value |
|---------|-------|
| **Framework Preset** | `Vite` |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |

### 3.4 Add Environment Variable
1. Click **"Environment Variables"** to expand
2. Add new variable:
   - **Name**: `VITE_API_URL`
   - **Value**: Your Render URL + `/api`
   
   Example: `https://jobhunt-api-abc123.onrender.com/api`

3. Click **"Add"**

### 3.5 Deploy
1. Click **"Deploy"**
2. Wait 1-2 minutes
3. 🎉 Done! You'll see "Congratulations!"

---

## 🌐 Your Live Website

Vercel gives you a URL like:
```
https://jobhuntai-xyz.vercel.app
```

**This is your website!** Share this link with your friend.

---

## 🎁 For Your Friend

Send her:
1. The Vercel URL
2. Tell her to click **"Sign Up"**
3. She creates her own account
4. Uploads her resume
5. Gets personalized job matches!

Her data is completely separate from yours.

---

## 🔧 Troubleshooting

### "Build Failed" on Vercel
**Problem:** Can't find dependencies  
**Fix:**
1. Go to your GitHub repo
2. Make sure `package.json` is in the ROOT folder (not in a subfolder)
3. Check that `node_modules` is NOT uploaded to GitHub
4. Redeploy

### "CORS Error" in browser console
**Problem:** Frontend can't talk to backend  
**Fix:**
1. Go to Render dashboard
2. Click your service → "Environment"
3. Add variable:
   - **Key**: `ALLOWED_ORIGINS`
   - **Value**: Your Vercel URL
   
   Example: `https://jobhuntai-xyz.vercel.app`
4. Click "Save Changes"
5. Wait for redeploy

### "Database locked" error
**Problem:** SQLite doesn't work well with multiple users  
**Fix:** This is expected on free tier. For production, upgrade to paid Render plan ($7/month) or switch to PostgreSQL.

### Login not working
**Problem:** API URL wrong  
**Fix:** Double-check Step 2 - make sure URL has `https://` and ends with `/api`

---

## 💰 Costs

| Service | Free Tier | Paid |
|---------|-----------|------|
| **Vercel** (Frontend) | ✅ Unlimited | - |
| **Render** (Backend) | ✅ 750 hrs/month | $7/month |
| **Total** | **$0** | $7/month |

Free tier is enough for personal use!

---

## 📝 Quick Checklist

- [ ] Uploaded all files to GitHub
- [ ] Deployed backend to Render
- [ ] Copied Render URL
- [ ] Updated `useAuth.ts` with Render URL
- [ ] Committed changes to GitHub
- [ ] Deployed frontend to Vercel
- [ ] Added `VITE_API_URL` environment variable
- [ ] Tested signup/login
- [ ] Shared link with friend!

---

## 🆘 Need Help?

**Stuck on a step?** 
1. Take a screenshot
2. Tell me which step you're on
3. I'll help you fix it!

**Want me to review your setup?**
Send me:
- Your Render URL
- Your Vercel URL
- Any error messages
