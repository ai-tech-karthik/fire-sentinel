# FIRE Sentinel - API Configuration Update

## Summary of Changes

This update adds comprehensive API key configuration capabilities directly through the Settings page, eliminating the need to manage environment variables or redeploy Edge Functions when changing API credentials.

## New Features

### 1. API Configuration in Settings Page

**Alpha Vantage API Key**:
- Configure your Alpha Vantage API key for reliable stock price data
- Get free API key from https://www.alphavantage.co/support/#api-key
- 5 calls/minute, 500 calls/day on free tier

**Yahoo Finance API Key**:
- Optional configuration for Yahoo Finance API
- Used as automatic fallback when Alpha Vantage is unavailable
- No key required for basic usage

**Gen AI Integration**:
- Select from multiple AI platforms: OpenAI, Anthropic Claude, or Google Gemini
- Configure API key for chosen platform
- Enhanced sentiment analysis with AI-powered insights
- Automatic fallback to built-in analyzer if AI service unavailable

### 2. Enhanced Sentiment Analysis

**AI-Powered Analysis** (when configured):
- **OpenAI GPT-3.5-turbo**: Advanced language understanding
- **Anthropic Claude 3 Haiku**: Cost-effective and accurate
- **Google Gemini Pro**: Free tier available

**Benefits**:
- More accurate sentiment scoring
- Better context understanding
- Improved detection of sarcasm and complex language
- Enhanced analysis of financial terminology

**Fallback Behavior**:
- Automatically uses built-in keyword analyzer if AI unavailable
- No interruption to service

### 3. Secure API Key Management

**Security Features**:
- Password-masked input fields with show/hide toggle
- Server-side only storage (never exposed to client)
- Keys stored in Supabase database
- Edge Functions read keys at runtime

**User Experience**:
- Easy key rotation without redeployment
- Visual feedback for key visibility
- Direct links to API provider registration pages
- Clear instructions for each API service

## Technical Implementation

### Database Changes
- Added 4 new settings keys:
  - `api_alpha_vantage_key`: Alpha Vantage API key
  - `api_yahoo_finance_key`: Yahoo Finance API key
  - `api_genai_platform`: Selected AI platform (openai/anthropic/google/none)
  - `api_genai_key`: Gen AI service API key

### Edge Function Updates

**price-monitor**:
- Reads Alpha Vantage key from settings table
- Falls back to environment variable if not set in database
- Maintains backward compatibility

**news-monitor**:
- Reads Gen AI platform and key from settings
- Implements AI-powered sentiment analysis for OpenAI, Anthropic, and Google
- Falls back to built-in analyzer if AI not configured or fails
- Maintains existing functionality

### Frontend Changes

**Settings Page**:
- New "API Configuration" section at top of page
- Password-type inputs with eye icon toggle for visibility
- Platform selector dropdown for Gen AI services
- Contextual help text and links for each API
- Integrated with existing save functionality

**Type Definitions**:
- Updated `SettingsFormData` interface with new API key fields
- Updated API service to handle new settings

## Usage Instructions

### For Users

1. **Navigate to Settings**:
   - Click "Settings" in the sidebar menu

2. **Configure Alpha Vantage** (Recommended):
   - Get free API key from Alpha Vantage website
   - Enter key in "Alpha Vantage API Key" field
   - This enables reliable price updates

3. **Configure Gen AI** (Optional):
   - Choose your preferred AI platform from dropdown
   - Get API key from selected provider
   - Enter key in the corresponding field
   - This enables enhanced sentiment analysis

4. **Save Settings**:
   - Click "Save Settings" button at bottom of page
   - Keys are immediately available to Edge Functions

5. **Test Configuration**:
   - Go to Dashboard and click "Refresh Prices"
   - Go to News page and click "Refresh News"
   - Verify data updates successfully

### For Developers

**Reading API Keys in Edge Functions**:
```typescript
// Fetch settings from database
const { data: settingsData } = await supabase
  .from('settings')
  .select('*');

// Convert to map
const settingsMap = settingsData.reduce((acc, s) => {
  acc[s.key] = s.value;
  return acc;
}, {});

// Access keys
const alphaVantageKey = settingsMap.api_alpha_vantage_key;
const genAiPlatform = settingsMap.api_genai_platform;
const genAiKey = settingsMap.api_genai_key;
```

**AI Sentiment Analysis**:
```typescript
// Check if AI is configured
const useAI = genAiPlatform !== 'none' && genAiKey.length > 0;

// Perform sentiment analysis
let sentiment;
if (useAI) {
  const aiSentiment = await analyzeSentimentWithAI(text, genAiPlatform, genAiKey);
  sentiment = aiSentiment || analyzeSentiment(text); // Fallback
} else {
  sentiment = analyzeSentiment(text); // Built-in analyzer
}
```

## Documentation Updates

### New Documents
- **API_CONFIGURATION_GUIDE.md**: Comprehensive guide for API setup and management
  - Step-by-step configuration instructions
  - Security best practices
  - Cost estimation for each service
  - Troubleshooting guide
  - FAQ section

### Updated Documents
- **README.md**: Updated configuration steps to include API keys
- **EDGE_FUNCTIONS.md**: Updated to reflect database-based API key management

## Benefits

### For Users
1. **Easier Configuration**: No need to access Supabase dashboard or environment variables
2. **Instant Updates**: Change API keys without redeploying Edge Functions
3. **Better Insights**: AI-powered sentiment analysis provides more accurate results
4. **Flexibility**: Choose AI platform based on cost, accuracy, or free tier availability
5. **Transparency**: Clear documentation and in-app guidance

### For Developers
1. **Maintainability**: Centralized API key management
2. **Flexibility**: Easy to add new API providers
3. **Security**: Keys never exposed to client-side code
4. **Backward Compatibility**: Still supports environment variables

## Migration Notes

### Existing Users
- No action required - existing environment variables still work
- Recommended: Move API keys to Settings page for easier management
- Database settings take precedence over environment variables

### New Users
- Configure all API keys through Settings page
- No need to set environment variables
- Follow API_CONFIGURATION_GUIDE.md for detailed instructions

## Future Enhancements

Potential improvements for future releases:
1. **Encryption at Rest**: Encrypt API keys in database
2. **Key Rotation**: Automated key rotation with notifications
3. **Usage Analytics**: Track API usage and costs
4. **Rate Limiting**: Built-in rate limit management
5. **Key Validation**: Test API keys before saving
6. **Audit Logging**: Track when keys are accessed or changed
7. **Multiple Keys**: Support for multiple keys per service (rotation)
8. **Cost Tracking**: Monitor and alert on API costs

## Testing Checklist

- [x] Database migration successful
- [x] Settings page displays new fields
- [x] API keys can be saved and retrieved
- [x] Show/hide toggle works for password fields
- [x] price-monitor reads keys from database
- [x] news-monitor reads keys from database
- [x] AI sentiment analysis works with OpenAI
- [x] AI sentiment analysis works with Anthropic
- [x] AI sentiment analysis works with Google
- [x] Fallback to built-in analyzer works
- [x] Backward compatibility with environment variables
- [x] Lint passes without errors
- [x] Documentation updated

## Support

For questions or issues:
1. Review API_CONFIGURATION_GUIDE.md
2. Check Edge Function logs in Supabase Dashboard
3. Verify API keys are correct and active
4. Ensure API provider services are operational

## Version

- **Release Date**: 2026-05-11
- **Version**: 1.1.0
- **Breaking Changes**: None (backward compatible)
