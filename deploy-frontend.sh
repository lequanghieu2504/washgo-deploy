#!/bin/bash

# Frontend deployment script for Railway
echo "🚀 Deploying WashGO Frontend to Railway..."

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI is not installed. Please install it first:"
    echo "   npm install -g @railway/cli"
    exit 1
fi

# Login to Railway (if not already logged in)
echo "🔐 Checking Railway authentication..."
railway login --check || railway login

# Navigate to frontend directory
cd washgo-Frontend

# Add serve to dependencies if not present
echo "📦 Adding serve dependency..."
npm install serve --save

# Create a new Railway project for frontend
echo "📦 Creating Railway project for frontend..."
railway project new washgo-frontend

# Set up environment variables
echo "⚙️  Setting up environment variables..."
railway variables set NODE_ENV=production

# Deploy using Railway
echo "🚀 Deploying frontend..."
railway up --dockerfile Dockerfile.railway

echo "✅ Frontend deployment initiated!"
echo "📱 Check your Railway dashboard for deployment status."
echo "🔗 Make sure to update CORS settings in backend to allow your frontend domain."