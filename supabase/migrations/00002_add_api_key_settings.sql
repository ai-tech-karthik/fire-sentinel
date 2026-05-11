-- Add new API key settings
INSERT INTO settings (key, value) VALUES
  ('api_alpha_vantage_key', ''),
  ('api_yahoo_finance_key', ''),
  ('api_genai_platform', 'openai'),
  ('api_genai_key', '')
ON CONFLICT (key) DO NOTHING;