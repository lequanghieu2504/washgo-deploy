@echo off
REM Frontend deployment script for Railway (Windows)
echo 🚀 Deploying WashGO Frontend to Railway...

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

REM Navigate to frontend directory
cd washgo-Frontend

REM Add serve to dependencies if not present
echo 📦 Adding serve dependency...
npm install serve --save

REM Create a new Railway project for frontend
echo 📦 Creating Railway project for frontend...
railway project new washgo-frontend

REM Set up environment variables
echo ⚙️  Setting up environment variables...
railway variables set NODE_ENV=production

REM Deploy using Railway
echo 🚀 Deploying frontend...
railway up --dockerfile Dockerfile.railway

echo ✅ Frontend deployment initiated!
echo 📱 Check your Railway dashboard for deployment status.
echo 🔗 Make sure to update CORS settings in backend to allow your frontend domain.