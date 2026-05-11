# FIRE Sentinel - Docker Migration Guide

## Overview

FIRE Sentinel has been migrated from Supabase to a self-contained Docker-based architecture. This guide explains the new setup and how to run the application.

## Architecture Changes

### Before (Supabase)
- **Frontend**: React + Vite
- **Backend**: Supabase Edge Functions (Deno)
- **Database**: Supabase PostgreSQL (cloud)
- **Auth**: Supabase Auth
- **Storage**: Supabase Storage

### After (Docker)
- **Frontend**: React + Vite (containerized)
- **Backend**: Express.js + Node.js (containerized)
- **Database**: PostgreSQL 15 (containerized)
- **Auth**: JWT-based authentication
- **Storage**: Local filesystem

## Prerequisites

- **Docker**: Version 20.10 or later
- **Docker Compose**: Version 2.0 or later
- **Mac/Linux/Windows**: Any OS that supports Docker

### Install Docker on Mac

```bash
# Using Homebrew
brew install --cask docker

# Or download from https://www.docker.com/products/docker-desktop/
```

After installation, start Docker Desktop from Applications.

## Quick Start

### 1. Clone Repository

```bash
git clone https://github.com/ai-tech-karthik/fire-sentinel.git
cd fire-sentinel
```

### 2. Configure Environment

Create `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env`:

```env
# JWT Secret (change this!)
JWT_SECRET=your-super-secret-jwt-key-change-this

# API Keys (optional, configure in app)
ALPHA_VANTAGE_API_KEY=
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
GOOGLE_API_KEY=
```

### 3. Start All Services

```bash
docker-compose up -d
```

This will start:
- PostgreSQL database on port 5432
- Backend API on port 3001
- Frontend on port 5173

### 4. Access the Application

Open your browser to: **http://localhost:5173**

**Default Login**:
- Email: `admin@fire-sentinel.local`
- Password: `admin123`

**⚠️ IMPORTANT**: Change the default password immediately after first login!

## Docker Commands

### Start Services

```bash
# Start all services
docker-compose up -d

# Start specific service
docker-compose up -d postgres
docker-compose up -d backend
docker-compose up -d frontend
```

### Stop Services

```bash
# Stop all services
docker-compose down

# Stop and remove volumes (deletes database data!)
docker-compose down -v
```

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f postgres
docker-compose logs -f frontend
```

### Restart Services

```bash
# Restart all
docker-compose restart

# Restart specific service
docker-compose restart backend
```

### Rebuild Services

```bash
# Rebuild all
docker-compose up -d --build

# Rebuild specific service
docker-compose up -d --build backend
```

## Service Details

### PostgreSQL Database

- **Container**: `fire-sentinel-db`
- **Port**: 5432
- **Database**: `fire_sentinel`
- **User**: `postgres`
- **Password**: `postgres`
- **Data Volume**: `postgres_data`

**Connect to Database**:

```bash
# Using Docker
docker exec -it fire-sentinel-db psql -U postgres -d fire_sentinel

# Using local psql client
psql -h localhost -p 5432 -U postgres -d fire_sentinel
```

### Backend API

- **Container**: `fire-sentinel-backend`
- **Port**: 3001
- **Health Check**: http://localhost:3001/health
- **API Base**: http://localhost:3001/api

**API Endpoints**:
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user
- `GET /api/accounts` - Get accounts
- `GET /api/stocks` - Get stocks
- `GET /api/alerts` - Get alerts
- `GET /api/news` - Get news
- `GET /api/settings` - Get settings
- `GET /api/price-alerts` - Get price alerts

### Frontend

- **Container**: `fire-sentinel-frontend`
- **Port**: 5173
- **URL**: http://localhost:5173

## Data Persistence

### Database Data

Database data is stored in a Docker volume named `postgres_data`. This persists even when containers are stopped.

**Backup Database**:

```bash
# Create backup
docker exec fire-sentinel-db pg_dump -U postgres fire_sentinel > backup.sql

