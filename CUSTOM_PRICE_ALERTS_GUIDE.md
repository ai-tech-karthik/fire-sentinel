# Custom Price Alerts Guide

## Overview

Custom Price Alerts allow you to set specific target prices for your stocks and receive notifications when those prices are reached. Unlike percentage-based profit target and stop-loss alerts, custom price alerts let you monitor exact price levels that are important to your investment strategy.

## Key Features

### Multiple Alerts Per Stock
- Set as many price alerts as you need for each stock
- Monitor multiple price levels simultaneously
- Each alert operates independently

### Directional Triggers
- **Above (↑)**: Alert when price reaches or exceeds your target
- **Below (↓)**: Alert when price falls to or below your target

### Alert Management
- **Enable/Disable**: Turn alerts on or off without deleting them
- **Edit**: Modify target price, direction, or notes anytime
- **Delete**: Remove alerts you no longer need
- **Re-enable**: Reactivate triggered alerts to monitor the same price again

### Automatic Triggering
- Alerts automatically disable after triggering to prevent repeated notifications
- View triggered alerts with timestamp in the Portfolio page
- Re-enable triggered alerts with one click

## How to Use Custom Price Alerts

### Creating a Price Alert

1. **Navigate to Portfolio Management**:
   - Click "Portfolio" in the sidebar menu

2. **Expand Stock Alerts**:
   - Find the stock you want to monitor
   - Click the chevron icon (>) in the Actions column
   - The price alerts section will expand below the stock row

3. **Add New Alert**:
   - Click the "Add Alert" button
   - Fill in the alert details:
     - **Target Price**: Enter the specific price (e.g., 150.00)
     - **Alert When Price**: Select direction
       - "Reaches or exceeds target (↑)" for upward alerts
       - "Falls to or below target (↓)" for downward alerts
     - **Note** (Optional): Add a reminder about why you set this alert
   - Click "Create"

### Managing Existing Alerts

**Enable/Disable Alert**:
- Click the bell icon to toggle the alert on or off
- Disabled alerts won't trigger but remain saved for future use

**Edit Alert**:
- Click the edit icon (pencil)
- Modify target price, direction, or note
- Click "Update" to save changes

**Delete Alert**:
- Click the trash icon
- Confirm deletion in the dialog

**Re-enable Triggered Alert**:
- Triggered alerts appear in the "Triggered Alerts" section
- Click the rotate icon to re-enable
- The alert will become active again with the same settings

## Use Cases

### Resistance Levels
Set upward alerts at key resistance levels to know when a stock breaks through:
```
Stock: AAPL
Current Price: $145.00
Alert: $150.00 (Above) - "Breaking resistance"
```

### Support Levels
Set downward alerts at support levels to monitor potential breakdowns:
```
Stock: TSLA
Current Price: $220.00
Alert: $200.00 (Below) - "Support level breach"
```

### Entry Points
Monitor specific entry prices for stocks you want to buy:
```
Stock: MSFT
Current Price: $380.00
Alert: $350.00 (Below) - "Good entry point"
```

### Exit Points
Set alerts for your target exit prices:
```
Stock: NVDA
Current Price: $450.00
Alert: $500.00 (Above) - "Take profit target"
```

### Round Numbers
Monitor psychologically important round numbers:
```
Stock: GOOGL
Current Price: $138.00
Alert: $150.00 (Above) - "Round number resistance"
```

### Earnings Reactions
Set alerts around earnings announcement dates:
```
Stock: AMZN
Current Price: $145.00
Alert 1: $160.00 (Above) - "Positive earnings reaction"
Alert 2: $130.00 (Below) - "Negative earnings reaction"
```

## Alert Behavior

### Triggering Conditions

**Above (↑) Alerts**:
- Triggers when: `current_price >= target_price`
- Example: Alert at $100, triggers when price reaches $100.00 or higher

**Below (↓) Alerts**:
- Triggers when: `current_price <= target_price`
- Example: Alert at $50, triggers when price falls to $50.00 or lower

### After Triggering

1. **Notification Sent**: Alert is sent through all enabled channels (Email, Slack, SMS)
2. **Alert Disabled**: The alert is automatically disabled to prevent repeated notifications
3. **Timestamp Recorded**: The trigger time is saved for your records
4. **Moved to Triggered Section**: Alert appears in "Triggered Alerts" section
5. **Can Be Re-enabled**: You can reactivate the alert if you want to monitor the same price again

### Monitoring Frequency

Custom price alerts are checked at the same frequency as your price monitoring setting:
- Default: Every 5 minutes (300 seconds)
- Configurable in Settings > Monitoring Configuration
- More frequent checks = faster alert response but higher API usage

## Best Practices

### 1. Use Meaningful Notes
Add notes to remind yourself why you set each alert:
- ✅ "Breaking 52-week high"
- ✅ "Support from last earnings"
- ✅ "Analyst target price"
- ❌ "Alert 1" (not descriptive)

