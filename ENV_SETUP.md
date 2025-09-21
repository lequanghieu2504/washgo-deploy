## URGENT: Fix GoogleOAuthService Bean Creation Error

**The current error is because these environment variables are missing in Render:**

### Database
```
DATABASE_URL=postgresql://user:password@host:5432/database
```

### Google OAuth (Critical - these MUST be set)
```
GOOGLE_CLIENT_ID=your_actual_client_id
GOOGLE_CLIENT_SECRET=your_actual_client_secret  
GOOGLE_REDIRECT_URI=https://washgo-deploy.onrender.com/auth/google/callbackFromGoogle
GOOGLE_TOKEN_URI=https://oauth2.googleapis.com/token
GOOGLE_USERINFO_URI=https://www.googleapis.com/oauth2/v3/userinfo
GOOGLE_AUTHORIZATION_URI=https://accounts.google.com/o/oauth2/auth
GOOGLE_REFRESH_TOKEN=your_refresh_token
```

### Stripe
```
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret
```

### JWT
```
JWT_SECRET=your_jwt_secret
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