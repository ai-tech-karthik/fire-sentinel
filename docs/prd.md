# Requirements Document

## 1. Application Overview

### 1.1 Application Name
FIRE Sentinel

### 1.2 Application Description
FIRE Sentinel is a portfolio monitoring application designed to help users track their investments across multiple brokerage accounts in a unified platform. The system monitors stock prices in real-time, analyzes news sentiment, and sends automated alerts when predefined thresholds are met, supporting users on their path to Financial Independence and Early Retirement (FIRE).

## 2. Users and Usage Scenarios

### 2.1 Target Users
Individual investors managing multiple brokerage accounts who are pursuing FIRE goals and need consolidated portfolio monitoring with automated alerts.

### 2.2 Core Usage Scenarios
- Monitor consolidated portfolio value across multiple broker accounts
- Track individual stock performance with real-time price updates
- Receive alerts when stocks hit profit targets or stop-loss thresholds
- Receive alerts when stocks reach custom target prices
- Analyze news sentiment to assess investment risks
- Manage portfolio holdings through web interface
- Export portfolio data for record-keeping

## 3. Page Structure and Functionality

```
FIRE Sentinel Application
├── Dashboard Page
├── Portfolio Management Page
├── Alerts History Page
├── News Feed Page
└── Settings Page
```

### 3.1 Dashboard Page

#### 3.1.1 Overall Portfolio Summary
- Display total portfolio value across all accounts
- Display total profit/loss amount and percentage
- Display overall portfolio performance metrics

#### 3.1.2 Account-Level Summary
- Display individual broker account sections
- For each account, show:
  - Account name/identifier
  - Account total value
  - Account profit/loss amount and percentage
  - List of stocks held in that account

#### 3.1.3 Individual Stock Performance
- For each stock, display:
  - Stock symbol
  - Quantity held
  - Bought price
  - Current price
  - Current value
  - Profit/loss amount and percentage
  - Price change indicator
  - Custom price alerts status

#### 3.1.4 Recent Alerts Summary
- Display latest 5-10 alerts with timestamp
- Show alert type (profit target, stop loss, custom price alert, news sentiment)
- Provide link to view all alerts

#### 3.1.5 News Summary
- Display recent news headlines grouped by stock symbol
- Show sentiment indicator for each news item
- Provide link to full news feed

### 3.2 Portfolio Management Page

#### 3.2.1 Account Management
- Add new broker account
- Edit existing account name
- Delete account

#### 3.2.2 Stock Management
- Add new stock to specific account with fields:
  - Stock symbol
  - Bought price
  - Quantity
  - Target profit percentage
  - Stop loss percentage
- Edit existing stock details
- Remove stock from portfolio

#### 3.2.3 Custom Price Alerts Management
- Add custom price alert for any stock with fields:
  - Stock symbol
  - Target price
  - Alert direction (above or below target price)
  - Optional note
- View all custom price alerts for a stock
- Edit existing custom price alert
- Delete custom price alert
- Enable/disable individual custom price alerts

#### 3.2.4 Portfolio Import/Export
- Upload JSON/CSV file to import portfolio data
- Download current portfolio as CSV file

### 3.3 Alerts History Page

#### 3.3.1 Alert List
- Display all historical alerts in chronological order
- Show alert details:
  - Timestamp
  - Stock symbol
  - Alert type
  - Trigger condition
  - Stock price at alert time
  - Message content

#### 3.3.2 Alert Filtering
- Filter alerts by date range
- Filter alerts by stock symbol
- Filter alerts by alert type

### 3.4 News Feed Page

#### 3.4.1 News Display
- Display news articles grouped by stock symbol
- For each article, show:
  - Headline
  - Source
  - Publication time
  - Sentiment score and indicator
  - Link to original article

#### 3.4.2 News Filtering
- Filter news by stock symbol
- Filter news by sentiment (positive, neutral, negative)
- Filter news by date range

### 3.5 Settings Page

#### 3.5.1 API Configuration
- Configure Alpha Vantage API key
- Configure Yahoo Finance API key
- Configure Gen AI chat service:
  - Select platform (OpenAI, Anthropic, Google Gemini, or other available platforms)
  - Configure API key for selected platform

#### 3.5.2 Alert Delivery Configuration
- Enable/disable alert channels:
  - Email
  - Slack
  - SMS
- Configure delivery details for each enabled channel:
  - Email address for email alerts
  - Slack webhook URL for Slack alerts
  - Phone number for SMS alerts

#### 3.5.3 Monitoring Configuration
- Set price check frequency
- Set news check frequency
- Configure default profit target percentage
- Configure default stop loss percentage

## 4. Business Rules and Logic

### 4.1 Price Monitoring
- Fetch real-time stock prices using Alpha Vantage API as primary source
- Use Yahoo Finance API as fallback if Alpha Vantage fails
- Update prices at configured frequency
- Calculate current value, profit/loss for each stock position
- Check custom price alerts against current prices

