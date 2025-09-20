#!/bin/bash

# Backend deployment script for Railway
echo "🚀 Deploying WashGO Backend to Railway..."

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI is not installed. Please install it first:"
    echo "   npm install -g @railway/cli"
    exit 1
fi

# Login to Railway (if not already logged in)
echo "🔐 Checking Railway authentication..."
railway login --check || railway login

# Navigate to backend directory
cd Washgo

# Create a new Railway project for backend
echo "📦 Creating Railway project for backend..."
railway project new washgo-backend

# Set up environment variables
echo "⚙️  Setting up environment variables..."
railway variables set SPRING_PROFILES_ACTIVE=railway
railway variables set DDL_AUTO=update
railway variables set SHOW_SQL=false
railway variables set INCLUDE_EXCEPTION=false
railway variables set LOG_LEVEL=INFO
railway variables set HIBERNATE_LOG_LEVEL=WARN
railway variables set HIBERNATE_BINDER_LOG_LEVEL=WARN

# Prompt for required secrets
echo "🔑 Please set up the following environment variables in Railway dashboard:"
echo "   - DATABASE_URL (PostgreSQL URL from Railway)"
echo "   - JWT_CURRENT_SECRET (your JWT secret)"
echo "   - GOOGLE_CLIENT_SECRET (for OAuth)"
echo "   - STRIPE_SECRET_KEY (for payments)"
echo "   - STRIPE_WEBHOOK_SECRET (for Stripe webhooks)"
echo "   - SMTP_USERNAME (for email)"
echo "   - SMTP_PASSWORD (for email)"

# Deploy using Railway
echo "🚀 Deploying backend..."
railway up --dockerfile Dockerfile.railway

echo "✅ Backend deployment initiated!"
echo "📱 Check your Railway dashboard for deployment status."