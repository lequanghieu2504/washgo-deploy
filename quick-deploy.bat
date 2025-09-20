@echo off
REM WashGO Complete Railway Deployment Script
echo 🚀 WashGO Railway Deployment Script
echo ====================================

REM Check prerequisites
echo 🔍 Checking prerequisites...

REM Check Railway CLI
railway --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Railway CLI not found. Installing...
    npm install -g @railway/cli
)

REM Check Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js not found. Please install Node.js first.
    pause
    exit /b 1
)

REM Check Maven
mvn --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Maven not found. Please install Maven first.
    pause
    exit /b 1
)

echo ✅ Prerequisites check completed!

REM Login to Railway
echo 🔐 Logging into Railway...
railway login

echo 📋 Deployment Options:
echo 1. Deploy Backend only
echo 2. Deploy Frontend only
echo 3. Deploy Both (Recommended)
echo 4. Setup Database only

set /p choice="Choose option (1-4): "

if "%choice%"=="1" goto backend
if "%choice%"=="3" goto backend
if "%choice%"=="2" goto frontend
if "%choice%"=="4" goto database
goto end

:backend
echo 🔧 Setting up Backend...
cd Washgo

echo 📦 Creating Railway project for backend...
railway project new washgo-backend

echo 🗄️ Adding PostgreSQL database...
railway add postgresql

echo ⚙️ Setting environment variables...
railway variables set SPRING_PROFILES_ACTIVE=railway
railway variables set DDL_AUTO=update
railway variables set SHOW_SQL=false
railway variables set LOG_LEVEL=INFO

echo 🔑 Please set the following secrets in Railway dashboard:
echo    - JWT_CURRENT_SECRET
echo    - GOOGLE_CLIENT_SECRET  
echo    - STRIPE_SECRET_KEY
echo    - STRIPE_WEBHOOK_SECRET
echo    - SMTP_USERNAME
echo    - SMTP_PASSWORD

pause

echo 🚀 Deploying backend...
railway up --dockerfile Dockerfile.railway

echo 🌐 Getting backend URL...
railway domain

cd ..

if "%choice%"=="1" goto end

:frontend
echo 🔧 Setting up Frontend...
cd washgo-Frontend

echo 📦 Installing dependencies...
npm install

echo 📦 Creating Railway project for frontend...
railway project new washgo-frontend

echo ⚙️ Setting environment variables...
railway variables set NODE_ENV=production

echo 🚀 Deploying frontend...
railway up --dockerfile Dockerfile.railway

echo 🌐 Getting frontend URL...
railway domain

cd ..
goto end

:database
echo 🗄️ Setting up Database only...
cd Washgo
railway project new washgo-backend
railway add postgresql
echo ✅ Database setup completed!
cd ..

:end
echo.
echo 🎉 Deployment completed!
echo 📚 Check RAILWAY_DEPLOYMENT_GUIDE.md for detailed instructions
echo 🔧 Don't forget to:
echo    1. Update CORS settings in backend
echo    2. Configure frontend API URLs
echo    3. Set up custom domains (optional)
echo    4. Test your application
pause