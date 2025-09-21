# Render Deployment Environment Variables

## Required Environment Variables

To fix the Bean creation exception for StripeConfig, you need to set these environment variables in your Render dashboard:

### Database
```
DATABASE_URL=postgresql://washgo:your_password@your_host.render.com:5432/your_database
```

### Stripe (Critical for fixing Bean creation exception)
```
STRIPE_SECRET_KEY=sk_test_your_actual_stripe_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret
```

### JWT
```
JWT_SECRET=your_jwt_secret_key
```

### Google OAuth
```
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=https://washgo-deploy.onrender.com/auth/google/callbackFromGoogle
```

### SMTP
```
SMTP_USERNAME=your_email@gmail.com
SMTP_PASSWORD=your_app_password
```

## How to Set in Render:
1. Go to Render Dashboard
2. Select your service
3. Go to "Environment" tab
4. Add each variable
5. Save changes

The application.properties file is already configured to use these environment variables with fallback values for local development.