# Restore backup
docker exec -i fire-sentinel-db psql -U postgres fire_sentinel < backup.sql
```

### Application Data

- **API Keys**: Stored in `settings` table
- **User Data**: Stored in PostgreSQL
- **No External Dependencies**: Everything runs locally

## Configuration

### Environment Variables

**Backend** (`.env` or `docker-compose.yml`):

```env
NODE_ENV=production
PORT=3001
DB_HOST=postgres
DB_PORT=5432
DB_NAME=fire_sentinel
DB_USER=postgres
DB_PASSWORD=postgres
JWT_SECRET=your-secret-key
FRONTEND_URL=http://localhost:5173
```

**Frontend** (`.env`):

```env
VITE_API_URL=http://localhost:3001/api
```

### API Keys

Configure API keys in the application:
1. Login to the application
2. Go to **Settings** page
3. Add your API keys:
   - Alpha Vantage (required for stock prices)
   - OpenAI / Anthropic / Google (optional for sentiment analysis)

## Scheduled Jobs

The backend runs scheduled jobs for:

### Price Monitoring

- **Frequency**: Every 5 minutes (configurable in Settings)
- **Function**: Checks stock prices and triggers alerts
- **Implementation**: `backend/src/jobs/priceMonitor.ts`

### News Monitoring

- **Frequency**: Every 10 minutes (configurable in Settings)
- **Function**: Scrapes news and analyzes sentiment
- **Implementation**: `backend/src/jobs/newsMonitor.ts`

### Configuration

Adjust frequencies in the Settings page of the application.

## Development Mode

### Run Frontend in Development

```bash
# Stop Docker frontend
docker-compose stop frontend

# Run locally
npm install
npm run dev
```

### Run Backend in Development

```bash
# Stop Docker backend
docker-compose stop backend

# Run locally
cd backend
npm install
npm run dev
```

### Database Only

```bash
# Run only database
docker-compose up -d postgres

# Connect from local backend
# Update backend/.env:
DB_HOST=localhost
```

## Troubleshooting

### Port Already in Use

**Error**: `Bind for 0.0.0.0:5173 failed: port is already allocated`

**Solution**:

```bash
# Find process using port
lsof -ti:5173

# Kill process
kill -9 $(lsof -ti:5173)

# Or change port in docker-compose.yml
ports:
  - "5174:5173"  # Use different external port
```

### Database Connection Failed

**Error**: `Connection refused` or `ECONNREFUSED`

**Solution**:

```bash
# Check if database is running
docker-compose ps

# Check database logs
docker-compose logs postgres

# Restart database
docker-compose restart postgres

# Wait for health check
docker-compose ps | grep healthy
```

### Backend Not Starting

**Error**: Backend container exits immediately

**Solution**:

```bash
# Check backend logs
docker-compose logs backend

# Common issues:
# 1. Database not ready - wait for health check
# 2. Build error - rebuild with --no-cache
docker-compose build --no-cache backend
docker-compose up -d backend
```

### Frontend Build Errors

**Error**: Build fails or shows blank page

**Solution**:

```bash
# Rebuild frontend
docker-compose build --no-cache frontend
docker-compose up -d frontend

# Check logs
docker-compose logs frontend

# Clear browser cache
# Open DevTools > Application > Clear Storage
```

### Cannot Login

**Issue**: Login fails with "Invalid credentials"

**Solution**:

```bash
# Reset admin password
docker exec -it fire-sentinel-db psql -U postgres -d fire_sentinel

# In psql:
UPDATE users SET password = '$2b$10$rKvVPZqGhXqN8YvGPxKGHOxLLKJ7qN5YvGPxKGHOxLLKJ7qN5YvGP' WHERE email = 'admin@fire-sentinel.local';

# Password is now: admin123
```

### Database Schema Issues

**Issue**: Tables missing or schema outdated

**Solution**:

```bash
# Recreate database
docker-compose down -v  # WARNING: Deletes all data!
docker-compose up -d

