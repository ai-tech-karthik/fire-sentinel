# Custom Price Alerts Feature - Implementation Summary

## Overview

This document summarizes the implementation of the Custom Price Alerts feature for FIRE Sentinel, which allows users to set specific target prices for their stocks and receive notifications when those prices are reached.

## Feature Description

Custom Price Alerts complement the existing percentage-based profit target and stop-loss alerts by allowing users to monitor specific price levels. This is particularly useful for:
- Technical analysis (support/resistance levels)
- Round number psychology
- Analyst target prices
- Entry/exit points for trading strategies

## Implementation Details

### Database Schema

**New Table: `price_alerts`**
```sql
CREATE TABLE price_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stock_id uuid REFERENCES stocks(id) ON DELETE CASCADE,
  symbol text NOT NULL,
  target_price numeric(20, 2) NOT NULL CHECK (target_price > 0),
  direction text NOT NULL CHECK (direction IN ('above', 'below')),
  enabled boolean NOT NULL DEFAULT true,
  note text,
  triggered_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
```

**Indexes**:
- `idx_price_alerts_stock_id` on `stock_id`
- `idx_price_alerts_symbol` on `symbol`
- `idx_price_alerts_enabled` on `enabled`

**Updated Table: `alerts`**
- Added `custom_price` to alert_type enum

### Type Definitions

**New Interfaces** (`src/types/types.ts`):
```typescript
interface PriceAlert {
  id: string;
  stock_id?: string;
  symbol: string;
  target_price: number;
  direction: 'above' | 'below';
  enabled: boolean;
  note?: string;
  triggered_at?: string;
  created_at: string;
  updated_at: string;
}

interface PriceAlertFormData {
  stock_id?: string;
  symbol: string;
  target_price: number;
  direction: 'above' | 'below';
  note?: string;
}
```

**Updated Interface**:
- `Alert.alert_type` now includes `'custom_price'`

### API Services

**New API: `priceAlertsApi`** (`src/services/api.ts`):
- `getAll()`: Get all price alerts
- `getByStock(stockId)`: Get alerts for specific stock
- `getBySymbol(symbol)`: Get alerts for specific symbol
- `getEnabled()`: Get all enabled, non-triggered alerts
- `create(priceAlert)`: Create new price alert
- `update(id, priceAlert)`: Update existing alert
- `delete(id)`: Delete price alert
- `toggleEnabled(id, enabled)`: Enable/disable alert
- `markTriggered(id)`: Mark alert as triggered
- `resetTriggered(id)`: Re-enable triggered alert

### Edge Function Updates

**price-monitor** (`supabase/functions/price-monitor/index.ts`):
- Fetches all enabled, non-triggered price alerts
- Checks each alert against current stock prices
- Triggers alerts when conditions are met:
  - `direction === 'above'`: Triggers when `current_price >= target_price`
  - `direction === 'below'`: Triggers when `current_price <= target_price`
- Creates alert records in the `alerts` table
- Automatically disables triggered alerts
- Sends notifications through configured channels

### Frontend Components

**New Component: `PriceAlertsManager`** (`src/components/common/PriceAlertsManager.tsx`):
- Displays all price alerts for a stock
- Separates active and triggered alerts
- Provides UI for:
  - Creating new alerts
  - Editing existing alerts
  - Deleting alerts
  - Enabling/disabling alerts
  - Re-enabling triggered alerts
- Shows current price for context
- Displays alert direction with icons (↑ for above, ↓ for below)

**Updated Component: `Portfolio`** (`src/pages/Portfolio.tsx`):
- Added expandable row for each stock
- Integrated `PriceAlertsManager` component
- Added chevron icon to expand/collapse price alerts section
- Maintains expanded state for each stock

**Updated Component: `Alerts`** (`src/pages/Alerts.tsx`):
- Added `custom_price` to alert type filter
- Added bell icon for custom price alerts
- Added styling for custom price alert badges

### User Interface

**Portfolio Management Page**:
1. Stock table with expandable rows
2. Click chevron (>) to expand price alerts section
3. Price alerts section shows:
   - Active alerts with enable/disable toggle
   - Edit and delete buttons
   - Triggered alerts with re-enable option
   - "Add Alert" button to create new alerts

**Alert Dialog**:
- Target Price input (with current price reference)
- Direction selector (above/below)
- Optional note textarea
- Create/Update button

**Alert Display**:
- Direction icon (↑ or ↓)
- Target price
- Direction badge
- Optional note
- Action buttons (enable/disable, edit, delete)

**Triggered Alerts**:
- Grayed out appearance
- Timestamp of trigger
- Re-enable button (rotate icon)
- Delete button

### Alert Behavior

**Triggering**:
1. price-monitor Edge Function runs at configured frequency
2. Checks all enabled, non-triggered price alerts
3. Compares current price with target price based on direction
4. If condition met:
   - Creates alert record in `alerts` table
   - Disables the price alert
   - Records trigger timestamp
   - Sends notification through configured channels

