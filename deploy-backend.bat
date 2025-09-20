@echo off
REM Backend deployment script for Railway (Windows)
echo 🚀 Deploying WashGO Backend to Railway...

REM Check if Railway CLI is installed
railway --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Railway CLI is not installed. Please install it first:
    echo    npm install -g @railway/cli
    exit /b 1
)

REM Login to Railway (if not already logged in)
echo 🔐 Checking Railway authentication...
railway login --check || railway login

REM Navigate to backend directory
cd Washgo

REM Create a new Railway project for backend
echo 📦 Creating Railway project for backend...
railway project new washgo-backend

REM Set up environment variables
echo ⚙️  Setting up environment variables...
railway variables set SPRING_PROFILES_ACTIVE=railway
railway variables set DDL_AUTO=update
railway variables set SHOW_SQL=false
railway variables set INCLUDE_EXCEPTION=false
railway variables set LOG_LEVEL=INFO
railway variables set HIBERNATE_LOG_LEVEL=WARN
railway variables set HIBERNATE_BINDER_LOG_LEVEL=WARN

REM Prompt for required secrets
echo 🔑 Please set up the following environment variables in Railway dashboard:
echo    - DATABASE_URL (PostgreSQL URL from Railway)
echo    - JWT_CURRENT_SECRET (your JWT secret)
echo    - GOOGLE_CLIENT_SECRET (for OAuth)
echo    - STRIPE_SECRET_KEY (for payments)
echo    - STRIPE_WEBHOOK_SECRET (for Stripe webhooks)
echo    - SMTP_USERNAME (for email)
echo    - SMTP_PASSWORD (for email)

REM Deploy using Railway
echo 🚀 Deploying backend...
railway up --dockerfile Dockerfile.railway

echo ✅ Backend deployment initiated!
echo 📱 Check your Railway dashboard for deployment status.