### 4.2 News Monitoring
- Scrape latest news from Google News RSS feed for each stock symbol
- Perform sentiment analysis using VADER or similar free tool
- Assign sentiment score: positive, neutral, or negative
- Store news articles with sentiment scores

### 4.3 Alert Triggering
- Profit Target Alert: Trigger when stock profit percentage reaches or exceeds target profit threshold
- Stop Loss Alert: Trigger when stock loss percentage reaches or exceeds stop loss threshold
- Custom Price Alert: Trigger when stock price reaches or crosses the specified target price in the configured direction (above or below)
- Negative Sentiment Alert: Trigger when news sentiment score indicates significant negative sentiment
- Send alerts through all enabled delivery channels configured by user
- Automatically disable custom price alert after it is triggered

### 4.4 Portfolio Calculation
- Account-level value = Sum of (quantity × current price) for all stocks in account
- Account-level profit/loss = Account current value - Sum of (quantity × bought price)
- Overall portfolio value = Sum of all account values
- Overall profit/loss = Sum of all account profit/loss values

### 4.5 Data Persistence
- Store portfolio data locally
- Store alert history locally
- Store custom price alerts locally
- Store news articles and sentiment scores locally
- Store user settings locally
- Store API keys securely in local storage

### 4.6 Gen AI Integration
- Use configured Gen AI chat service for enhanced sentiment analysis
- Integrate Gen AI API seamlessly with configured API key
- Support multiple Gen AI platforms including OpenAI, Anthropic, Google Gemini, and other available platforms

### 4.7 Custom Price Alert Rules
- Multiple custom price alerts can be set for the same stock
- Each custom price alert can be independently enabled or disabled
- Alert direction determines trigger condition:
  - Above: Trigger when current price >= target price
  - Below: Trigger when current price <= target price
- Once triggered, custom price alert is automatically disabled to prevent repeated notifications
- User can manually re-enable triggered alerts if needed

## 5. Exception and Boundary Conditions

| Scenario | Handling |
|----------|----------|
| API rate limit exceeded | Switch to fallback API; display message if all APIs exhausted |
| Invalid stock symbol entered | Display error message; prevent adding to portfolio |
| Network connection failure | Display connection error; retry after configured interval |
| CSV/JSON import file format error | Display validation error with specific issue description |
| Alert delivery failure | Log failure; retry delivery; display notification to user |
| No news available for stock | Display message indicating no recent news found |
| Duplicate stock symbol in same account | Display error; prevent duplicate entry |
| Empty portfolio | Display message prompting user to add stocks |
| Missing or invalid API key | Display error message; prompt user to configure API key in Settings |
| Gen AI service unavailable | Fall back to basic sentiment analysis; display notification |
| Invalid target price entered | Display error message; prevent saving custom price alert |
| Custom price alert for non-existent stock | Display error message; prevent creating alert |
| Duplicate custom price alert | Allow creation; treat as separate alert |

## 6. Acceptance Criteria

- User can add, edit, and remove broker accounts through web interface
- User can add, edit, and remove stocks with all required fields through web interface
- User can add custom price alerts for any stock with target price and direction
- User can view, edit, delete, enable, and disable custom price alerts
- User can upload JSON/CSV file to import portfolio data
- User can download current portfolio as CSV file
- Dashboard displays overall portfolio value and profit/loss accurately
- Dashboard displays account-level values and profit/loss for each broker account
- Dashboard displays individual stock performance with current prices
- Dashboard shows custom price alerts status for each stock
- Dashboard shows recent alerts summary including custom price alerts
- Dashboard shows news summary grouped by stock
- User can configure Alpha Vantage API key in Settings
- User can configure Yahoo Finance API key in Settings
- User can select Gen AI platform and configure API key in Settings
- System fetches real-time prices using Alpha Vantage with Yahoo Finance fallback
- System scrapes news from Google News RSS feed
- System performs sentiment analysis on news articles
- System integrates Gen AI service seamlessly when configured
- System triggers profit target alerts when threshold is reached
- System triggers stop loss alerts when threshold is reached
- System triggers custom price alerts when target price is reached in specified direction
- System automatically disables custom price alert after triggering
- System triggers negative sentiment alerts based on news analysis
- User can configure alert delivery channels in settings
- System sends alerts via enabled channels (email, Slack, SMS)
- Alerts History page displays all historical alerts including custom price alerts with filtering options
- News Feed page displays news articles with sentiment scores and filtering options
- All calculations for portfolio value and profit/loss are accurate

## 7. Out of Scope for Current Release

- Multi-user support with registration and login
- Cloud-based data storage and synchronization
- Mobile application version
- Advanced charting and technical analysis tools
- Automated trading execution
- Integration with brokerage APIs for automatic portfolio sync
- Historical performance tracking and analytics
- Tax reporting features
- Portfolio rebalancing recommendations
- Cryptocurrency support