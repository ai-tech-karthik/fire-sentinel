# FIRE Sentinel - Quick Start Guide (Mac)

Get FIRE Sentinel running on your Mac in 5 minutes!

## Prerequisites

- macOS 10.15 or later
- 8GB RAM minimum
- 2GB free disk space

## Quick Start (Docker - Recommended)

### 1. Install Docker Desktop

Download and install from [docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop/)

### 2. Install Git (if needed)

```bash
# Check if Git is installed
git --version

# If not, install via Homebrew
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
brew install git
```

### 3. Clone and Start

```bash
# Clone repository
git clone https://github.com/ai-tech-karthik/fire-sentinel.git
cd fire-sentinel

# Start all services
docker-compose up -d

# Wait 1-2 minutes for services to start
```

### 4. Access Application

Open browser to: **http://localhost:5173**

### 5. Login

- **Email**: `admin@fire-sentinel.local`
- **Password**: `admin123`

⚠️ **Change password immediately after first login!**

---

## Alternative: Development Mode

### 1. Install Prerequisites

```bash
# Install Homebrew
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Node.js and Git
brew install node git

# Install Docker Desktop (see step 1 above)
```

### 2. Clone Repository

```bash
git clone https://github.com/ai-tech-karthik/fire-sentinel.git
cd fire-sentinel
```

### 3. Start Database

```bash
docker-compose up -d postgres
```

### 4. Start Backend

```bash
cd backend
npm install
npm run dev
```

### 5. Start Frontend (New Terminal)

```bash
cd fire-sentinel
npm install
npm run dev
```

### 6. Access Application

Open browser to: **http://localhost:5173**

---

## Verify Installation

### Check Services

```bash
# Docker mode
docker-compose ps

# Should show:
# postgres - Up
# backend  - Up
# frontend - Up
```

### Check Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
```

---

## Common Commands

### Start Services

```bash
docker-compose up -d
```

### Stop Services

```bash
docker-compose down
```

### Restart Services

```bash
docker-compose restart
```

### View Logs

```bash
docker-compose logs -f
```

### Rebuild After Changes

```bash
docker-compose up -d --build
```

---

## Next Steps

1. **Change Password**
   - Login with default credentials
   - Go to Settings
   - Update password

2. **Configure API Keys**
   - Get Alpha Vantage API key: [alphavantage.co](https://www.alphavantage.co/support/#api-key)
   - Get OpenAI/Anthropic/Google API key
   - Add keys in Settings page

3. **Add Portfolio**
   - Create brokerage accounts
   - Add stock positions
   - Set profit targets and stop losses

4. **Set Up Alerts**
   - Configure email/Slack/SMS
   - Set monitoring frequencies
   - Test alert delivery

---

## Troubleshooting

### Port Already in Use

```bash
# Find and kill process
lsof -i :5173  # Frontend
lsof -i :3001  # Backend
kill -9 <PID>
```

### Services Won't Start

```bash
# Reset everything
docker-compose down -v
docker-compose up -d --build
```

### Can't Access Application

1. Check services are running: `docker-compose ps`
2. Check logs: `docker-compose logs -f`
3. Verify URL: `http://localhost:5173`

---

## Full Documentation

For detailed instructions, see:

- **Installation Guide**: `MAC_INSTALLATION_GUIDE.md`
- **Docker Guide**: `DOCKER_SETUP_GUIDE.md`
- **Testing Guide**: `TESTING_GUIDE.md`
- **API Documentation**: `MIGRATION_COMPLETE.md`

---

## Support

- Check logs: `docker-compose logs -f`
- Review documentation
- Open GitHub issue

---

**Version**: 8.0 (Docker Migration)
**Time to Setup**: 5 minutes
