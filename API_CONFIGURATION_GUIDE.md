# API Configuration Guide

## Overview

FIRE Sentinel now supports configurable API keys directly through the Settings page. This allows you to easily manage your API credentials without needing to modify environment variables or redeploy Edge Functions.

## Supported APIs

### 1. Alpha Vantage (Stock Prices)
- **Purpose**: Primary source for real-time stock price data
- **Free Tier**: 5 calls/minute, 500 calls/day
- **Get API Key**: https://www.alphavantage.co/support/#api-key
- **Configuration**: Settings > API Configuration > Alpha Vantage API Key

### 2. Yahoo Finance (Stock Prices - Fallback)
- **Purpose**: Backup source when Alpha Vantage is unavailable
- **Free Tier**: No official limits (use responsibly)
- **API Key**: Optional for basic usage
- **Configuration**: Settings > API Configuration > Yahoo Finance API Key

### 3. Gen AI Services (Sentiment Analysis)

#### OpenAI (GPT-3.5/GPT-4)
- **Purpose**: AI-powered sentiment analysis
- **Model Used**: GPT-3.5-turbo
- **Get API Key**: https://platform.openai.com/api-keys
- **Pricing**: Pay-as-you-go (very affordable for sentiment analysis)
- **Configuration**: 
  1. Settings > API Configuration > Gen AI Platform > Select "OpenAI"
  2. Enter your OpenAI API key

#### Anthropic (Claude)
- **Purpose**: AI-powered sentiment analysis
- **Model Used**: Claude 3 Haiku
- **Get API Key**: https://console.anthropic.com/
- **Pricing**: Pay-as-you-go
- **Configuration**: 
  1. Settings > API Configuration > Gen AI Platform > Select "Anthropic"
  2. Enter your Anthropic API key

#### Google (Gemini)
- **Purpose**: AI-powered sentiment analysis
- **Model Used**: Gemini Pro
- **Get API Key**: https://makersuite.google.com/app/apikey
- **Pricing**: Free tier available
- **Configuration**: 
  1. Settings > API Configuration > Gen AI Platform > Select "Google"
  2. Enter your Google AI API key

## Configuration Steps

### Step 1: Obtain API Keys

1. **Alpha Vantage** (Required for best experience):
   - Visit https://www.alphavantage.co/support/#api-key
   - Fill out the form with your email
   - Receive API key instantly via email
   - Free tier: 5 calls/minute, 500 calls/day

2. **Gen AI Service** (Optional but recommended):
   
   **For OpenAI**:
   - Create account at https://platform.openai.com/
   - Go to API Keys section
   - Click "Create new secret key"
   - Copy and save the key securely
   - Add payment method (pay-as-you-go)
   
   **For Anthropic**:
   - Create account at https://console.anthropic.com/
   - Navigate to API Keys
   - Generate new API key
   - Copy and save the key securely
   
   **For Google**:
   - Visit https://makersuite.google.com/app/apikey
   - Sign in with Google account
   - Create API key
   - Copy and save the key securely

### Step 2: Configure in FIRE Sentinel

1. Open FIRE Sentinel application
2. Navigate to **Settings** page (sidebar menu)
3. Scroll to **API Configuration** section
4. Enter your API keys:
   - **Alpha Vantage API Key**: Paste your Alpha Vantage key
   - **Yahoo Finance API Key**: Leave empty (optional)
   - **Gen AI Platform**: Select your preferred AI service
   - **Gen AI API Key**: Paste your AI service key
5. Click **Save Settings**

### Step 3: Verify Configuration

1. Go to **Dashboard** page
2. Click **Refresh Prices** button
3. Verify that stock prices update successfully
4. Go to **News** page
5. Click **Refresh News** button
6. Check that news articles have sentiment scores

## API Key Security

### Best Practices

1. **Never Share API Keys**:
   - Keep your API keys confidential
   - Don't commit them to version control
   - Don't share them in screenshots or logs

2. **Rotate Keys Regularly**:
   - Change your API keys every 3-6 months
   - Immediately rotate if you suspect compromise

3. **Monitor Usage**:
   - Check your API provider dashboards regularly
   - Set up usage alerts if available
   - Watch for unexpected spikes in usage

4. **Use Separate Keys**:
   - Use different keys for development and production
   - Consider separate keys per application

### How Keys Are Stored

- **Database Storage**: API keys are stored in the Supabase `settings` table
- **Server-Side Only**: Keys are only accessed by Edge Functions (server-side)
- **Never Exposed**: Keys are never sent to the client browser
- **Password Fields**: Keys are hidden in the UI (use eye icon to reveal)