**Notification Message**:
```
{symbol} has {reached or exceeded / fallen to or below} your target price of ${target_price}.
Current price: ${current_price}
{Note: {note}}
```

**Auto-disable**:
- Prevents repeated notifications for the same alert
- User can manually re-enable if they want to monitor the same price again

### Documentation

**New Documents**:
1. `CUSTOM_PRICE_ALERTS_GUIDE.md`: Comprehensive user guide
   - Feature overview
   - How-to instructions
   - Use cases and examples
   - Best practices
   - Troubleshooting
   - FAQ

**Updated Documents**:
1. `README.md`: Added custom price alerts to features list and getting started guide
2. Alert system section updated with custom price alerts

## User Workflow

### Creating a Price Alert

1. Navigate to Portfolio Management page
2. Find the stock to monitor
3. Click chevron icon (>) to expand price alerts
4. Click "Add Alert" button
5. Enter target price
6. Select direction (above or below)
7. Optionally add a note
8. Click "Create"

### Managing Alerts

**Enable/Disable**:
- Click bell icon to toggle
- Disabled alerts remain saved but won't trigger

**Edit**:
- Click edit icon (pencil)
- Modify target price, direction, or note
- Click "Update"

**Delete**:
- Click trash icon
- Confirm deletion

**Re-enable Triggered Alert**:
- Find alert in "Triggered Alerts" section
- Click rotate icon
- Alert becomes active again

### Receiving Notifications

1. Alert triggers when price condition is met
2. Notification sent through enabled channels:
   - Email
   - Slack
   - SMS
3. Alert appears in Alerts History page
4. Alert automatically disables to prevent spam

## Technical Considerations

### Performance

- Price alerts are checked during regular price monitoring cycle
- No additional API calls required
- Efficient database queries with proper indexes
- Cascade delete ensures cleanup when stocks are removed

### Scalability

- Multiple alerts per stock supported
- No hard limit on number of alerts
- Efficient filtering with database indexes
- Batch processing in Edge Function

### Data Integrity

- Foreign key constraint ensures alerts are deleted with stocks
- Check constraints validate direction and target price
- Timestamps track creation and updates
- Triggered timestamp records when alert fired

### User Experience

- Expandable rows keep interface clean
- Current price shown for context
- Visual indicators for direction (icons and badges)
- Separate sections for active and triggered alerts
- One-click enable/disable without deletion
- Confirmation dialogs prevent accidental deletion

## Testing Checklist

- [x] Database schema created successfully
- [x] Types and interfaces defined
- [x] API services implemented
- [x] Edge Function updated and deployed
- [x] Frontend components created
- [x] Portfolio page updated
- [x] Alerts page updated
- [x] Lint checks passed
- [x] Documentation created

## Future Enhancements

Potential improvements for future releases:

1. **Alert Templates**: Pre-defined alert patterns (e.g., "bracket order")
2. **Bulk Operations**: Create multiple alerts at once
3. **Alert Groups**: Organize alerts by strategy or category
4. **Visualization**: Chart showing price alerts on price history
5. **Performance Tracking**: Track alert accuracy and profitability
6. **Conditional Alerts**: Combine price with volume or other indicators
7. **Expiration Dates**: Auto-delete alerts after a certain date
8. **Recurring Alerts**: Re-enable automatically after triggering
9. **Alert Export**: Export alerts to CSV or JSON
10. **Mobile Notifications**: Push notifications for mobile devices

## Known Limitations

1. **Price Data Delay**: Alerts depend on price monitoring frequency (default 5 minutes)
2. **Data Source Accuracy**: Prices from Alpha Vantage/Yahoo Finance may have slight delays
3. **No After-Hours**: After-hours prices may not be immediately available
4. **Manual Re-enable**: Triggered alerts must be manually re-enabled
5. **No Conditional Logic**: Can't combine multiple conditions (e.g., price AND volume)

## Migration Notes

### For Existing Users

- No action required
- Existing percentage-based alerts continue to work
- Custom price alerts are optional
- No changes to existing functionality

### For New Users

- Custom price alerts available immediately
- Can be used alongside or instead of percentage-based alerts
- Full documentation available in CUSTOM_PRICE_ALERTS_GUIDE.md

## Support

For issues or questions:
1. Review CUSTOM_PRICE_ALERTS_GUIDE.md
2. Check Edge Function logs in Supabase Dashboard
3. Verify Settings configuration
4. Review Alerts History page

## Version Information

- **Feature Version**: 1.0
- **Release Date**: 2026-05-11
- **Breaking Changes**: None
- **Database Migration**: `create_price_alerts_table`
- **Edge Functions Updated**: `price-monitor`

## Contributors

- Implementation: AI Assistant
- Testing: User acceptance testing required
- Documentation: Complete

## Conclusion

The Custom Price Alerts feature provides users with precise control over price monitoring, complementing the existing percentage-based alerts. The implementation is clean, efficient, and user-friendly, with comprehensive documentation and room for future enhancements.
