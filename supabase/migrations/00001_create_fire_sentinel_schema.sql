-- Create accounts table
CREATE TABLE accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create stocks table
CREATE TABLE stocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  symbol text NOT NULL,
  quantity numeric(20, 8) NOT NULL CHECK (quantity > 0),
  bought_price numeric(20, 2) NOT NULL CHECK (bought_price > 0),
  current_price numeric(20, 2),
  target_profit_percentage numeric(5, 2) NOT NULL DEFAULT 20.00 CHECK (target_profit_percentage >= 0),
  stop_loss_percentage numeric(5, 2) NOT NULL DEFAULT 10.00 CHECK (stop_loss_percentage >= 0),
  last_price_update timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(account_id, symbol)
);

-- Create alerts table
CREATE TABLE alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stock_id uuid REFERENCES stocks(id) ON DELETE SET NULL,
  symbol text NOT NULL,
  alert_type text NOT NULL CHECK (alert_type IN ('profit_target', 'stop_loss', 'negative_sentiment')),
  message text NOT NULL,
  trigger_price numeric(20, 2),
  trigger_value text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create news table
CREATE TABLE news (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol text NOT NULL,
  title text NOT NULL,
  source text,
  url text,
  published_at timestamptz,
  sentiment_score numeric(3, 2) CHECK (sentiment_score >= -1 AND sentiment_score <= 1),
  sentiment_label text CHECK (sentiment_label IN ('positive', 'neutral', 'negative')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(symbol, url)
);

-- Create settings table
CREATE TABLE settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  value text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_stocks_account_id ON stocks(account_id);
CREATE INDEX idx_stocks_symbol ON stocks(symbol);
CREATE INDEX idx_alerts_stock_id ON alerts(stock_id);
CREATE INDEX idx_alerts_created_at ON alerts(created_at DESC);
CREATE INDEX idx_news_symbol ON news(symbol);
CREATE INDEX idx_news_published_at ON news(published_at DESC);
CREATE INDEX idx_settings_key ON settings(key);

-- Insert default settings
INSERT INTO settings (key, value) VALUES
  ('price_check_frequency', '300'),
  ('news_check_frequency', '600'),
  ('default_profit_target', '20.00'),
  ('default_stop_loss', '10.00'),
  ('alert_email_enabled', 'false'),
  ('alert_email_address', ''),
  ('alert_slack_enabled', 'false'),
  ('alert_slack_webhook', ''),
  ('alert_sms_enabled', 'false'),
  ('alert_sms_phone', '');

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_accounts_updated_at BEFORE UPDATE ON accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stocks_updated_at BEFORE UPDATE ON stocks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();