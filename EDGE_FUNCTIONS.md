# FIRE Sentinel - Edge Functions Guide

## Overview

FIRE Sentinel uses three Supabase Edge Functions to automate portfolio monitoring:

1. **price-monitor**: Updates stock prices and triggers profit/loss alerts
2. **news-monitor**: Fetches news articles and performs sentiment analysis
3. **send-alert**: Delivers alerts via configured channels (Email/Slack/SMS)

## Edge Functions

### 1. price-monitor

**Purpose**: Fetches real-time stock prices and checks for profit target or stop loss conditions.

**How it works**:
- Retrieves all stocks from the database
- Fetches current prices from Alpha Vantage (primary) or Yahoo Finance (fallback)
- Updates stock prices in the database
- Calculates profit/loss percentage for each stock
- Creates alerts when thresholds are exceeded
- Automatically triggers send-alert for new alerts

**Manual Invocation**:
```typescript
const { error } = await supabase.functions.invoke('price-monitor');
```

**Triggered from**: Dashboard page "Refresh Prices" button

### 2. news-monitor

**Purpose**: Scrapes news articles and analyzes sentiment for portfolio stocks.

**How it works**:
- Retrieves unique stock symbols from the database
- Fetches latest news from Google News RSS for each symbol
- Performs sentiment analysis on article titles
  - If Gen AI is configured: Uses AI service (OpenAI/Anthropic/Google) for advanced analysis
  - If Gen AI is not configured: Uses built-in keyword-based analyzer
- Stores news articles with sentiment scores
- Creates alerts for significantly negative sentiment
- Automatically triggers send-alert for new alerts

**Sentiment Scoring**:

*Built-in Analyzer*:
- Positive words (gain, profit, surge, etc.) add to score
- Negative words (loss, fall, drop, etc.) subtract from score
- Score range: -1.0 (very negative) to +1.0 (very positive)
- Labels: positive (>0.2), neutral (-0.2 to 0.2), negative (<-0.2)

*AI-Enhanced Analyzer* (when configured):
- Uses GPT-3.5-turbo (OpenAI), Claude 3 Haiku (Anthropic), or Gemini Pro (Google)
- Provides more accurate sentiment with context understanding
- Better handles sarcasm, complex language, and financial terminology
- Falls back to built-in analyzer if AI service fails

**Manual Invocation**:
```typescript
const { error } = await supabase.functions.invoke('news-monitor');
```

**Triggered from**: News page "Refresh News" button

### 3. send-alert

**Purpose**: Delivers alerts through configured channels.

**How it works**:
- Receives alert data as input
- Retrieves alert delivery settings from database
- Sends alert via enabled channels:
  - **Email**: Uses Supabase email service (placeholder in current implementation)
  - **Slack**: Posts formatted message to webhook URL
  - **SMS**: Uses SMS service (placeholder in current implementation)

**Slack Message Format**:
- Color-coded by alert type (green=profit, red=loss, orange=sentiment)
- Includes stock symbol, alert type, and trigger value
- Timestamped for tracking

**Invocation**:
```typescript
await supabase.functions.invoke('send-alert', {
  body: { 
    alert: {
      symbol: 'AAPL',
      alert_type: 'profit_target',
      message: 'AAPL has reached your profit target...',
      trigger_value: '25.5%'
    }
  }
});
```

**Triggered from**: price-monitor and news-monitor Edge Functions

## Automation Setup

### Scheduled Monitoring (Future Enhancement)

To automate monitoring, you can set up cron jobs or scheduled tasks:

**Option 1: Supabase Cron (if available)**
```sql
-- Schedule price monitoring every 5 minutes
SELECT cron.schedule(
  'price-monitor-job',
  '*/5 * * * *',
  $$
  SELECT net.http_post(
    url:='https://your-project.supabase.co/functions/v1/price-monitor',
    headers:='{"Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb
  );
  $$
);
```

**Option 2: External Cron Service**
Use services like:
- GitHub Actions (free for public repos)
- Vercel Cron Jobs
- AWS EventBridge
- Google Cloud Scheduler

