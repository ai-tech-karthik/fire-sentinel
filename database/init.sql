-- FIRE Sentinel Database Initialization Script
-- PostgreSQL 15+

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table for authentication
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password text NOT NULL,
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create accounts table
CREATE TABLE IF NOT EXISTS accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create stocks table
CREATE TABLE IF NOT EXISTS stocks (
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
CREATE TABLE IF NOT EXISTS alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stock_id uuid REFERENCES stocks(id) ON DELETE SET NULL,
  symbol text NOT NULL,
  alert_type text NOT NULL CHECK (alert_type IN ('profit_target', 'stop_loss', 'negative_sentiment', 'custom_price')),
  message text NOT NULL,
  trigger_price numeric(20, 2),
  trigger_value text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create news table
CREATE TABLE IF NOT EXISTS news (
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
CREATE TABLE IF NOT EXISTS settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  alpha_vantage_api_key text,
  gen_ai_platform text CHECK (gen_ai_platform IN ('openai', 'anthropic', 'google')),
  gen_ai_api_key text,
  price_check_frequency integer NOT NULL DEFAULT 300 CHECK (price_check_frequency >= 60),
  news_check_frequency integer NOT NULL DEFAULT 600 CHECK (news_check_frequency >= 60),
  email_enabled boolean NOT NULL DEFAULT false,
  email_address text,
  slack_enabled boolean NOT NULL DEFAULT false,
  slack_webhook_url text,
  sms_enabled boolean NOT NULL DEFAULT false,
  sms_phone_number text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create price_alerts table
CREATE TABLE IF NOT EXISTS price_alerts (
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_stocks_account_id ON stocks(account_id);
CREATE INDEX IF NOT EXISTS idx_stocks_symbol ON stocks(symbol);
CREATE INDEX IF NOT EXISTS idx_alerts_stock_id ON alerts(stock_id);
CREATE INDEX IF NOT EXISTS idx_alerts_symbol ON alerts(symbol);
CREATE INDEX IF NOT EXISTS idx_alerts_created_at ON alerts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_symbol ON news(symbol);
CREATE INDEX IF NOT EXISTS idx_news_published_at ON news(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_sentiment_label ON news(sentiment_label);
CREATE INDEX IF NOT EXISTS idx_price_alerts_stock_id ON price_alerts(stock_id);
CREATE INDEX IF NOT EXISTS idx_price_alerts_symbol ON price_alerts(symbol);
CREATE INDEX IF NOT EXISTS idx_price_alerts_enabled ON price_alerts(enabled);

-- Create trigger function for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_accounts_updated_at BEFORE UPDATE ON accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stocks_updated_at BEFORE UPDATE ON stocks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_price_alerts_updated_at BEFORE UPDATE ON price_alerts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default settings
INSERT INTO settings (id) VALUES (gen_random_uuid())
ON CONFLICT DO NOTHING;

-- Create default admin user (password: admin123 - CHANGE THIS!)
-- Password hash for 'admin123'
INSERT INTO users (email, password, name) 
VALUES ('admin@fire-sentinel.local', '$2b$10$rKvVPZqGhXqN8YvGPxKGHOxLLKJ7qN5YvGPxKGHOxLLKJ7qN5YvGP', 'Admin User')
ON CONFLICT (email) DO NOTHING;

-- Grant necessary permissions (if using specific database user)
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO fire_sentinel_user;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO fire_sentinel_user;

COMMENT ON TABLE users IS 'User authentication and management';
COMMENT ON TABLE accounts IS 'Brokerage accounts for portfolio tracking';
COMMENT ON TABLE stocks IS 'Stock holdings across accounts';
COMMENT ON TABLE alerts IS 'Alert history and notifications';
COMMENT ON TABLE news IS 'News articles with sentiment analysis';
COMMENT ON TABLE settings IS 'Application configuration and API keys';
COMMENT ON TABLE price_alerts IS 'Custom price alerts with directional triggers';
