import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { settingsApi } from '@/services/api';
import { toast } from 'sonner';
import { Eye, EyeOff } from 'lucide-react';
import type { SettingsFormData } from '@/types/types';

export default function Settings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showApiKeys, setShowApiKeys] = useState({
    alphaVantage: false,
    yahooFinance: false,
    genAi: false,
  });
  const [settings, setSettings] = useState<SettingsFormData>({
    price_check_frequency: 300,
    news_check_frequency: 600,
    default_profit_target: 20,
    default_stop_loss: 10,
    alert_email_enabled: false,
    alert_email_address: '',
    alert_slack_enabled: false,
    alert_slack_webhook: '',
    alert_sms_enabled: false,
    alert_sms_phone: '',
    api_alpha_vantage_key: '',
    api_yahoo_finance_key: '',
    api_genai_platform: 'openai',
    api_genai_key: '',
  });

  const loadSettings = async () => {
    try {
      const data = await settingsApi.get();
      setSettings({
        price_check_frequency: data.price_check_frequency || 300,
        news_check_frequency: data.news_check_frequency || 600,
        default_profit_target: 20,
        default_stop_loss: 10,
        alert_email_enabled: data.email_enabled || false,
        alert_email_address: data.email_address || '',
        alert_slack_enabled: data.slack_enabled || false,
        alert_slack_webhook: data.slack_webhook_url || '',
        alert_sms_enabled: data.sms_enabled || false,
        alert_sms_phone: data.sms_phone_number || '',
        api_alpha_vantage_key: data.alpha_vantage_api_key || '',
        api_yahoo_finance_key: '',
        api_genai_platform: data.gen_ai_platform || 'openai',
        api_genai_key: data.gen_ai_api_key || '',
      });
    } catch (error) {
      console.error('Error loading settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await settingsApi.update({
        price_check_frequency: settings.price_check_frequency,
        news_check_frequency: settings.news_check_frequency,
        email_enabled: settings.alert_email_enabled,
        email_address: settings.alert_email_address,
        slack_enabled: settings.alert_slack_enabled,
        slack_webhook_url: settings.alert_slack_webhook,
        sms_enabled: settings.alert_sms_enabled,
        sms_phone_number: settings.alert_sms_phone,
        alpha_vantage_api_key: settings.api_alpha_vantage_key,
        gen_ai_platform: settings.api_genai_platform as 'openai' | 'anthropic' | 'google',
        gen_ai_api_key: settings.api_genai_key,
      });
      toast.success('Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Configure monitoring, API keys, and alert preferences
        </p>
      </div>

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-lg font-medium">API Configuration</CardTitle>
          <CardDescription>
            Configure API keys for price data and AI services
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="alpha-vantage-key">Alpha Vantage API Key</Label>
              <div className="flex gap-2">
                <Input
                  id="alpha-vantage-key"
                  type={showApiKeys.alphaVantage ? 'text' : 'password'}
                  placeholder="Enter your Alpha Vantage API key"
                  value={settings.api_alpha_vantage_key}
                  onChange={(e) => setSettings({ ...settings, api_alpha_vantage_key: e.target.value })}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setShowApiKeys({ ...showApiKeys, alphaVantage: !showApiKeys.alphaVantage })}
                >
                  {showApiKeys.alphaVantage ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Get a free API key from{' '}
                <a
                  href="https://www.alphavantage.co/support/#api-key"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Alpha Vantage
                </a>
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="yahoo-finance-key">Yahoo Finance API Key (Optional)</Label>
              <div className="flex gap-2">
                <Input
                  id="yahoo-finance-key"
                  type={showApiKeys.yahooFinance ? 'text' : 'password'}
                  placeholder="Enter your Yahoo Finance API key"
                  value={settings.api_yahoo_finance_key}
                  onChange={(e) => setSettings({ ...settings, api_yahoo_finance_key: e.target.value })}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setShowApiKeys({ ...showApiKeys, yahooFinance: !showApiKeys.yahooFinance })}
                >
                  {showApiKeys.yahooFinance ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Yahoo Finance is used as fallback. API key is optional for basic usage.
              </p>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="genai-platform">Gen AI Platform</Label>
              <Select
                value={settings.api_genai_platform}
                onValueChange={(value) => setSettings({ ...settings, api_genai_platform: value })}
              >
                <SelectTrigger id="genai-platform">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="openai">OpenAI (GPT-4, GPT-3.5)</SelectItem>
                  <SelectItem value="anthropic">Anthropic (Claude)</SelectItem>
                  <SelectItem value="google">Google (Gemini)</SelectItem>
                  <SelectItem value="none">None (Disable AI Features)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Select the AI platform for enhanced sentiment analysis and insights
              </p>
            </div>

            {settings.api_genai_platform !== 'none' && (
              <div className="space-y-2">
                <Label htmlFor="genai-key">
                  {settings.api_genai_platform === 'openai' && 'OpenAI API Key'}
                  {settings.api_genai_platform === 'anthropic' && 'Anthropic API Key'}
                  {settings.api_genai_platform === 'google' && 'Google AI API Key'}
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="genai-key"
                    type={showApiKeys.genAi ? 'text' : 'password'}
                    placeholder={`Enter your ${settings.api_genai_platform} API key`}
                    value={settings.api_genai_key}
                    onChange={(e) => setSettings({ ...settings, api_genai_key: e.target.value })}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setShowApiKeys({ ...showApiKeys, genAi: !showApiKeys.genAi })}
                  >
                    {showApiKeys.genAi ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  {settings.api_genai_platform === 'openai' && (
                    <>
                      Get your API key from{' '}
                      <a
                        href="https://platform.openai.com/api-keys"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        OpenAI Platform
                      </a>
                    </>
                  )}
                  {settings.api_genai_platform === 'anthropic' && (
                    <>
                      Get your API key from{' '}
                      <a
                        href="https://console.anthropic.com/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        Anthropic Console
                      </a>
                    </>
                  )}
                  {settings.api_genai_platform === 'google' && (
                    <>
                      Get your API key from{' '}
                      <a
                        href="https://makersuite.google.com/app/apikey"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        Google AI Studio
                      </a>
                    </>
                  )}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-lg font-medium">Monitoring Configuration</CardTitle>
          <CardDescription>
            Set how frequently the system checks for price updates and news
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="price-frequency">Price Check Frequency (seconds)</Label>
              <Input
                id="price-frequency"
                type="number"
                min="60"
                value={settings.price_check_frequency}
                onChange={(e) => setSettings({ ...settings, price_check_frequency: parseInt(e.target.value) || 300 })}
              />
              <p className="text-xs text-muted-foreground">
                Recommended: 300 seconds (5 minutes)
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="news-frequency">News Check Frequency (seconds)</Label>
              <Input
                id="news-frequency"
                type="number"
                min="60"
                value={settings.news_check_frequency}
                onChange={(e) => setSettings({ ...settings, news_check_frequency: parseInt(e.target.value) || 600 })}
              />
              <p className="text-xs text-muted-foreground">
                Recommended: 600 seconds (10 minutes)
              </p>
            </div>
          </div>

          <Separator />

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="profit-target">Default Profit Target (%)</Label>
              <Input
                id="profit-target"
                type="number"
                min="0"
                step="0.01"
                value={settings.default_profit_target}
                onChange={(e) => setSettings({ ...settings, default_profit_target: parseFloat(e.target.value) || 20 })}
              />
              <p className="text-xs text-muted-foreground">
                Applied to new stocks by default
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="stop-loss">Default Stop Loss (%)</Label>
              <Input
                id="stop-loss"
                type="number"
                min="0"
                step="0.01"
                value={settings.default_stop_loss}
                onChange={(e) => setSettings({ ...settings, default_stop_loss: parseFloat(e.target.value) || 10 })}
              />
              <p className="text-xs text-muted-foreground">
                Applied to new stocks by default
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-lg font-medium">Alert Delivery</CardTitle>
          <CardDescription>
            Configure how you want to receive alerts
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="email-enabled" className="text-base">Email Alerts</Label>
                <p className="text-sm text-muted-foreground">
                  Receive alerts via email
                </p>
              </div>
              <Switch
                id="email-enabled"
                checked={settings.alert_email_enabled}
                onCheckedChange={(checked) => setSettings({ ...settings, alert_email_enabled: checked })}
              />
            </div>
            {settings.alert_email_enabled && (
              <div className="space-y-2">
                <Label htmlFor="email-address">Email Address</Label>
                <Input
                  id="email-address"
                  type="email"
                  placeholder="your@email.com"
                  value={settings.alert_email_address}
                  onChange={(e) => setSettings({ ...settings, alert_email_address: e.target.value })}
                />
              </div>
            )}
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="slack-enabled" className="text-base">Slack Alerts</Label>
                <p className="text-sm text-muted-foreground">
                  Receive alerts in Slack
                </p>
              </div>
              <Switch
                id="slack-enabled"
                checked={settings.alert_slack_enabled}
                onCheckedChange={(checked) => setSettings({ ...settings, alert_slack_enabled: checked })}
              />
            </div>
            {settings.alert_slack_enabled && (
              <div className="space-y-2">
                <Label htmlFor="slack-webhook">Slack Webhook URL</Label>
                <Input
                  id="slack-webhook"
                  type="url"
                  placeholder="https://hooks.slack.com/services/..."
                  value={settings.alert_slack_webhook}
                  onChange={(e) => setSettings({ ...settings, alert_slack_webhook: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  Create a webhook in your Slack workspace settings
                </p>
              </div>
            )}
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="sms-enabled" className="text-base">SMS Alerts</Label>
                <p className="text-sm text-muted-foreground">
                  Receive alerts via SMS
                </p>
              </div>
              <Switch
                id="sms-enabled"
                checked={settings.alert_sms_enabled}
                onCheckedChange={(checked) => setSettings({ ...settings, alert_sms_enabled: checked })}
              />
            </div>
            {settings.alert_sms_enabled && (
              <div className="space-y-2">
                <Label htmlFor="sms-phone">Phone Number</Label>
                <Input
                  id="sms-phone"
                  type="tel"
                  placeholder="+1234567890"
                  value={settings.alert_sms_phone}
                  onChange={(e) => setSettings({ ...settings, alert_sms_phone: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  Include country code (e.g., +1 for US)
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </div>
  );
}
