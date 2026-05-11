# FIRE Sentinel Backend

Express.js backend API for FIRE Sentinel portfolio monitoring application.

## Features

- **REST API**: Complete CRUD operations for all resources
- **JWT Authentication**: Secure token-based authentication
- **PostgreSQL**: Database connection with connection pooling
- **Scheduled Jobs**: Automated price and news monitoring
- **Alert System**: Multi-channel alert delivery (Email/Slack/SMS)

## Quick Start

### Development Mode

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your configuration
nano .env

# Start development server
npm run dev
```

### Production Mode

```bash
# Build TypeScript
npm run build

# Start production server
npm start
```

### Docker Mode

```bash
# From project root
docker-compose up -d backend
```

## Environment Variables

Create a `.env` file with the following variables:

```env
# Server Configuration
NODE_ENV=development
PORT=3001

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=fire_sentinel
DB_USER=postgres
DB_PASSWORD=postgres

# JWT Secret (CHANGE THIS IN PRODUCTION!)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (requires auth)

### Accounts
- `GET /api/accounts` - Get all accounts (requires auth)
- `POST /api/accounts` - Create account (requires auth)
- `PUT /api/accounts/:id` - Update account (requires auth)
- `DELETE /api/accounts/:id` - Delete account (requires auth)

### Stocks
- `GET /api/stocks` - Get all stocks (requires auth)
- `GET /api/stocks/account/:accountId` - Get stocks by account (requires auth)
- `POST /api/stocks` - Create stock (requires auth)
- `PUT /api/stocks/:id` - Update stock (requires auth)
- `DELETE /api/stocks/:id` - Delete stock (requires auth)
- `PATCH /api/stocks/:id/price` - Update stock price (requires auth)
- `GET /api/stocks/symbols` - Get unique symbols (requires auth)

### Alerts
- `GET /api/alerts` - Get all alerts with pagination (requires auth)
- `GET /api/alerts/recent?limit=10` - Get recent alerts (requires auth)
- `GET /api/alerts/symbol/:symbol` - Get alerts by symbol (requires auth)
- `GET /api/alerts/stock/:stockId` - Get alerts by stock (requires auth)
- `GET /api/alerts/stats` - Get alert statistics (requires auth)
- `DELETE /api/alerts/:id` - Delete alert (requires auth)

### News
- `GET /api/news` - Get all news with pagination (requires auth)
- `GET /api/news/recent?limit=10` - Get recent news (requires auth)
- `GET /api/news/symbol/:symbol` - Get news by symbol (requires auth)
- `DELETE /api/news/:id` - Delete news (requires auth)

### Settings
- `GET /api/settings` - Get user settings (requires auth)
- `PUT /api/settings` - Update settings (requires auth)

### Price Alerts
- `GET /api/price-alerts` - Get all price alerts (requires auth)
- `GET /api/price-alerts/stock/:stockId` - Get by stock (requires auth)
- `GET /api/price-alerts/symbol/:symbol` - Get by symbol (requires auth)
- `POST /api/price-alerts` - Create price alert (requires auth)
- `PUT /api/price-alerts/:id` - Update price alert (requires auth)
- `PATCH /api/price-alerts/:id/toggle` - Toggle enabled (requires auth)
- `PATCH /api/price-alerts/:id/reset` - Reset triggered (requires auth)
- `DELETE /api/price-alerts/:id` - Delete price alert (requires auth)

## Scheduled Jobs

### Price Monitor
- **Frequency**: Configurable via Settings (default: 5 minutes)
- **Function**: Fetches current prices for all tracked stocks
- **APIs**: Alpha Vantage (primary), Yahoo Finance (fallback)
- **Actions**: Updates prices, triggers alerts

