#!/bin/bash

# WashGO Complete Railway Deployment Script
echo "🚀 WashGO Railway Deployment Script"
echo "===================================="

# Check prerequisites
echo "🔍 Checking prerequisites..."

# Check Railway CLI
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Installing..."
    npm install -g @railway/cli
fi

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js first."
    exit 1
fi

# Check Maven
if ! command -v mvn &> /dev/null; then
    echo "❌ Maven not found. Please install Maven first."
    exit 1
fi

echo "✅ Prerequisites check completed!"

# Login to Railway
echo "🔐 Logging into Railway..."
railway login

echo "📋 Deployment Options:"
echo "1. Deploy Backend only"
echo "2. Deploy Frontend only" 
echo "3. Deploy Both (Recommended)"
echo "4. Setup Database only"

read -p "Choose option (1-4): " choice

case $choice in
    1|3)
        echo "🔧 Setting up Backend..."
        cd Washgo
        
        echo "📦 Creating Railway project for backend..."
        railway project new washgo-backend
        railway link
        
        echo "🗄️ Adding PostgreSQL database..."
        railway add postgresql
        
        echo "⚙️ Setting environment variables..."
        railway variables set SPRING_PROFILES_ACTIVE=railway
        railway variables set DDL_AUTO=update
        railway variables set SHOW_SQL=false
        railway variables set LOG_LEVEL=INFO
        
        echo "🔑 Please set the following secrets in Railway dashboard:"
        echo "   - JWT_CURRENT_SECRET"
        echo "   - GOOGLE_CLIENT_SECRET"
        echo "   - STRIPE_SECRET_KEY"
        echo "   - STRIPE_WEBHOOK_SECRET"
        echo "   - SMTP_USERNAME"
        echo "   - SMTP_PASSWORD"
        
        read -p "Press Enter after setting up secrets..."
        
        echo "🚀 Deploying backend..."
        railway up --dockerfile Dockerfile.railway
        
        echo "🌐 Getting backend URL..."
        BACKEND_URL=$(railway domain)
        echo "Backend deployed at: $BACKEND_URL"
        
        cd ..
        ;;
esac

case $choice in
    2|3)
        echo "🔧 Setting up Frontend..."
        cd washgo-Frontend
        
        echo "📦 Installing dependencies..."
        npm install
        
        echo "📦 Creating Railway project for frontend..."
        railway project new washgo-frontend
        railway link
        
        echo "⚙️ Setting environment variables..."
        railway variables set NODE_ENV=production
        
        echo "🚀 Deploying frontend..."
        railway up --dockerfile Dockerfile.railway
        
        echo "🌐 Getting frontend URL..."
        FRONTEND_URL=$(railway domain)
        echo "Frontend deployed at: $FRONTEND_URL"
        
        cd ..
        ;;
esac

case $choice in
    4)
        echo "🗄️ Setting up Database only..."
        cd Washgo
        railway project new washgo-backend
        railway add postgresql
        echo "✅ Database setup completed!"
        cd ..
        ;;
esac

echo ""
echo "🎉 Deployment completed!"
echo "📚 Check RAILWAY_DEPLOYMENT_GUIDE.md for detailed instructions"
echo "🔧 Don't forget to:"
echo "   1. Update CORS settings in backend"
echo "   2. Configure frontend API URLs" 
echo "   3. Set up custom domains (optional)"
echo "   4. Test your application"