### Security Considerations

**Current Implementation**:
- Keys stored as plain text in database
- Only accessible via server-side Edge Functions
- Not exposed to client-side code

**Production Recommendations**:
- Implement encryption at rest for API keys
- Use Supabase Vault for sensitive data
- Implement key rotation policies
- Add audit logging for key access

## Troubleshooting

### Alpha Vantage Issues

**Problem**: "Rate limit exceeded" error
- **Cause**: Exceeded 5 calls/minute or 500 calls/day
- **Solution**: 
  - Wait for rate limit to reset
  - Increase monitoring frequency in Settings
  - System will automatically fall back to Yahoo Finance

**Problem**: "Invalid API key" error
- **Cause**: Incorrect or expired API key
- **Solution**: 
  - Verify key is copied correctly (no extra spaces)
  - Generate new key from Alpha Vantage
  - Update key in Settings

### Gen AI Issues

**Problem**: Sentiment analysis not working
- **Cause**: Invalid API key or service unavailable
- **Solution**: 
  - Verify API key is correct
  - Check API provider status page
  - System will fall back to built-in analyzer

**Problem**: High API costs
- **Cause**: Too many sentiment analysis requests
- **Solution**: 
  - Increase news check frequency in Settings
  - Limit number of stocks in portfolio
  - Consider using built-in analyzer (set platform to "None")

### Yahoo Finance Issues

**Problem**: Prices not updating
- **Cause**: Yahoo Finance API temporarily unavailable
- **Solution**: 
  - Wait a few minutes and try again
  - Ensure Alpha Vantage is configured as primary source

## Cost Estimation

### Alpha Vantage (Free Tier)
- **Cost**: $0
- **Limits**: 5 calls/minute, 500 calls/day
- **Sufficient For**: Up to 50 stocks with 5-minute updates

### OpenAI (GPT-3.5-turbo)
- **Cost**: ~$0.002 per sentiment analysis
- **Example**: 10 stocks × 10 news articles × 12 updates/day = $2.40/day
- **Recommendation**: Use for important portfolios or reduce update frequency

### Anthropic (Claude 3 Haiku)
- **Cost**: ~$0.00025 per sentiment analysis
- **Example**: 10 stocks × 10 news articles × 12 updates/day = $0.30/day
- **Recommendation**: Most cost-effective AI option

### Google (Gemini Pro)
- **Cost**: Free tier available, then pay-as-you-go
- **Example**: Generous free tier for personal use
- **Recommendation**: Good for getting started with AI features

## Recommendations

### For Small Portfolios (1-10 stocks)
- **Alpha Vantage**: Free tier sufficient
- **Gen AI**: Google Gemini (free tier)
- **Update Frequency**: 5 minutes (prices), 10 minutes (news)

### For Medium Portfolios (10-30 stocks)
- **Alpha Vantage**: Free tier sufficient with careful frequency management
- **Gen AI**: Anthropic Claude (most cost-effective)
- **Update Frequency**: 10 minutes (prices), 30 minutes (news)

### For Large Portfolios (30+ stocks)
- **Alpha Vantage**: Consider premium tier or longer update intervals
- **Gen AI**: Built-in analyzer or Anthropic Claude
- **Update Frequency**: 15-30 minutes (prices), 1 hour (news)

## FAQ

**Q: Do I need all API keys?**
A: No. Only Alpha Vantage is strongly recommended. Gen AI is optional but provides better sentiment analysis.

**Q: Can I use the app without any API keys?**
A: Yes, but with limitations. The system will use Yahoo Finance for prices (less reliable) and built-in sentiment analyzer (less accurate).

**Q: Which Gen AI platform is best?**
A: For cost: Anthropic Claude. For free tier: Google Gemini. For quality: OpenAI GPT-4 (requires model change in code).

**Q: How often should I update my API keys?**
A: Rotate every 3-6 months or immediately if compromised.

**Q: Are my API keys safe?**
A: Keys are stored server-side only and never exposed to the browser. For production use, consider implementing encryption at rest.

**Q: Can I use different AI models?**
A: Yes, but requires code changes in the news-monitor Edge Function. Current implementation uses the most cost-effective models.

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Verify API keys are correct and active
3. Check API provider status pages
4. Review Edge Function logs in Supabase Dashboard

## Updates

This guide reflects the current implementation. Future updates may include:
- Encrypted API key storage
- Key rotation automation
- Usage analytics and cost tracking
- Support for additional AI providers
- Batch processing for cost optimization
