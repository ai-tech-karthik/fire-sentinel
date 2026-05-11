# FIRE Sentinel - Portfolio Monitoring Application

FIRE Sentinel is a comprehensive, self-contained portfolio monitoring application designed to help investors track their investments across multiple brokerage accounts. The system monitors stock prices in real-time, analyzes news sentiment, and sends automated alerts when predefined thresholds are met.

**🐳 Now with Docker support for easy, self-contained deployment!**

## 🚀 Quick Start

### Option 1: Docker (Recommended - Easiest Setup)

**Prerequisites**: Docker and Docker Compose installed

```bash
# Clone repository
git clone https://github.com/ai-tech-karthik/fire-sentinel.git
cd fire-sentinel

# Start all services (PostgreSQL, Backend, Frontend)
docker-compose up -d

# Access the application
open http://localhost:5173
```

**Default Login**:
- Email: `admin@fire-sentinel.local`
- Password: `admin123`

⚠️ **Change the default password immediately after first login!**

See **[DOCKER_SETUP_GUIDE.md](DOCKER_SETUP_GUIDE.md)** for complete Docker documentation.

### Option 2: Local Development (Mac)

See **[MAC_INSTALLATION_GUIDE.md](MAC_INSTALLATION_GUIDE.md)** for detailed installation instructions.

**Quick Install**:
```bash
# Install Node.js
brew install node

# Clone and setup
git clone https://github.com/ai-tech-karthik/fire-sentinel.git
cd fire-sentinel

# Start database (Docker)
docker-compose up -d postgres

# Start backend
cd backend
npm install
npm run dev

# Start frontend (in new terminal)
cd ..
npm install
npm run dev
```

Then open http://localhost:5173 in your browser.

## 📚 Documentation

- **[DOCKER_SETUP_GUIDE.md](DOCKER_SETUP_GUIDE.md)**: Complete Docker setup and deployment guide
- **[MAC_INSTALLATION_GUIDE.md](MAC_INSTALLATION_GUIDE.md)**: Complete Mac installation guide
- **[QUICK_START_MAC.md](QUICK_START_MAC.md)**: Get running in 5 minutes
- **[GITHUB_SETUP_GUIDE.md](GITHUB_SETUP_GUIDE.md)**: Set up GitHub repository
- **[API_CONFIGURATION_GUIDE.md](API_CONFIGURATION_GUIDE.md)**: Configure API keys
- **[CUSTOM_PRICE_ALERTS_GUIDE.md](CUSTOM_PRICE_ALERTS_GUIDE.md)**: Use custom price alerts

## Features

### Portfolio Management
- **Multi-Account Support**: Track stocks across different brokerage accounts
- **Real-Time Price Monitoring**: Automatic price updates using Alpha Vantage and Yahoo Finance APIs
- **Profit/Loss Tracking**: View current value, cost basis, and returns for each position
- **CSV Export**: Download your portfolio data for record-keeping

### Alert System
- **Profit Target Alerts**: Get notified when stocks reach your target profit percentage
- **Stop Loss Alerts**: Receive warnings when stocks hit your stop loss threshold
- **Custom Price Alerts**: Set specific target prices with upward or downward triggers
- **Sentiment Alerts**: Be informed of negative news sentiment for your holdings
- **Multiple Delivery Channels**: Email, Slack, and SMS alert options

### News Monitoring
- **Automated News Scraping**: Fetches latest news from Google News RSS
- **Sentiment Analysis**: AI-powered sentiment scoring for each news article
- **Filtering & Search**: Filter news by stock symbol, sentiment, or date

### Dashboard
- **Portfolio Overview**: See total portfolio value and profit/loss at a glance
- **Account Summaries**: View performance for each brokerage account
- **Recent Activity**: Quick access to latest alerts and news

## Getting Started

### 1. Add Your First Account
1. Navigate to the **Portfolio** page
2. Click "Add Account"
3. Enter your account name (e.g., "Fidelity Brokerage")
4. Optionally add a description
5. Click "Create"

### 2. Add Stocks to Your Portfolio
1. On the **Portfolio** page, click "Add Stock"
2. Select the account
3. Enter the stock symbol (e.g., AAPL, GOOGL)
4. Enter quantity and bought price
5. Set your target profit percentage (default: 20%)
6. Set your stop loss percentage (default: 10%)
7. Click "Add"

