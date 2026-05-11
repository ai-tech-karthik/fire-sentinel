# FIRE Sentinel - Mac Installation Guide

## Overview

This guide will walk you through installing and running FIRE Sentinel on your Mac computer. The application is a self-contained portfolio monitoring tool built with React, TypeScript, Express.js, and PostgreSQL, all running in Docker containers.

**New in v8.0**: The application has been migrated from Supabase to a Docker-based architecture for complete independence and local control.

## Prerequisites

Before you begin, ensure your Mac meets these requirements:
- **macOS**: 10.15 (Catalina) or later
- **RAM**: 8GB minimum, 16GB recommended
- **Disk Space**: 2GB free space
- **Internet Connection**: Required for API access and real-time data

## Installation Options

Choose one of the following installation methods:

### Option 1: Docker (Recommended - Easiest)
- ✅ Fastest setup (5 minutes)
- ✅ No manual configuration needed
- ✅ All services managed automatically
- ✅ Production-ready setup

### Option 2: Local Development
- ✅ Best for development and customization
- ✅ Direct access to code
- ✅ Hot reload for changes
- ⚠️ Requires more setup steps

---

## Option 1: Docker Installation (Recommended)

### Step 1: Install Docker Desktop

1. Download Docker Desktop for Mac from [docker.com](https://www.docker.com/products/docker-desktop/)
2. Open the downloaded `.dmg` file
3. Drag Docker to Applications folder
4. Launch Docker Desktop from Applications
5. Wait for Docker to start (whale icon in menu bar)

Verify installation:
```bash
docker --version
docker-compose --version
```

### Step 2: Install Git

Check if Git is installed:
```bash
git --version
```

If not installed, install via Homebrew:
```bash
# Install Homebrew first (if needed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Git
brew install git
```

### Step 3: Clone the Repository

1. Open Terminal and navigate to where you want to install the app:
```bash
cd ~/Documents  # or any directory you prefer
```

2. Clone the repository:
```bash
git clone https://github.com/ai-tech-karthik/fire-sentinel.git
cd fire-sentinel
```

### Step 4: Start the Application

Start all services with one command:
```bash
docker-compose up -d
```

This will:
- Download required Docker images
- Start PostgreSQL database
- Start Express.js backend
- Start React frontend
- Initialize database with schema

Wait 1-2 minutes for all services to start.

### Step 5: Verify Services

Check that all services are running:
```bash
docker-compose ps
```

You should see:
- `postgres` - Up
- `backend` - Up
- `frontend` - Up

### Step 6: Access the Application

Open your browser and go to:
```
http://localhost:5173
```

### Step 7: Login

Use the default admin credentials:
- **Email**: `admin@fire-sentinel.local`
- **Password**: `admin123`

⚠️ **IMPORTANT**: Change this password immediately after first login!

### Step 8: Configure API Keys

1. Navigate to Settings page
2. Add your API keys:
   - **Alpha Vantage API Key**: Get from [alphavantage.co](https://www.alphavantage.co/support/#api-key)
   - **OpenAI/Anthropic/Google API Key**: For sentiment analysis

---

## Option 2: Local Development Installation

### Step 1: Install Homebrew

Homebrew is a package manager for Mac:

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

Verify:
```bash
brew --version
```

### Step 2: Install Node.js

```bash
brew install node
```

Verify:
```bash
node --version  # Should show v18.x.x or higher
npm --version   # Should show 9.x.x or higher
```

### Step 3: Install Docker Desktop

Follow Step 1 from Option 1 above to install Docker Desktop.

### Step 4: Install Git

```bash
brew install git
```

Configure Git:
```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

### Step 5: Clone the Repository

```bash
cd ~/Documents
git clone https://github.com/ai-tech-karthik/fire-sentinel.git
cd fire-sentinel
```

### Step 6: Start Database Only

```bash
docker-compose up -d postgres
```

Wait for database to be ready:
```bash
docker-compose logs postgres | grep "ready to accept connections"
```

### Step 7: Install Backend Dependencies

```bash
cd backend
npm install
```

### Step 8: Configure Backend Environment

```bash
cp .env.example .env
```

Edit `.env` if needed (defaults should work):
```env
NODE_ENV=development
PORT=3001
DB_HOST=localhost
DB_PORT=5432
DB_NAME=fire_sentinel
DB_USER=postgres
DB_PASSWORD=postgres
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
FRONTEND_URL=http://localhost:5173
```

### Step 9: Start Backend

```bash
npm run dev
```

Backend should start on `http://localhost:3001`

### Step 10: Install Frontend Dependencies

Open a new Terminal window:
```bash
cd ~/Documents/fire-sentinel
npm install
```

### Step 11: Configure Frontend Environment

```bash
cp .env.example .env
```

Verify `.env` contains:
```env
VITE_API_URL=http://localhost:3001/api
```

### Step 12: Start Frontend

```bash
npm run dev
```

Frontend should start on `http://localhost:5173`

### Step 13: Access the Application

Open your browser and go to:
```
http://localhost:5173
```

Login with:
- **Email**: `admin@fire-sentinel.local`
- **Password**: `admin123`

---

## Managing the Application

### Docker Mode

**Start services**:
```bash
docker-compose up -d
```

**Stop services**:
```bash
docker-compose down
```

**View logs**:
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

**Restart services**:
```bash
docker-compose restart
```

**Rebuild services** (after code changes):
```bash
docker-compose up -d --build
```

### Development Mode

**Start backend**:
```bash
cd backend
npm run dev
```

**Start frontend**:
```bash
npm run dev
```

**Stop services**:
Press `Ctrl+C` in each terminal window

---

## Troubleshooting

### Docker Desktop Not Starting

1. Restart Docker Desktop
2. Check System Preferences > Security & Privacy
3. Ensure Docker has necessary permissions

### Port Already in Use

If you see "port already in use" errors:

```bash
# Check what's using the port
lsof -i :5173  # Frontend
lsof -i :3001  # Backend
lsof -i :5432  # Database

# Kill the process
kill -9 <PID>
```

### Services Won't Start

```bash
# Stop all services
docker-compose down

# Remove volumes (WARNING: deletes all data)
docker-compose down -v

# Rebuild and start
docker-compose up -d --build
```

### Database Connection Issues

```bash
# Check database logs
docker-compose logs postgres

# Restart database
docker-compose restart postgres

# Connect to database manually
docker-compose exec postgres psql -U postgres -d fire_sentinel
```

### Frontend Can't Connect to Backend

1. Verify backend is running: `curl http://localhost:3001/api/auth/me`
2. Check `.env` file has correct `VITE_API_URL`
3. Restart frontend: `docker-compose restart frontend`

### Scheduled Jobs Not Running

1. Check backend logs: `docker-compose logs -f backend | grep "monitor"`
2. Verify Settings configuration in the app
3. Jobs run based on frequency set in Settings page

---

## Updating the Application

### Docker Mode

```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
docker-compose down
docker-compose up -d --build
```

### Development Mode

```bash
# Pull latest changes
git pull origin main

# Update backend dependencies
cd backend
npm install

# Update frontend dependencies
cd ..
npm install

# Restart services
```

---

## Uninstalling

### Docker Mode

```bash
# Stop and remove containers
docker-compose down

# Remove volumes (deletes all data)
docker-compose down -v

# Remove Docker images
docker rmi fire-sentinel-backend fire-sentinel-frontend

# Remove repository
cd ..
rm -rf fire-sentinel
```

### Development Mode

```bash
# Stop services (Ctrl+C in terminals)

# Stop database
docker-compose down -v

# Remove repository
cd ..
rm -rf fire-sentinel
```

---

## Next Steps

After installation:

1. **Change Default Password**
   - Login with default credentials
   - Go to Settings
   - Change password immediately

2. **Configure API Keys**
   - Navigate to Settings page
   - Add Alpha Vantage API key
   - Add OpenAI/Anthropic/Google API key

3. **Set Up Alert Channels**
   - Configure Email (SMTP settings)
   - Configure Slack (webhook URL)
   - Configure SMS (Twilio)

4. **Add Your Portfolio**
   - Create accounts for your brokerages
   - Add your stock positions
   - Set profit targets and stop losses

5. **Customize Settings**
   - Adjust price check frequency
   - Adjust news check frequency
   - Set default thresholds

---

## Additional Resources

- **Quick Start Guide**: See `QUICK_START_DOCKER.md`
- **Docker Setup Guide**: See `DOCKER_SETUP_GUIDE.md`
- **Testing Guide**: See `TESTING_GUIDE.md`
- **API Documentation**: See `MIGRATION_COMPLETE.md`
- **GitHub Repository**: [github.com/ai-tech-karthik/fire-sentinel](https://github.com/ai-tech-karthik/fire-sentinel)

---

## Support

For issues or questions:

1. Check the troubleshooting section above
2. Review logs: `docker-compose logs -f`
3. Check documentation in the repository
4. Open an issue on GitHub

---

**Version**: 8.0 (Docker Migration)
**Last Updated**: May 2026
