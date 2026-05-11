-- Create price_alerts table
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

-- Create indexes
CREATE INDEX idx_price_alerts_stock_id ON price_alerts(stock_id);
CREATE INDEX idx_price_alerts_symbol ON price_alerts(symbol);
CREATE INDEX idx_price_alerts_enabled ON price_alerts(enabled);

-- Create trigger for updated_at
CREATE TRIGGER update_price_alerts_updated_at BEFORE UPDATE ON price_alerts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Update alerts table to support custom price alerts
ALTER TABLE alerts DROP CONSTRAINT IF EXISTS alerts_alert_type_check;
ALTER TABLE alerts ADD CONSTRAINT alerts_alert_type_check 
  CHECK (alert_type IN ('profit_target', 'stop_loss', 'negative_sentiment', 'custom_price'));