Example GitHub Action:
```yaml
name: Monitor Portfolio
on:
  schedule:
    - cron: '*/5 * * * *'  # Every 5 minutes
jobs:
  monitor:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger price monitor
        run: |
          curl -X POST https://your-project.supabase.co/functions/v1/price-monitor \
            -H "Authorization: Bearer ${{ secrets.SUPABASE_ANON_KEY }}"
```

**Option 3: Client-Side Polling**
The application can poll the Edge Functions at configured intervals when the browser is open.

## API Keys & Configuration

### Configuring API Keys

All API keys are now configured through the Settings page in the application:

1. **Alpha Vantage API Key**:
   - Go to Settings > API Configuration
   - Enter your Alpha Vantage API key
   - Get a free key from https://www.alphavantage.co/support/#api-key
   - Used by: price-monitor Edge Function

2. **Yahoo Finance API Key** (Optional):
   - Go to Settings > API Configuration
   - Enter your Yahoo Finance API key (if you have one)
   - Used by: price-monitor Edge Function as fallback

3. **Gen AI Platform & API Key**:
   - Go to Settings > API Configuration
   - Select platform: OpenAI, Anthropic, Google, or None
   - Enter your API key for the selected platform
   - Used by: news-monitor Edge Function for enhanced sentiment analysis

### How API Keys Are Used

**Database Storage**:
- API keys are stored in the `settings` table
- Keys are stored as plain text (consider encryption for production use)
- Only accessible server-side through Edge Functions

**Edge Function Access**:
- Edge Functions read API keys from the settings table at runtime
- Falls back to environment variables if database keys are not set
- Provides flexibility to change keys without redeploying functions

**Security Best Practices**:
- Never expose API keys in client-side code
- Rotate keys regularly
- Use separate keys for development and production
- Monitor API usage to detect unauthorized access

### Environment Variables (Legacy Support)

For backward compatibility, Edge Functions still support environment variables:

1. Go to Supabase Dashboard > Project Settings > Edge Functions
2. Add secrets:
   - `ALPHA_VANTAGE_API_KEY` = your Alpha Vantage key

**Note**: Database settings take precedence over environment variables.

### Slack Webhook

Configure in the Settings page of the application. No Edge Function secrets needed.

### Email & SMS

Current implementation uses placeholder functions. To enable:

**Email**: 
- Integrate with SendGrid, AWS SES, or similar
- Add API keys to Edge Function secrets

**SMS**:
- Integrate with Twilio, AWS SNS, or similar
- Add API keys to Edge Function secrets

## Error Handling

All Edge Functions include:
- Try-catch blocks for error handling
- Fallback mechanisms (e.g., Yahoo Finance if Alpha Vantage fails)
- Detailed error logging to console
- Graceful degradation (continues processing other stocks if one fails)

## Rate Limits

**Alpha Vantage Free Tier**:
- 5 API calls per minute
- 500 API calls per day

**Yahoo Finance**:
- No official rate limits
- Recommended: Don't exceed 2000 requests per hour

**Google News RSS**:
- No official rate limits
- Recommended: Check every 10+ minutes

**Best Practice**: Set monitoring frequencies in Settings to respect these limits.

## Monitoring & Debugging

To check Edge Function logs:
1. Go to Supabase Dashboard
2. Navigate to Edge Functions
3. Select the function
4. View logs for errors and execution details

Common issues:
- **Rate limit exceeded**: Increase monitoring frequency in Settings
- **Invalid stock symbol**: Check symbol spelling in Portfolio
- **Webhook failed**: Verify Slack webhook URL in Settings
- **No price data**: Check if market is open (stocks only update during trading hours)

## Security Notes

- Edge Functions run server-side with full database access
- Never expose service role keys to the client
- Webhook URLs should be kept secure
- Alert delivery settings are stored encrypted in the database

## Future Enhancements

Potential improvements:
- Real-time price streaming via WebSocket
- Advanced sentiment analysis using AI models
- Portfolio rebalancing recommendations
- Tax loss harvesting alerts
- Integration with brokerage APIs for automatic sync
- Mobile push notifications
- Historical performance charts
