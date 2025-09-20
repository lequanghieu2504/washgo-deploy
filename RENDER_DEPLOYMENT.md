# 🚀 Render Deployment Guide for WashGO Backend

## 📋 Prerequisites

- GitHub repository: `lequanghieu2504/washgo-backend`
- Render account: [render.com](https://render.com)

## 🔧 Configuration Files

✅ **Dockerfile** - Single-stage Docker build for Render
✅ **application-render.properties** - Production configuration
✅ **build.sh** - Build script (optional)
✅ **Updated application.properties** - Includes render profile

## 🚀 Deployment Steps

### Step 1: Create Render Account
1. Go to [render.com](https://render.com)
2. Sign up with GitHub account
3. Connect your GitHub repository

### Step 2: Create PostgreSQL Database
1. Click **"New +"** → **"PostgreSQL"**
2. **Name**: `washgo-database`
3. **Database Name**: `washgo`
4. **User**: `washgo`
5. **Plan**: Free
6. **Region**: Singapore
7. Click **"Create Database"**
8. **Save the DATABASE_URL** from the database info

### Step 3: Create Web Service
1. Click **"New +"** → **"Web Service"**
2. **Connect GitHub Repository**: `lequanghieu2504/washgo-deploy`
3. **Configuration**:
   ```
   Name: washgo-backend
   Environment: Docker
   Region: Singapore (or closest to you)
   Branch: main
   Root Directory: Washgo
   ```

### Step 4: Environment Variables
Add these environment variables in the service settings:

**Required Variables:**
```env
DATABASE_URL=postgresql://washgo:pIOwDU82zgr352i2UahZIXnlBx3cTWN3@dpg-d37e418gjchc73c7984g-a.singapore-postgres.render.com:5432/washgo_kkrs
JWT_SECRET=G3BRkHrdRXmhc4CY++yAdBe77o9F9whOX+gYMe8SYrU=
```

**⚠️ CRITICAL: Make sure to use the EXTERNAL Database URL from your PostgreSQL service, not the internal one!**

**Optional Variables (for full functionality):**
```env
GOOGLE_CLIENT_ID=your_google_oauth_client_id
GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
SMTP_USERNAME=your_email@gmail.com
SMTP_PASSWORD=your_gmail_app_password
CORS_ALLOWED_ORIGINS=https://your-frontend-domain.com,http://localhost:3000
FILE_STORAGE_ROOT=/tmp/uploads
```

### Step 5: Deploy
1. Click **"Create Web Service"**
2. Render will automatically:
   - Build your Docker image
   - Deploy the application
   - Assign a URL

### Step 6: Verify Deployment
Your backend will be available at:
```
https://washgo-backend-xxxx.onrender.com
```

Test endpoints:
- Health check: `GET /actuator/health`
- API base: `GET /api/`

## 🔍 Troubleshooting

### Build Fails
- Check build logs in Render dashboard
- Verify Dockerfile syntax
- Ensure Maven dependencies are correct

### Database Connection Issues
- Verify DATABASE_URL is correctly set
- Check PostgreSQL database is running
- Confirm connection string format

### Application Won't Start
- Check application logs
- Verify environment variables
- Ensure JWT_SECRET is set

### CORS Issues
- Set CORS_ALLOWED_ORIGINS correctly
- Include your frontend domain
- Test with browser dev tools

## 🌐 API Endpoints

After deployment, your API will be available at:
```
Base URL: https://washgo-backend-xxxx.onrender.com/api
```

Example endpoints:
- `GET /api/health` - Health check
- `POST /api/auth/login` - User login
- `GET /api/carwashes` - Get car washes
- `POST /api/bookings` - Create booking

## 💰 Pricing

**Free Tier Includes:**
- 750 hours/month compute time
- 1 GB RAM
- Automatic SSL
- Custom domains
- Basic monitoring

**Limitations:**
- Services sleep after 15 minutes of inactivity
- Cold start ~30 seconds wake-up time

## 🎯 Next Steps

1. **Deploy Frontend**: Create separate Render service for React app
2. **Custom Domain**: Add your domain in service settings
3. **Monitoring**: Set up log monitoring and alerts
4. **Scaling**: Upgrade to paid plan for production use

## 📞 Support

- Render Documentation: [render.com/docs](https://render.com/docs)
- Support: help@render.com
- Discord Community: Render Discord Server