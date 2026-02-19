# Render Deployment Guide for Infinity MD Session Generator

## 🚀 Quick Deploy to Render

### Step 1: Prepare Your Repository
1. Push your code to GitHub
2. Make sure all files are committed

### Step 2: Create Render Account
1. Go to [render.com](https://render.com)
2. Sign up/Sign in with GitHub

### Step 3: Create New Web Service
1. Click "New" → "Web Service"
2. Connect your GitHub repository
3. Configure the service:

**Basic Settings:**
- **Name:** `infinity-md-session`
- **Environment:** `Node`
- **Build Command:** `npm install`
- **Start Command:** `npm start`

**Environment Variables:**
```
PORT=8000
NODE_ENV=production
```

**Advanced Settings:**
- **Region:** `Singapore` (or closest to your users)
- **Instance Type:** `Free` (for testing) or `Starter` (for production)

### Step 4: Deploy
1. Click "Create Web Service"
2. Wait for deployment to complete (usually 2-5 minutes)
3. Your app will be available at: `https://infinity-md-session.onrender.com`

### Step 5: Update Your Bot
Add the Render URL to your bot's environment variables:
```bash
SESSION_API_URL=https://infinity-md-session.onrender.com
```

## 🔧 Alternative Deployment Options

### Heroku
```bash
# Create heroku app
heroku create infinity-md-session

# Set environment variables
heroku config:set PORT=8000
heroku config:set NODE_ENV=production

# Deploy
git push heroku main
```

### Railway
1. Connect GitHub repo
2. Set environment variables
3. Deploy automatically

### Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

## 📋 Environment Variables Reference

| Variable | Value | Description |
|----------|-------|-------------|
| `PORT` | `8000` | Server port |
| `NODE_ENV` | `production` | Environment mode |
| `PAIR_URL` | `https://your-app-url` | Public URL for bot messages |

## 🔍 Testing Your Deployment

```bash
# Test the web interface
curl https://your-app-url.onrender.com

# Test pair code generation
curl "https://your-app-url.onrender.com/pair?number=1234567890"

# Test QR code generation
curl https://your-app-url.onrender.com/qr
```

## ⚠️ Important Notes

- **Free tier limitations:** Render free tier sleeps after 15 minutes of inactivity
- **Custom domain:** You can add a custom domain in Render settings
- **SSL:** Render provides free SSL certificates
- **Logs:** Check Render logs for debugging
- **Scaling:** Upgrade to paid plans for better performance

## 🆘 Troubleshooting

**App not starting:**
- Check build logs in Render dashboard
- Verify all dependencies are in package.json
- Check environment variables

**Pair code not working:**
- Verify Mega.nz credentials in mega.js
- Check phone number format
- Review server logs

**Bot integration issues:**
- Ensure SESSION_API_URL is set correctly
- Check axios timeout settings
- Verify API endpoints are accessible