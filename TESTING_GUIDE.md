# FIRE Sentinel - Testing Guide

Complete guide for testing the FIRE Sentinel application after installation.

## Table of Contents

1. [Pre-Testing Setup](#pre-testing-setup)
2. [Functional Testing](#functional-testing)
3. [Integration Testing](#integration-testing)
4. [Performance Testing](#performance-testing)
5. [Security Testing](#security-testing)
6. [Automated Testing](#automated-testing)
7. [Troubleshooting Tests](#troubleshooting-tests)

---

## Pre-Testing Setup

### 1. Verify Services Are Running

```bash
# Check Docker services
docker-compose ps

# Expected output:
# postgres - Up
# backend  - Up
# frontend - Up
```

### 2. Check Service Health

```bash
# Backend health
curl http://localhost:3001/api/auth/me

# Frontend access
curl http://localhost:5173

# Database connection
docker-compose exec postgres psql -U postgres -d fire_sentinel -c "SELECT 1;"
```

### 3. Review Logs

```bash
# Check for errors
docker-compose logs | grep -i error

# Watch live logs
docker-compose logs -f
```

---

## Functional Testing

### Test 1: Authentication

#### 1.1 Login Test

**Steps**:
1. Open browser to `http://localhost:5173`
2. Enter credentials:
   - Email: `admin@fire-sentinel.local`
   - Password: `admin123`
3. Click "Login"

**Expected Result**:
- ✅ Redirects to Dashboard
- ✅ Shows welcome message
- ✅ Displays user menu

**API Test**:
```bash
# Login via API
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@fire-sentinel.local","password":"admin123"}'

# Expected: Returns JWT token
```

#### 1.2 Logout Test

**Steps**:
1. Click user menu (top right)
2. Click "Logout"

**Expected Result**:
- ✅ Redirects to login page
- ✅ Shows logout success message
- ✅ Cannot access protected pages

#### 1.3 Registration Test

**Steps**:
1. Go to login page
2. Click "Register" or "Sign Up"
3. Enter new user details:
   - Email: `test@example.com`
   - Password: `TestPassword123!`
   - Name: `Test User`
4. Click "Register"

**Expected Result**:
- ✅ Account created successfully
- ✅ Automatically logged in
- ✅ Redirects to Dashboard

**API Test**:
```bash
# Register via API
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test2@example.com","password":"TestPass123!","name":"Test User 2"}'

# Expected: Returns JWT token and user data
```

#### 1.4 Password Change Test

**Steps**:
1. Login as admin
2. Go to Settings page
3. Change password to new secure password
4. Logout
5. Login with new password

**Expected Result**:
- ✅ Password updated successfully
- ✅ Old password no longer works
- ✅ New password works

---

### Test 2: Portfolio Management

#### 2.1 Create Account

**Steps**:
1. Navigate to Accounts page
2. Click "Add Account"
3. Enter details:
   - Name: `Test Brokerage`
   - Description: `Test account for verification`
4. Click "Save"

**Expected Result**:
- ✅ Account created
- ✅ Shows in accounts list
- ✅ Success notification displayed

**API Test**:
```bash
# Get auth token first (from login response)
TOKEN="your-jwt-token-here"

# Create account
curl -X POST http://localhost:3001/api/accounts \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"API Test Account","description":"Created via API"}'

# Expected: Returns account object with ID
```

#### 2.2 Add Stock

**Steps**:
1. Open account details
2. Click "Add Stock"
3. Enter stock details:
   - Symbol: `AAPL`
   - Quantity: `10`
   - Bought Price: `150.00`
   - Target Profit: `20%`
   - Stop Loss: `10%`
4. Click "Save"

**Expected Result**:
- ✅ Stock added to account
- ✅ Shows in portfolio
- ✅ Calculations are correct

**API Test**:
```bash
# Add stock
curl -X POST http://localhost:3001/api/stocks \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "account_id":"account-id-here",
    "symbol":"AAPL",
    "quantity":10,
    "bought_price":150.00,
    "target_profit_percentage":20,
    "stop_loss_percentage":10
  }'

# Expected: Returns stock object
```

#### 2.3 Update Stock

**Steps**:
1. Click "Edit" on a stock
2. Change quantity to `15`
3. Click "Save"

**Expected Result**:
- ✅ Stock updated
- ✅ Portfolio recalculated
- ✅ Shows updated values

#### 2.4 Delete Stock

**Steps**:
1. Click "Delete" on a stock
2. Confirm deletion

**Expected Result**:
- ✅ Stock removed
- ✅ Portfolio recalculated
- ✅ Confirmation message shown

#### 2.5 Portfolio Calculations

**Verify**:
- ✅ Current Value = Quantity × Current Price
- ✅ Cost Basis = Quantity × Bought Price
- ✅ Profit/Loss = Current Value - Cost Basis
- ✅ Profit/Loss % = (Profit/Loss / Cost Basis) × 100
- ✅ Total portfolio value is sum of all stocks

---

### Test 3: Price Monitoring

#### 3.1 Manual Price Refresh

**Steps**:
1. Go to Dashboard
2. Click "Refresh Prices" button
3. Wait for completion

**Expected Result**:
- ✅ Loading indicator shows
- ✅ Prices update
- ✅ Success message displayed
- ✅ Alerts generated if thresholds met

**API Test**:
```bash
# Trigger price monitor
curl -X POST http://localhost:3001/api/jobs/price-monitor \
  -H "Authorization: Bearer $TOKEN"

# Expected: Job executes successfully
```

#### 3.2 Automatic Price Monitoring

**Steps**:
1. Go to Settings
2. Set price check frequency to 1 minute
3. Save settings
4. Wait 1 minute
5. Check backend logs

**Expected Result**:
- ✅ Job runs automatically
- ✅ Prices update
- ✅ Logs show execution

**Log Check**:
```bash
# Watch for price monitor execution
docker-compose logs -f backend | grep "Price monitor"

# Expected: See "Price monitor started" and "Price monitor completed"
```

#### 3.3 Price Alert Triggers

**Steps**:
1. Add stock with current price $100
2. Set target profit at 20% (target: $120)
3. Manually update price to $125
4. Check alerts

**Expected Result**:
- ✅ Alert generated
- ✅ Shows in Alerts page
- ✅ Notification sent (if configured)

---

### Test 4: News Monitoring

#### 4.1 Manual News Refresh

**Steps**:
1. Go to News page
2. Click "Refresh News" button
3. Wait for completion

**Expected Result**:
- ✅ Loading indicator shows
- ✅ News articles appear
- ✅ Sentiment labels displayed
- ✅ Success message shown

**API Test**:
```bash
# Trigger news monitor
curl -X POST http://localhost:3001/api/jobs/news-monitor \
  -H "Authorization: Bearer $TOKEN"

# Expected: Job executes successfully
```

#### 4.2 News Filtering

**Steps**:
1. Go to News page
2. Filter by symbol (e.g., AAPL)
3. Filter by sentiment (e.g., Negative)

**Expected Result**:
- ✅ Shows only matching news
- ✅ Filters work correctly
- ✅ Can clear filters

#### 4.3 Sentiment Analysis

**Verify**:
- ✅ Each article has sentiment score
- ✅ Sentiment label (Positive/Neutral/Negative)
- ✅ Sentiment badge color matches label
- ✅ Negative sentiment triggers alerts

---

### Test 5: Custom Price Alerts

#### 5.1 Create Price Alert

**Steps**:
1. Go to stock details
2. Click "Add Price Alert"
3. Enter:
   - Target Price: `200.00`
   - Direction: `Above`
4. Click "Save"

**Expected Result**:
- ✅ Alert created
- ✅ Shows in price alerts list
- ✅ Status is "Active"

**API Test**:
```bash
# Create price alert
curl -X POST http://localhost:3001/api/price-alerts \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "stock_id":"stock-id-here",
    "symbol":"AAPL",
    "target_price":200.00,
    "direction":"above",
    "enabled":true
  }'

# Expected: Returns price alert object
```

#### 5.2 Trigger Price Alert

**Steps**:
1. Create alert with target $150 (above)
2. Update stock price to $155
3. Run price monitor
4. Check alerts

**Expected Result**:
- ✅ Alert triggered
- ✅ Status changes to "Triggered"
- ✅ Notification sent
- ✅ Shows in Alerts page

#### 5.3 Reset Price Alert

**Steps**:
1. Find triggered alert
2. Click "Reset"

**Expected Result**:
- ✅ Status back to "Active"
- ✅ Can trigger again
- ✅ Success message shown

#### 5.4 Disable/Enable Alert

**Steps**:
1. Toggle alert enabled/disabled

**Expected Result**:
- ✅ Status updates
- ✅ Disabled alerts don't trigger
- ✅ Can re-enable

---

### Test 6: Settings Configuration

#### 6.1 Update Monitoring Frequencies

**Steps**:
1. Go to Settings
2. Change price check frequency to 10 minutes
3. Change news check frequency to 20 minutes
4. Save

**Expected Result**:
- ✅ Settings saved
- ✅ Jobs run at new frequencies
- ✅ Success message shown

#### 6.2 Configure API Keys

**Steps**:
1. Go to Settings
2. Add Alpha Vantage API key
3. Add OpenAI/Anthropic/Google API key
4. Save

**Expected Result**:
- ✅ Keys saved securely
- ✅ Price monitoring uses API
- ✅ Sentiment analysis works

#### 6.3 Configure Alert Channels

**Steps**:
1. Enable email alerts
2. Enter email address
3. Enable Slack alerts
4. Enter webhook URL
5. Save

**Expected Result**:
- ✅ Settings saved
- ✅ Alerts sent to configured channels
- ✅ Test notifications work

---

## Integration Testing

### Test 7: End-to-End Workflow

**Complete User Journey**:

1. **Setup**:
   - Register new user
   - Login
   - Change password

2. **Portfolio Setup**:
   - Create brokerage account
   - Add 3-5 stocks
   - Set profit targets and stop losses

3. **Monitoring**:
   - Configure API keys
   - Set monitoring frequencies
   - Refresh prices manually
   - Refresh news manually

4. **Alerts**:
   - Create custom price alerts
   - Wait for automatic monitoring
   - Verify alerts are generated
   - Check alert notifications

5. **Management**:
   - Update stock quantities
   - Delete old stocks
   - Add new stocks
   - Export portfolio data

**Expected Result**:
- ✅ All steps complete without errors
- ✅ Data persists across sessions
- ✅ Calculations are accurate
- ✅ Alerts work correctly

---

## Performance Testing

### Test 8: Load Testing

#### 8.1 Multiple Stocks

**Steps**:
1. Add 50+ stocks to portfolio
2. Refresh prices
3. Navigate between pages

**Expected Result**:
- ✅ Page loads in < 2 seconds
- ✅ Price refresh completes in < 30 seconds
- ✅ No UI lag or freezing

#### 8.2 Large Alert History

**Steps**:
1. Generate 100+ alerts
2. Navigate to Alerts page
3. Filter and search alerts

**Expected Result**:
- ✅ Pagination works
- ✅ Filters are fast
- ✅ No performance degradation

#### 8.3 Concurrent Users

**Steps**:
1. Login from multiple browsers
2. Perform actions simultaneously

**Expected Result**:
- ✅ No conflicts
- ✅ Data consistency maintained
- ✅ No race conditions

---

## Security Testing

### Test 9: Authentication Security

#### 9.1 Unauthorized Access

**Test**:
```bash
# Try accessing protected endpoint without token
curl http://localhost:3001/api/accounts

# Expected: 401 Unauthorized
```

#### 9.2 Invalid Token

**Test**:
```bash
# Try with invalid token
curl http://localhost:3001/api/accounts \
  -H "Authorization: Bearer invalid-token"

# Expected: 401 Unauthorized
```

#### 9.3 Expired Token

**Test**:
1. Login and get token
2. Wait for token expiration (7 days)
3. Try using expired token

**Expected Result**:
- ✅ Returns 401 Unauthorized
- ✅ Redirects to login

#### 9.4 SQL Injection

**Test**:
```bash
# Try SQL injection in login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@fire-sentinel.local","password":"admin123 OR 1=1"}'

# Expected: Login fails, no SQL injection
```

#### 9.5 XSS Prevention

**Test**:
1. Try adding stock with name: `<script>alert('XSS')</script>`
2. View stock in UI

**Expected Result**:
- ✅ Script not executed
- ✅ Shows as plain text
- ✅ No XSS vulnerability

---

## Automated Testing

### Test 10: API Testing with curl

Create a test script `test-api.sh`:

```bash
#!/bin/bash

API_URL="http://localhost:3001/api"
EMAIL="admin@fire-sentinel.local"
PASSWORD="admin123"

echo "=== Testing FIRE Sentinel API ==="

# Test 1: Login
echo "Test 1: Login"
RESPONSE=$(curl -s -X POST $API_URL/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")

TOKEN=$(echo $RESPONSE | jq -r '.token')

if [ "$TOKEN" != "null" ]; then
  echo "✅ Login successful"
else
  echo "❌ Login failed"
  exit 1
fi

# Test 2: Get accounts
echo "Test 2: Get accounts"
RESPONSE=$(curl -s $API_URL/accounts \
  -H "Authorization: Bearer $TOKEN")

if [ $? -eq 0 ]; then
  echo "✅ Get accounts successful"
else
  echo "❌ Get accounts failed"
fi

# Test 3: Create account
echo "Test 3: Create account"
RESPONSE=$(curl -s -X POST $API_URL/accounts \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Account","description":"Automated test"}')

ACCOUNT_ID=$(echo $RESPONSE | jq -r '.id')

if [ "$ACCOUNT_ID" != "null" ]; then
  echo "✅ Create account successful"
else
  echo "❌ Create account failed"
fi

# Test 4: Get stocks
echo "Test 4: Get stocks"
RESPONSE=$(curl -s $API_URL/stocks \
  -H "Authorization: Bearer $TOKEN")

if [ $? -eq 0 ]; then
  echo "✅ Get stocks successful"
else
  echo "❌ Get stocks failed"
fi

# Test 5: Get alerts
echo "Test 5: Get alerts"
RESPONSE=$(curl -s $API_URL/alerts \
  -H "Authorization: Bearer $TOKEN")

if [ $? -eq 0 ]; then
  echo "✅ Get alerts successful"
else
  echo "❌ Get alerts failed"
fi

# Test 6: Get news
echo "Test 6: Get news"
RESPONSE=$(curl -s $API_URL/news \
  -H "Authorization: Bearer $TOKEN")

if [ $? -eq 0 ]; then
  echo "✅ Get news successful"
else
  echo "❌ Get news failed"
fi

# Test 7: Get settings
echo "Test 7: Get settings"
RESPONSE=$(curl -s $API_URL/settings \
  -H "Authorization: Bearer $TOKEN")

if [ $? -eq 0 ]; then
  echo "✅ Get settings successful"
else
  echo "❌ Get settings failed"
fi

echo "=== All tests completed ==="
```

Run tests:
```bash
chmod +x test-api.sh
./test-api.sh
```

---

## Troubleshooting Tests

### Common Test Failures

#### Test Fails: Services Not Running

**Solution**:
```bash
docker-compose ps
docker-compose up -d
```

#### Test Fails: Database Not Ready

**Solution**:
```bash
docker-compose logs postgres | grep "ready to accept connections"
# Wait until you see the message
```

#### Test Fails: Port Conflicts

**Solution**:
```bash
lsof -i :5173
lsof -i :3001
lsof -i :5432
kill -9 <PID>
```

#### Test Fails: Authentication Issues

**Solution**:
```bash
# Reset admin password
docker-compose exec postgres psql -U postgres -d fire_sentinel -c "
UPDATE users 
SET password_hash = '\$2b\$10\$...' 
WHERE email = 'admin@fire-sentinel.local';
"
```

#### Test Fails: API Errors

**Solution**:
```bash
# Check backend logs
docker-compose logs backend | tail -50

# Restart backend
docker-compose restart backend
```

---

## Test Results Documentation

### Create Test Report

Document your test results:

```markdown
# Test Report - FIRE Sentinel

**Date**: [Date]
**Version**: 8.0
**Tester**: [Your Name]

## Summary
- Total Tests: 50
- Passed: 48
- Failed: 2
- Skipped: 0

## Failed Tests
1. Test 3.3 - Price Alert Triggers
   - Issue: Alert not generated
   - Reason: API key not configured
   - Resolution: Added API key, retest passed

2. Test 4.3 - Sentiment Analysis
   - Issue: Sentiment score null
   - Reason: OpenAI API key missing
   - Resolution: Added API key, retest passed

## Performance Metrics
- Average page load: 1.2s
- Price refresh time: 15s (50 stocks)
- API response time: 120ms average

## Recommendations
- All critical tests passed
- Application ready for production
- Monitor scheduled jobs in production
```

---

## Continuous Testing

### Daily Health Check

Run this daily:

```bash
#!/bin/bash
echo "=== Daily Health Check ==="

# Check services
docker-compose ps

# Check logs for errors
docker-compose logs --since 24h | grep -i error

# Check database size
docker-compose exec postgres psql -U postgres -d fire_sentinel -c "
SELECT pg_size_pretty(pg_database_size('fire_sentinel'));
"

# Check API health
curl -s http://localhost:3001/api/auth/me

echo "=== Health check complete ==="
```

---

## Support

For testing issues:

1. Review logs: `docker-compose logs -f`
2. Check service status: `docker-compose ps`
3. Verify configuration: Check `.env` files
4. Restart services: `docker-compose restart`
5. Open GitHub issue with test details

---

**Version**: 8.0 (Docker Migration)
**Last Updated**: May 2026
