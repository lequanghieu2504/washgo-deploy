# WashGO Railway Deployment - Files Created

This document lists all the files created to help you deploy your WashGO application to Railway.

## 📁 Created Files

### 1. Railway Configuration Files

- **`railway.json`** - Main Railway configuration (multi-service setup)
- **`Washgo/Dockerfile.railway`** - Backend Dockerfile optimized for Railway
- **`washgo-Frontend/Dockerfile.railway`** - Frontend Dockerfile optimized for Railway
- **`Washgo/src/main/resources/application-railway.properties`** - Backend config for Railway environment
- **`washgo-Frontend/vite.config.railway.js`** - Frontend Vite config for Railway

### 2. Deployment Scripts

#### Automated Scripts (Recommended)
- **`quick-deploy.sh`** - Complete deployment script (Linux/Mac)
- **`quick-deploy.bat`** - Complete deployment script (Windows)

#### Individual Service Scripts
- **`deploy-backend.sh`** - Backend-only deployment (Linux/Mac)
- **`deploy-backend.bat`** - Backend-only deployment (Windows)
- **`deploy-frontend.sh`** - Frontend-only deployment (Linux/Mac)  
- **`deploy-frontend.bat`** - Frontend-only deployment (Windows)

### 3. Documentation

- **`RAILWAY_DEPLOYMENT_GUIDE.md`** - Comprehensive step-by-step deployment guide

### 4. Modified Files

- **`washgo-Frontend/package.json`** - Added `serve` dependency for production serving

## 🚀 Quick Start

### Option 1: Automated Deployment (Easiest)

**Windows:**
```cmd
quick-deploy.bat
```

**Linux/Mac:**
```bash
chmod +x quick-deploy.sh
./quick-deploy.sh
```

### Option 2: Manual Step-by-Step

Follow the detailed guide in `RAILWAY_DEPLOYMENT_GUIDE.md`

### Option 3: Individual Services

Use the individual deployment scripts:
- `deploy-backend.sh/.bat` for backend only
- `deploy-frontend.sh/.bat` for frontend only

## 📋 Prerequisites

Before running any deployment script:

1. **Install Railway CLI:**
   ```bash
   npm install -g @railway/cli
   ```

2. **Login to Railway:**
   ```bash
   railway login
   ```

3. **Have your secrets ready:**
   - JWT secret
   - Google OAuth credentials
   - Stripe API keys
   - SMTP credentials

## 🎯 What Each Script Does

### Quick Deploy Scripts
- ✅ Install Railway CLI if missing
- ✅ Check prerequisites (Node.js, Maven)
- ✅ Create Railway projects
- ✅ Set up PostgreSQL database
- ✅ Configure environment variables
- ✅ Deploy services
- ✅ Provide deployment URLs

### Individual Scripts
- Focus on single service deployment
- Useful for updates or troubleshooting
- Less automated but more control

## 🔧 Post-Deployment Tasks

After successful deployment:

1. **Update CORS settings** in your Spring Boot backend
2. **Configure frontend API URLs** to point to Railway backend
3. **Set up custom domains** (optional)
4. **Test all functionality**
5. **Monitor logs** via Railway dashboard

## 💡 Tips

- Start with `quick-deploy` scripts for first deployment
- Use individual scripts for updates
- Keep secrets in Railway environment variables
- Check `railway logs` for troubleshooting
- Use `railway domain` to get service URLs

## 🆘 Troubleshooting

If deployment fails:

1. Check `railway logs` for error details
2. Verify all environment variables are set
3. Ensure Railway CLI is logged in
4. Check Railway dashboard for service status
5. Refer to `RAILWAY_DEPLOYMENT_GUIDE.md` for detailed solutions

Your WashGO application is now ready for Railway deployment! 🎉