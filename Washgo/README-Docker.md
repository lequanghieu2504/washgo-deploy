# WashGo Docker Setup

This document provides instructions for running the WashGo application using Docker.

## Prerequisites

- Docker Desktop or Docker Engine installed
- Docker Compose v3.8 or higher
- At least 4GB of available RAM
- Ports 3000, 8080, 5432, and 5050 available

## Project Structure

```
WashGo/
├── Dockerfile                 # Backend Docker configuration
├── docker-compose.yml        # Multi-service orchestration
├── src/                      # Spring Boot backend source
├── pom.xml                   # Maven dependencies
└── README-Docker.md          # This file

washgo-frontend/
├── Dockerfile                # Frontend Docker configuration
├── nginx.conf               # Nginx configuration
├── src/                     # React frontend source
└── package.json             # Node.js dependencies
```

## Services

The application consists of the following services:

1. **Frontend** (React + Nginx) - Port 3000
2. **Backend** (Spring Boot) - Port 8080
3. **Database** (PostgreSQL) - Port 5432
4. **pgAdmin** (Database Management) - Port 5050 (Optional)

## Quick Start

### 1. Build and Run All Services

```bash
# Navigate to the backend directory
cd WashGo

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f
```

### 2. Stop All Services

```bash
docker-compose down
```

### 3. Clean Up (Remove containers, networks, and volumes)

```bash
docker-compose down -v --remove-orphans
docker system prune -f
```

## Individual Service Management

### Backend Only
```bash
docker-compose up -d db backend
```

### Frontend Only (requires backend to be running)
```bash
docker-compose up -d frontend
```

### With pgAdmin (Database Management UI)
```bash
docker-compose --profile tools up -d
```

## Environment Configuration

### Database Configuration
- **Host**: localhost:5432 (from host machine) or db:5432 (from containers)
- **Database**: washgo
- **Username**: postgres
- **Password**: password

### Application URLs
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080
- **pgAdmin**: http://localhost:5050 (admin@washgo.com / admin)

## Development Mode

For development with hot reloading:

### Frontend Development
```bash
cd washgo-frontend
npm install
npm run dev
# Frontend will be available at http://localhost:5173
```

### Backend Development
```bash
cd WashGo
# Run only database
docker-compose up -d db

# Run Spring Boot locally
./mvnw spring-boot:run
# Backend will be available at http://localhost:8080
```

## Production Deployment

### Environment Variables

Create a `.env` file in the WashGo directory:

```env
# Database
POSTGRES_USER=your_db_user
POSTGRES_PASSWORD=your_secure_password
POSTGRES_DB=washgo

# JWT
JWT_CURRENT_SECRET=your_jwt_secret_key

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Stripe
STRIPE_SECRET_KEY=your_stripe_secret_key

# Email
SPRING_MAIL_USERNAME=your_email
SPRING_MAIL_PASSWORD=your_email_password
```

### Production Run
```bash
docker-compose -f docker-compose.yml up -d
```

## Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Check what's using the port
   netstat -tulpn | grep :8080
   
   # Change ports in docker-compose.yml if needed
   ```

2. **Database Connection Issues**
   ```bash
   # Check database health
   docker-compose exec db pg_isready -U postgres
   
   # View database logs
   docker-compose logs db
   ```

3. **Build Failures**
   ```bash
   # Clean build with no cache
   docker-compose build --no-cache
   
   # Remove old images
   docker image prune -f
   ```

4. **Memory Issues**
   ```bash
   # Check Docker resource usage
   docker stats
   
   # Increase Docker Desktop memory allocation
   ```

### Viewing Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f db
```

### Database Management

```bash
# Connect to PostgreSQL
docker-compose exec db psql -U postgres -d washgo

# Database backup
docker-compose exec db pg_dump -U postgres washgo > backup.sql

# Database restore
docker-compose exec -T db psql -U postgres -d washgo < backup.sql
```

## Health Checks

The services include health checks:

```bash
# Check service health
docker-compose ps

# Manual health check
curl http://localhost:8080/actuator/health
curl http://localhost:3000/health
```

## Performance Optimization

### For Production:
1. Use multi-stage builds (already implemented)
2. Non-root user execution (already implemented)
3. Resource limits in docker-compose.yml
4. Enable logging drivers
5. Use secrets for sensitive data

### Resource Limits Example:
```yaml
backend:
  deploy:
    resources:
      limits:
        cpus: '1.0'
        memory: 1G
      reservations:
        cpus: '0.5'
        memory: 512M
```

## Security Considerations

1. **Secrets Management**: Use Docker secrets or external secret management
2. **Network Security**: Services communicate through internal network
3. **User Privileges**: Containers run as non-root users
4. **Image Security**: Base images are regularly updated
5. **Data Persistence**: Database data is persisted in Docker volumes

## Support

For issues or questions:
1. Check the logs: `docker-compose logs -f`
2. Verify service health: `docker-compose ps`
3. Check resource usage: `docker stats`
4. Review configuration in `docker-compose.yml`