### News Monitor
- **Frequency**: Configurable via Settings (default: 10 minutes)
- **Function**: Scrapes news for all tracked symbols
- **Source**: Google News RSS feeds
- **Actions**: Sentiment analysis, stores news, triggers alerts

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── database.ts          # PostgreSQL connection
│   ├── middleware/
│   │   └── auth.ts               # JWT authentication
│   ├── routes/
│   │   ├── auth.ts               # Authentication routes
│   │   ├── accounts.ts           # Account routes
│   │   ├── stocks.ts             # Stock routes
│   │   ├── alerts.ts             # Alert routes
│   │   ├── news.ts               # News routes
│   │   ├── settings.ts           # Settings routes
│   │   └── priceAlerts.ts        # Price alert routes
│   ├── jobs/
│   │   ├── scheduler.ts          # Job scheduler
│   │   ├── priceMonitor.ts       # Price monitoring job
│   │   └── newsMonitor.ts        # News monitoring job
│   ├── utils/
│   │   └── alertSender.ts        # Alert delivery
│   └── index.ts                  # Express server
├── dist/                         # Compiled JavaScript (generated)
├── Dockerfile                    # Docker image definition
├── package.json                  # Dependencies
├── tsconfig.json                 # TypeScript config
├── .env                          # Environment variables (not in git)
└── .env.example                  # Environment template
```

## Dependencies

### Production
- `express` - Web framework
- `pg` - PostgreSQL client
- `jsonwebtoken` - JWT authentication
- `bcrypt` - Password hashing
- `node-cron` - Job scheduling
- `cors` - CORS middleware
- `axios` - HTTP client
- `xml2js` - XML parsing
- `dotenv` - Environment variables

### Development
- `typescript` - TypeScript compiler
- `tsx` - TypeScript execution
- `@types/*` - Type definitions

## Scripts

```bash
# Development
npm run dev          # Start with hot reload

# Production
npm run build        # Compile TypeScript
npm start            # Start compiled server

# Utilities
npm run lint         # Run linter (if configured)
npm test             # Run tests (if configured)
```

## Authentication

The API uses JWT (JSON Web Tokens) for authentication.

### Login Flow
1. Client sends credentials to `/api/auth/login`
2. Server validates credentials
3. Server generates JWT token
4. Client stores token (localStorage)
5. Client sends token in `Authorization` header for protected routes

### Protected Routes
All routes except `/api/auth/register` and `/api/auth/login` require authentication.

Include the JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## Database

The backend connects to PostgreSQL using the `pg` library with connection pooling.

### Connection Configuration
Set in `.env` file:
- `DB_HOST` - Database host (default: localhost)
- `DB_PORT` - Database port (default: 5432)
- `DB_NAME` - Database name (default: fire_sentinel)
- `DB_USER` - Database user (default: postgres)
- `DB_PASSWORD` - Database password

### Schema
See `../database/init.sql` for complete schema definition.

## Error Handling

The API returns consistent error responses:

```json
{
  "error": "Error message"
}
```

HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `500` - Internal Server Error

## CORS

CORS is configured to allow requests from the frontend URL specified in `FRONTEND_URL` environment variable.

Default: `http://localhost:5173`

## Security

### Password Hashing
Passwords are hashed using bcrypt with 10 salt rounds.

### JWT Tokens
- Tokens expire after 7 days
- Secret key is stored in `JWT_SECRET` environment variable
- Tokens are signed using HS256 algorithm

### SQL Injection Prevention
All database queries use parameterized queries to prevent SQL injection.

## Logging

The server logs:
- Server start/stop
- Database connection status
- Job execution
- API requests (in development mode)
- Errors

## Troubleshooting

### Database Connection Issues
```bash
# Check database is running
docker-compose ps postgres

# Check database logs
docker-compose logs postgres

# Test connection
psql -h localhost -U postgres -d fire_sentinel
```

### Port Already in Use
```bash
# Find process using port 3001
lsof -i :3001

# Kill process
kill -9 <PID>
```

### TypeScript Compilation Errors
```bash
# Clean build
rm -rf dist
npm run build
```

### Job Not Running
```bash
# Check logs
docker-compose logs -f backend | grep "monitor"

# Verify Settings configuration
# Jobs run based on frequency set in Settings
```

## Development

### Adding New Routes
1. Create route file in `src/routes/`
2. Import and use in `src/index.ts`
3. Add authentication middleware if needed

### Adding New Jobs
1. Create job file in `src/jobs/`
2. Import and schedule in `src/jobs/scheduler.ts`
3. Configure frequency in Settings

### Database Migrations
Database schema changes should be made in `../database/init.sql` and applied by recreating the database.

## Testing

### Manual Testing
Use tools like:
- Postman
- curl
- HTTPie

### Example curl Request
```bash
# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@fire-sentinel.local","password":"admin123"}'

# Get accounts (with token)
curl http://localhost:3001/api/accounts \
  -H "Authorization: Bearer <token>"
```

## Production Deployment

### Environment
- Set `NODE_ENV=production`
- Use strong `JWT_SECRET`
- Use strong database password
- Configure SSL/TLS
- Set up reverse proxy (nginx/Caddy)

### Docker
```bash
# Build production image
docker build -t fire-sentinel-backend .

# Run container
docker run -d \
  -p 3001:3001 \
  --env-file .env \
  fire-sentinel-backend
```

### Monitoring
- Set up health checks
- Monitor logs
- Track resource usage
- Set up alerts

## Support

For issues or questions:
1. Check logs: `docker-compose logs backend`
2. Review documentation
3. Check GitHub issues

---

**Version**: 8.0 (Docker Migration)
**License**: See LICENSE file