### 3. Configure API Keys and Alert Settings
1. Go to the **Settings** page
2. **API Configuration**:
   - **Alpha Vantage API Key**: Enter your Alpha Vantage API key for reliable price data
     - Get a free key from [Alpha Vantage](https://www.alphavantage.co/support/#api-key)
   - **Yahoo Finance API Key**: Optional, used as fallback
   - **Gen AI Platform**: Select your preferred AI service (OpenAI, Anthropic Claude, or Google Gemini)
   - **Gen AI API Key**: Enter your API key for enhanced sentiment analysis
     - OpenAI: Get key from [OpenAI Platform](https://platform.openai.com/api-keys)
     - Anthropic: Get key from [Anthropic Console](https://console.anthropic.com/)
     - Google: Get key from [Google AI Studio](https://makersuite.google.com/app/apikey)
3. **Monitoring Configuration**:
   - Set monitoring frequencies:
     - Price Check Frequency: How often to update stock prices (recommended: 300 seconds)
     - News Check Frequency: How often to check for news (recommended: 600 seconds)
4. **Alert Delivery**:
   - **Email**: Enable and enter your email address
   - **Slack**: Enable and enter your Slack webhook URL
   - **SMS**: Enable and enter your phone number with country code
5. Click "Save Settings"

### 4. Set Custom Price Alerts (Optional)
1. Go to **Portfolio Management** page
2. Click the chevron icon (>) next to any stock to expand price alerts
3. Click "Add Alert" to create a new custom price alert:
   - **Target Price**: Enter the specific price you want to monitor
   - **Alert When Price**: Choose "Reaches or exceeds target (↑)" or "Falls to or below target (↓)"
   - **Note**: Add an optional note to remind yourself why you set this alert
4. Manage your alerts:
   - **Enable/Disable**: Toggle alerts on or off without deleting them
   - **Edit**: Modify target price, direction, or note
   - **Delete**: Remove alerts you no longer need
   - **Re-enable**: Triggered alerts can be re-enabled to monitor the same price again

**Custom Price Alert Features**:
- Set multiple alerts for the same stock
- Alerts automatically disable after triggering to prevent spam
- View triggered alerts with timestamp
- Independent from percentage-based profit/loss alerts

### 5. Monitor Your Portfolio
1. Visit the **Dashboard** to see your portfolio performance
2. Click "Refresh Prices" to manually update stock prices
3. View recent alerts and news summaries

### 6. Review Alerts & News
- **Alerts Page**: View all historical alerts with filtering options
- **News Page**: Browse news articles with sentiment analysis

## API Configuration

### Alpha Vantage
The primary source for stock price data. Configure your API key in Settings:
1. Get a free API key from [Alpha Vantage](https://www.alphavantage.co/support/#api-key)
2. Go to Settings > API Configuration
3. Enter your API key in the "Alpha Vantage API Key" field
4. Click "Save Settings"

**Free Tier Limits**:
- 5 API calls per minute
- 500 API calls per day

### Yahoo Finance
Used as a fallback when Alpha Vantage is unavailable or rate-limited. The system automatically uses Yahoo Finance if:
- Alpha Vantage API key is not configured
- Alpha Vantage rate limit is exceeded
- Alpha Vantage returns an error

No API key is required for basic Yahoo Finance usage.

### Gen AI Services
Enhance sentiment analysis with AI-powered insights. Supported platforms:

**OpenAI (GPT-3.5/GPT-4)**:
1. Get API key from [OpenAI Platform](https://platform.openai.com/api-keys)
2. In Settings, select "OpenAI" as Gen AI Platform
3. Enter your API key
4. The system will use GPT-3.5-turbo for sentiment analysis

**Anthropic (Claude)**:
1. Get API key from [Anthropic Console](https://console.anthropic.com/)
2. In Settings, select "Anthropic" as Gen AI Platform
3. Enter your API key
4. The system will use Claude 3 Haiku for sentiment analysis

**Google (Gemini)**:
1. Get API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. In Settings, select "Google" as Gen AI Platform
3. Enter your API key
4. The system will use Gemini Pro for sentiment analysis

**Benefits of AI-Enhanced Sentiment**:
- More accurate sentiment scoring
- Better understanding of context and nuance
- Improved detection of sarcasm and complex language
- Contextual analysis of financial terminology

**Fallback Behavior**:
If AI service is unavailable or not configured, the system automatically falls back to the built-in keyword-based sentiment analyzer.

### Slack Webhooks
To receive alerts in Slack:
1. Go to your Slack workspace settings
2. Create an Incoming Webhook
3. Copy the webhook URL
4. Paste it in Settings > Alert Delivery > Slack Webhook URL

## Monitoring Frequency

The application uses Edge Functions to monitor prices and news:
- **Price Monitor**: Runs at the frequency you set in Settings (default: 5 minutes)
- **News Monitor**: Runs at the frequency you set in Settings (default: 10 minutes)

You can also manually trigger updates:
- Dashboard: Click "Refresh Prices"
- News Page: Click "Refresh News"

## Data Export

Export your portfolio data as CSV:
1. Go to the **Portfolio** page
2. Click "Export CSV"
3. The file will download with the current date in the filename

## Tips for Success

1. **Set Realistic Thresholds**: Adjust profit targets and stop losses based on your investment strategy
2. **Regular Monitoring**: Check the dashboard daily to stay informed
3. **Review Alerts**: Pay attention to stop loss alerts to protect your capital
4. **News Sentiment**: Use sentiment analysis to gauge market mood around your holdings
5. **Diversification**: Track multiple accounts and stocks to maintain a diversified portfolio

## Technical Details

### Architecture
- **Frontend**: React + TypeScript + Vite + Tailwind CSS + shadcn/ui
- **Backend**: Express.js + Node.js + TypeScript
- **Database**: PostgreSQL 15
- **Authentication**: JWT-based authentication with bcrypt
- **Deployment**: Docker + Docker Compose
- **Scheduled Jobs**: node-cron for price and news monitoring

### External APIs
- **Price Data**: Alpha Vantage API (primary) + Yahoo Finance API (fallback)
- **News Source**: Google News RSS feeds
- **Sentiment Analysis**: OpenAI GPT / Anthropic Claude / Google Gemini (configurable)
- **Notifications**: Email / Slack / SMS (configurable)

### Key Features
- ✅ Self-contained deployment with Docker
- ✅ No cloud dependencies (runs completely locally)
- ✅ Automated price monitoring with configurable frequency
- ✅ AI-powered sentiment analysis
- ✅ Multi-channel alert delivery
- ✅ Custom price alerts with directional triggers
- ✅ Comprehensive portfolio tracking

## Support

For issues or questions, please refer to the application documentation or contact support.

---

**Disclaimer**: This application is for informational purposes only and does not constitute financial advice. Always do your own research and consult with a financial advisor before making investment decisions.