# Or manually run init script
docker exec -i fire-sentinel-db psql -U postgres -d fire_sentinel < database/init.sql
```

## Production Deployment

### Security Checklist

- [ ] Change default admin password
- [ ] Change JWT_SECRET to a strong random value
- [ ] Change database password
- [ ] Use environment-specific .env files
- [ ] Enable HTTPS (use reverse proxy like nginx)
- [ ] Set up regular database backups
- [ ] Limit database access to backend only
- [ ] Use Docker secrets for sensitive data

### Production docker-compose.yml

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: fire_sentinel
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - internal
    # Don't expose port externally
    restart: always

  backend:
    build: ./backend
    environment:
      NODE_ENV: production
      DB_HOST: postgres
      DB_PASSWORD: ${DB_PASSWORD}
      JWT_SECRET: ${JWT_SECRET}
    networks:
      - internal
      - external
    restart: always

  frontend:
    build:
      context: .
      target: production
    ports:
      - "80:80"
    networks:
      - external
    restart: always

volumes:
  postgres_data:

networks:
  internal:
    driver: bridge
  external:
    driver: bridge
```

### Backup Strategy

```bash
# Automated daily backup
0 2 * * * docker exec fire-sentinel-db pg_dump -U postgres fire_sentinel | gzip > /backups/fire-sentinel-$(date +\%Y\%m\%d).sql.gz

# Keep last 30 days
find /backups -name "fire-sentinel-*.sql.gz" -mtime +30 -delete
```

## Migration from Supabase

If you're migrating from the old Supabase version:

### 1. Export Data from Supabase

```bash
# Export from Supabase Dashboard
# Go to Database > Backups > Export
```

### 2. Import to Docker PostgreSQL

```bash
# Start Docker database
docker-compose up -d postgres

# Import data
docker exec -i fire-sentinel-db psql -U postgres -d fire_sentinel < supabase_export.sql
```

### 3. Update Frontend

The frontend has been updated to use the new API. No manual changes needed.

### 4. Configure API Keys

Re-enter your API keys in the Settings page.

## Monitoring

### Health Checks

```bash
# Backend health
curl http://localhost:3001/health

# Database health
docker exec fire-sentinel-db pg_isready -U postgres

# Check all services
docker-compose ps
```

### Resource Usage

```bash
# View resource usage
docker stats

# View specific container
docker stats fire-sentinel-backend
```

## Updating

### Update Application

```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
docker-compose down
docker-compose up -d --build
```

### Update Database Schema

```bash
# Apply new migrations
docker exec -i fire-sentinel-db psql -U postgres -d fire_sentinel < database/migrations/new_migration.sql
```

## Uninstalling

### Remove Everything

```bash
# Stop and remove containers
docker-compose down

# Remove volumes (deletes all data!)
docker-compose down -v

# Remove images
docker rmi fire-sentinel-backend fire-sentinel-frontend

# Remove project directory
cd ..
rm -rf fire-sentinel
```

## Support

### Logs

Always check logs first:

```bash
docker-compose logs -f
```

### Common Issues

1. **Port conflicts**: Change ports in docker-compose.yml
2. **Database connection**: Wait for health check to pass
3. **Build errors**: Rebuild with `--no-cache`
4. **Data loss**: Always backup before `docker-compose down -v`

### Getting Help

- Check logs: `docker-compose logs`
- Check status: `docker-compose ps`
- Restart services: `docker-compose restart`
- Rebuild: `docker-compose up -d --build`

## Advantages of Docker Setup

✅ **Self-Contained**: No external dependencies
✅ **Easy Setup**: One command to start everything
✅ **Consistent**: Same environment everywhere
✅ **Portable**: Run on any OS with Docker
✅ **Isolated**: Services don't interfere with system
✅ **Scalable**: Easy to add more services
✅ **Version Control**: Infrastructure as code
✅ **No Cloud Costs**: Everything runs locally

## Next Steps

1. ✅ Start Docker services
2. ✅ Login to application
3. ✅ Change default password
4. ✅ Configure API keys
5. ✅ Add your portfolio
6. ✅ Set up alerts
7. ✅ Monitor your investments!

---

**Repository**: https://github.com/ai-tech-karthik/fire-sentinel
**Version**: v8 (Docker Migration)
**Last Updated**: 2026-05-11
