# WashGO Railway Deployment Guide

This guide will walk you through deploying your WashGO application (Spring Boot backend + React frontend) to Railway.

## 📋 Prerequisites

1. **Railway Account**: Sign up at [railway.app](https://railway.app)
2. **Railway CLI**: Install the Railway CLI
   ```bash
   npm install -g @railway/cli
   ```
3. **Git Repository**: Your code should be in a Git repository
4. **Environment Variables**: Have your secrets ready (database, JWT, OAuth, etc.)

## 🗂️ Project Structure

Your WashGO project consists of:
- **Backend**: Spring Boot application in `Washgo/` directory
- **Frontend**: React/Vite application in `washgo-Frontend/` directory
- **Database**: PostgreSQL (will be provided by Railway)

## 🚀 Deployment Steps

### Step 1: Install Railway CLI and Login

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login
```

### Step 2: Create Railway Projects

You'll need to create **two separate Railway projects** - one for backend and one for frontend.

#### 2.1 Create Backend Project

```bash
# Navigate to backend directory
cd Washgo

# Create new Railway project
railway project new washgo-backend

# Link to the project
railway link
```

#### 2.2 Create Frontend Project

```bash
# Navigate to frontend directory (from root)
cd ../washgo-Frontend

# Create new Railway project
railway project new washgo-frontend

# Link to the project
railway link
```

### Step 3: Set Up PostgreSQL Database

#### 3.1 Add PostgreSQL to Backend Project

```bash
# In the Washgo/ directory
railway add postgresql
```

This will:
- Create a PostgreSQL database
- Generate a `DATABASE_URL` environment variable
- Automatically connect it to your backend service

### Step 4: Configure Environment Variables

#### 4.1 Backend Environment Variables

```bash
# In the Washgo/ directory
railway variables set SPRING_PROFILES_ACTIVE=railway
railway variables set DDL_AUTO=update
railway variables set SHOW_SQL=false
railway variables set LOG_LEVEL=INFO

# Required secrets (replace with your actual values)
railway variables set JWT_CURRENT_SECRET="your-jwt-secret-here"
railway variables set GOOGLE_CLIENT_SECRET="your-google-oauth-secret"
railway variables set STRIPE_SECRET_KEY="your-stripe-secret-key"
railway variables set STRIPE_WEBHOOK_SECRET="your-stripe-webhook-secret"
railway variables set SMTP_USERNAME="your-email@gmail.com"
railway variables set SMTP_PASSWORD="your-app-password"
```

#### 4.2 Frontend Environment Variables

```bash
# In the washgo-Frontend/ directory
railway variables set NODE_ENV=production
```

### Step 5: Prepare Frontend for Deployment

#### 5.1 Add serve dependency

```bash
# In washgo-Frontend/ directory
npm install serve --save
```

#### 5.2 Update package.json scripts (if needed)

Ensure your `package.json` has the build script:
```json
{
  "scripts": {
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

### Step 6: Deploy Services

#### 6.1 Deploy Backend

```bash
# In Washgo/ directory
railway up --dockerfile Dockerfile.railway
```

Wait for deployment to complete. Railway will:
- Build your Spring Boot application
- Create a public URL
- Connect to PostgreSQL database

#### 6.2 Deploy Frontend

```bash
# In washgo-Frontend/ directory
railway up --dockerfile Dockerfile.railway
```

### Step 7: Configure URLs and CORS

#### 7.1 Update Backend URLs

After backend deployment, get your backend URL:
```bash
# In Washgo/ directory
railway domain
```

Update these environment variables with your actual backend URL:
```bash
railway variables set GOOGLE_REDIRECT_URI="https://your-backend-url.railway.app/auth/google/callbackFromGoogle"
railway variables set JWK_SET_URI="https://your-backend-url.railway.app/.well-known/jwks.json"
```

#### 7.2 Update Frontend API URLs

Get your frontend URL:
```bash
# In washgo-Frontend/ directory
railway domain
```

You'll need to update your frontend code to point to the backend Railway URL instead of localhost.

### Step 8: Configure CORS

Update your Spring Boot backend to allow your frontend domain in CORS configuration.

## 🔧 Alternative: Using Deployment Scripts

I've created automated scripts for you. You can use them instead of manual steps:

### Windows Users:
```cmd
# Deploy backend
deploy-backend.bat

# Deploy frontend  
deploy-frontend.bat
```

### Linux/Mac Users:
```bash
# Make scripts executable
chmod +x deploy-backend.sh deploy-frontend.sh

# Deploy backend
./deploy-backend.sh

# Deploy frontend
./deploy-frontend.sh
```

## 🔍 Monitoring and Troubleshooting

### Check Deployment Status
```bash
# View logs
railway logs

# Check service status
railway status

# Open in browser
railway open
```

### Common Issues and Solutions

1. **Build Failures**:
   - Check logs: `railway logs`
   - Verify Dockerfile syntax
   - Ensure all dependencies are in package.json/pom.xml

2. **Database Connection Issues**:
   - Verify `DATABASE_URL` is set
   - Check if PostgreSQL service is running
   - Ensure application-railway.properties is used

3. **Environment Variable Issues**:
   - List variables: `railway variables`
   - Set missing variables: `railway variables set KEY=value`

4. **CORS Issues**:
   - Update backend CORS configuration
   - Ensure frontend and backend URLs are correctly configured

## 📱 Final Steps

1. **Test your application**: Visit both frontend and backend URLs
2. **Set up custom domains** (optional): Configure custom domains in Railway dashboard
3. **Monitor performance**: Use Railway's monitoring dashboard
4. **Set up alerts**: Configure notifications for your services

## 🔐 Security Checklist

- ✅ All secrets are in environment variables (not hardcoded)
- ✅ Database URL uses Railway's PostgreSQL
- ✅ HTTPS is enabled (automatic with Railway)
- ✅ CORS is properly configured
- ✅ JWT secrets are secure and unique

## 💡 Tips

1. **Environment Variables**: Never commit secrets to Git. Always use Railway's environment variables.
2. **Database**: Railway provides automatic backups for PostgreSQL.
3. **Scaling**: Railway auto-scales based on traffic.
4. **Monitoring**: Use Railway's built-in monitoring and logging.
5. **Updates**: Push to your Git repository to trigger automatic redeployments.

## 🆘 Support

If you encounter issues:
1. Check Railway documentation: [docs.railway.app](https://docs.railway.app)
2. Review deployment logs: `railway logs`
3. Check Railway status page: [status.railway.app](https://status.railway.app)

Your WashGO application should now be successfully deployed to Railway! 🎉