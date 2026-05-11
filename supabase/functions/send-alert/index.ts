import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Alert {
  symbol: string;
  alert_type: string;
  message: string;
  trigger_price?: number;
  trigger_value?: string;
}

async function sendEmailAlert(to: string, alert: Alert): Promise<boolean> {
  try {
    console.log(`Email alert would be sent to ${to}:`, alert.message);
    return true;
  } catch (error) {
    console.error('Email send error:', error);
    return false;
  }
}

async function sendSlackAlert(webhookUrl: string, alert: Alert): Promise<boolean> {
  try {
    const color = alert.alert_type === 'profit_target' ? '#00d4aa' : 
                  alert.alert_type === 'stop_loss' ? '#ff4757' : '#ff9500';

    const payload = {
      attachments: [{
        color,
        title: `FIRE Sentinel Alert: ${alert.symbol}`,
        text: alert.message,
        fields: [
          {
            title: 'Alert Type',
            value: alert.alert_type.replace('_', ' ').toUpperCase(),
            short: true,
          },
          {
            title: 'Trigger Value',
            value: alert.trigger_value || 'N/A',
            short: true,
          },
        ],
        footer: 'FIRE Sentinel',
        ts: Math.floor(Date.now() / 1000),
      }],
    };

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    return response.ok;
  } catch (error) {
    console.error('Slack send error:', error);
    return false;
  }
}

async function sendSMSAlert(phone: string, alert: Alert): Promise<boolean> {
  try {
    console.log(`SMS alert would be sent to ${phone}:`, alert.message);
    return true;
  } catch (error) {
    console.error('SMS send error:', error);
    return false;
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { alert } = await req.json();

    if (!alert) {
      throw new Error('Alert data is required');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: settings, error: settingsError } = await supabase
      .from('settings')
      .select('*');

    if (settingsError) throw settingsError;

    const settingsMap = (settings || []).reduce((acc, s) => {
      acc[s.key] = s.value;
      return acc;
    }, {} as Record<string, string>);

    const results = {
      email: false,
      slack: false,
      sms: false,
    };

    if (settingsMap.alert_email_enabled === 'true' && settingsMap.alert_email_address) {
      results.email = await sendEmailAlert(settingsMap.alert_email_address, alert);
    }

    if (settingsMap.alert_slack_enabled === 'true' && settingsMap.alert_slack_webhook) {
      results.slack = await sendSlackAlert(settingsMap.alert_slack_webhook, alert);
    }

    if (settingsMap.alert_sms_enabled === 'true' && settingsMap.alert_sms_phone) {
      results.sms = await sendSMSAlert(settingsMap.alert_sms_phone, alert);
    }

    return new Response(
      JSON.stringify({
        success: true,
        results,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in send-alert:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