### 2. Set Realistic Targets
- Base alerts on technical analysis, support/resistance, or fundamental targets
- Avoid setting too many alerts too close together
- Consider current volatility when setting alert distances

### 3. Combine with Percentage Alerts
Use both types of alerts for comprehensive monitoring:
- **Percentage Alerts**: For general profit/loss management
- **Custom Price Alerts**: For specific technical or strategic levels

### 4. Review and Update Regularly
- Remove outdated alerts
- Adjust targets as market conditions change
- Re-enable triggered alerts if the price level remains relevant

### 5. Manage Alert Volume
- Too many alerts can lead to notification fatigue
- Focus on the most important price levels
- Use enable/disable to temporarily pause alerts without deleting them

## Differences from Percentage-Based Alerts

| Feature | Custom Price Alerts | Percentage Alerts |
|---------|-------------------|-------------------|
| **Trigger** | Specific price level | Percentage gain/loss |
| **Quantity** | Multiple per stock | One profit + one loss per stock |
| **Management** | Individual enable/disable | Always active |
| **Configuration** | Portfolio page | Stock creation/edit |
| **Use Case** | Technical levels, targets | General profit/loss management |
| **Auto-disable** | Yes, after triggering | No, remains active |

## Troubleshooting

### Alert Not Triggering

**Check Alert Status**:
- Ensure alert is enabled (bell icon should be solid, not crossed out)
- Verify alert hasn't already been triggered

**Verify Price Monitoring**:
- Go to Dashboard and click "Refresh Prices"
- Check if current price is being updated
- Verify API keys are configured in Settings

**Check Direction**:
- "Above" alerts only trigger when price goes up
- "Below" alerts only trigger when price goes down
- Make sure direction matches your intention

### Alert Triggered Too Early/Late

**Price Monitoring Frequency**:
- Alerts are checked at your configured monitoring frequency
- Default is 5 minutes, so there may be a delay
- Reduce frequency in Settings for faster response (increases API usage)

**Price Data Source**:
- Prices come from Alpha Vantage or Yahoo Finance
- Real-time data may have slight delays
- Different sources may report slightly different prices

### Missing Notifications

**Check Alert Delivery Settings**:
- Go to Settings > Alert Delivery Configuration
- Ensure at least one channel is enabled
- Verify email address, Slack webhook, or phone number is correct

**Check Alert History**:
- Go to Alerts page
- Filter by "Custom Price Alert" type
- Verify the alert was actually triggered

## FAQ

**Q: Can I set multiple alerts at the same price?**
A: Yes, but it's not recommended. Each alert will trigger independently, sending duplicate notifications.

**Q: What happens if I delete a stock with active price alerts?**
A: All price alerts for that stock are automatically deleted (cascade delete).

**Q: Can I set alerts for stocks I don't own?**
A: Currently, alerts can only be set for stocks in your portfolio. Add the stock with quantity 0 if you want to monitor it without owning it.

**Q: Do custom price alerts affect my profit/loss calculations?**
A: No, custom price alerts are independent and don't affect portfolio calculations.

**Q: Can I export my price alerts?**
A: Not currently, but this feature may be added in a future update.

**Q: How many price alerts can I set?**
A: There's no hard limit, but we recommend keeping it manageable (5-10 per stock maximum).

**Q: Do alerts work when the app is closed?**
A: Yes, alerts are monitored by Edge Functions that run independently of the app being open.

**Q: Can I set alerts for after-hours prices?**
A: Alerts trigger based on the latest available price data. After-hours prices may not be immediately available depending on your data source.

## Advanced Tips

### Bracket Orders Simulation
Simulate bracket orders by setting both upward and downward alerts:
```
Stock: AAPL @ $150
Alert 1: $160 (Above) - "Take profit"
Alert 2: $140 (Below) - "Stop loss"
```

### Trailing Stop Simulation
Manually adjust alerts as price moves in your favor:
```
Initial: $100 entry, $90 stop (Below)
Price hits $110: Update stop to $100 (Below)
Price hits $120: Update stop to $110 (Below)
```

### Volatility Monitoring
Set alerts at multiple levels to gauge volatility:
```
Current: $100
Alerts: $95, $90, $85 (Below) - Track downside
Alerts: $105, $110, $115 (Above) - Track upside
```

### Earnings Straddle
Set alerts on both sides before earnings:
```
Current: $100
Alert 1: $110 (Above) - "Positive surprise"
Alert 2: $90 (Below) - "Negative surprise"
```

## Support

For issues with custom price alerts:
1. Check this guide for common solutions
2. Verify your Settings configuration
3. Review Edge Function logs in Supabase Dashboard
4. Check the Alerts History page to see if alerts are triggering

## Future Enhancements

Potential features for future releases:
- Alert templates for common patterns
- Bulk alert creation
- Alert groups and categories
- Price alert charts and visualization
- Alert performance tracking
- Conditional alerts (e.g., "alert if price crosses $100 AND volume > 1M")
- Alert expiration dates
- Recurring alerts
