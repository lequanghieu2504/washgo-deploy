# Backend Deployment Instructions

## Deploy Backend to Railway

1. **Navigate to backend directory:**
   ```bash
   cd Washgo
   ```

2. **Initialize Railway project:**
   ```bash
   railway login
   railway project new washgo-backend
   railway link
   ```

3. **Add PostgreSQL:**
   ```bash
   railway add postgresql
   ```

4. **Set environment variables:**
   ```bash
   railway variables set SPRING_PROFILES_ACTIVE=railway
   railway variables set DDL_AUTO=update
   railway variables set SHOW_SQL=false
   railway variables set LOG_LEVEL=INFO
   
   # Add your secrets
   railway variables set JWT_CURRENT_SECRET="your-jwt-secret"
   railway variables set GOOGLE_CLIENT_SECRET="your-google-secret"
   railway variables set STRIPE_SECRET_KEY="your-stripe-key"
   railway variables set SMTP_USERNAME="your-email"
   railway variables set SMTP_PASSWORD="your-password"
   ```

5. **Deploy:**
   ```bash
   railway up --dockerfile Dockerfile.railway
   ```

## Deploy Frontend to Railway

1. **Navigate to frontend directory:**
   ```bash
   cd ../washgo-Frontend
   ```

2. **Initialize Railway project:**
   ```bash
   railway project new washgo-frontend
   railway link
   ```

3. **Set environment variables:**
   ```bash
   railway variables set NODE_ENV=production
   ```

4. **Deploy:**
   ```bash
   railway up --dockerfile Dockerfile.railway
   ```