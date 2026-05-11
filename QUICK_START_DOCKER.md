# Quick Start Guide - Docker Migration Testing

## Prerequisites
- Docker and Docker Compose installed
- Git installed
- Ports 5173, 3001, and 5432 available

## Quick Start (5 Minutes)

### 1. Clone and Navigate
```bash
git clone https://github.com/ai-tech-karthik/fire-sentinel.git
cd fire-sentinel
```

### 2. Start All Services
```bash
docker-compose up -d
```

This will start:
- PostgreSQL database on port 5432
- Backend API on port 3001
- Frontend on port 5173

### 3. Wait for Services to Start
```bash
# Check status
docker-compose ps

# Watch logs
docker-compose logs -f
```

Wait until you see:
- `postgres` - "database system is ready to accept connections"
- `backend` - "Server running on port 3001"
- `frontend` - "server started"

### 4. Access Application
Open your browser to: http://localhost:5173

### 5. Login
Use the default admin credentials:
- **Email**: `admin@fire-sentinel.local`
- **Password**: `admin123`

⚠️ **IMPORTANT**: Change this password immediately after first login!

---

## Testing Checklist

### Authentication ✓
- [ ] Login with default credentials
- [ ] Change password in Settings
- [ ] Logout and login with new password
- [ ] Try registering a new user

### Portfolio Management ✓
- [ ] Create a new account
- [ ] Add stocks to the account
- [ ] View portfolio summary
- [ ] Edit stock details
- [ ] Delete a stock

### Price Monitoring ✓
- [ ] Click "Refresh Prices" on Dashboard
- [ ] Verify prices update
- [ ] Check alerts are generated for profit/loss thresholds

### News Monitoring ✓
- [ ] Navigate to News page
- [ ] Click "Refresh News"
- [ ] Verify news articles appear
- [ ] Filter by symbol
- [ ] Filter by sentiment

### Settings ✓
- [ ] Navigate to Settings page
- [ ] Configure API keys (Alpha Vantage, OpenAI/Anthropic/Google)
- [ ] Set price check frequency
- [ ] Set news check frequency
- [ ] Configure alert channels (Email/Slack/SMS)
- [ ] Save settings

### Price Alerts ✓
- [ ] Create a custom price alert
- [ ] Set target price and direction
- [ ] Enable/disable alert
- [ ] Reset triggered alert
- [ ] Delete alert

### Scheduled Jobs ✓
- [ ] Wait 5 minutes for price monitor to run
- [ ] Wait 10 minutes for news monitor to run
- [ ] Check backend logs: `docker-compose logs -f backend`
- [ ] Verify new alerts appear
- [ ] Verify new news articles appear

---

## Troubleshooting

### Services won't start
```bash
# Stop all services
docker-compose down

# Remove volumes (WARNING: This deletes all data!)
docker-compose down -v

# Rebuild and start
docker-compose up -d --build
```

### Can't access frontend
```bash
# Check if port 5173 is in use
lsof -i :5173

# Check frontend logs
docker-compose logs frontend
```

### Backend API errors
```bash
# Check backend logs
docker-compose logs backend

# Restart backend
docker-compose restart backend
```

### Database connection issues
```bash
# Check database logs
docker-compose logs postgres

# Verify database is running
docker-compose ps postgres

# Connect to database
docker-compose exec postgres psql -U postgres -d fire_sentinel
```

### Scheduled jobs not running
```bash
# Check backend logs for job execution
docker-compose logs -f backend | grep "monitor"

# Verify Settings configuration
# Jobs run based on frequency set in Settings page
```

---

## Development Mode

If you want to develop locally without Docker:

### 1. Start Database Only
```bash
docker-compose up -d postgres
```

### 2. Start Backend
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
```

### 3. Start Frontend
```bash
# In project root
npm install
cp .env.example .env
# Edit .env with VITE_API_URL=http://localhost:3001/api
npm run dev
```

---

## Stopping Services

### Stop all services
```bash
docker-compose down
```

### Stop and remove volumes (deletes all data)
```bash
docker-compose down -v
```

### Stop specific service
```bash
docker-compose stop backend
docker-compose stop frontend
docker-compose stop postgres
```

---

## Useful Commands

### View logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

### Restart services
```bash
# All services
docker-compose restart

# Specific service
docker-compose restart backend
```

### Rebuild services
```bash
# Rebuild all
docker-compose up -d --build

# Rebuild specific service
docker-compose up -d --build backend
```

### Access database
```bash
# Connect to PostgreSQL
docker-compose exec postgres psql -U postgres -d fire_sentinel

# List tables
\dt

# Query users
SELECT * FROM users;

# Exit
\q
```

### Check service status
```bash
docker-compose ps
```

---

## Next Steps After Testing

1. **Configure API Keys** in Settings page:
   - Alpha Vantage API key (get from https://www.alphavantage.co/support/#api-key)
   - OpenAI/Anthropic/Google API key for sentiment analysis

2. **Set Up Alert Channels**:
   - Email: Configure SMTP settings
   - Slack: Create webhook URL
   - SMS: Configure Twilio or similar service

3. **Customize Settings**:
   - Adjust price check frequency
   - Adjust news check frequency
   - Set default profit targets and stop losses

4. **Add Your Portfolio**:
   - Create accounts for your brokerages
   - Add your stock positions
   - Set profit targets and stop losses

5. **Monitor and Adjust**:
   - Check alerts regularly
   - Review news sentiment
   - Adjust thresholds as needed

---

## Production Deployment

For production deployment:

1. **Use Production Docker Compose**:
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

2. **Set Strong Secrets**:
   - Change JWT_SECRET in backend/.env
   - Use strong database password
   - Change default admin password

3. **Configure Reverse Proxy**:
   - Use nginx or Caddy
   - Set up SSL certificates
   - Configure domain name

4. **Set Up Backups**:
   - Configure PostgreSQL backups
   - Set up automated backup schedule
   - Test restore procedure

5. **Monitor Services**:
   - Set up health checks
   - Configure logging
   - Monitor resource usage

---

## Support

For detailed documentation, see:
- **DOCKER_SETUP_GUIDE.md** - Comprehensive Docker guide
- **MIGRATION_COMPLETE.md** - Migration summary and architecture
- **README.md** - General application documentation

For issues:
1. Check logs: `docker-compose logs -f`
2. Review troubleshooting section above
3. Check GitHub issues
4. Refer to documentation

---

**Happy Testing!** 🚀
