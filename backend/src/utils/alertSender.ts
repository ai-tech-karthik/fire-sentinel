import axios from 'axios';
import { query } from '../config/database';

export const sendAlert = async (alert: any) => {
  try {
    // Get settings
    const settingsResult = await query('SELECT * FROM settings LIMIT 1');
    if (settingsResult.rows.length === 0) {
      console.log('No settings found, skipping alert notification');
      return;
    }
    
    const settings = settingsResult.rows[0];
    
    // Send to enabled channels
    const promises = [];
    
    if (settings.email_enabled && settings.email_address) {
      promises.push(sendEmailAlert(alert, settings.email_address));
    }
    
    if (settings.slack_enabled && settings.slack_webhook_url) {
      promises.push(sendSlackAlert(alert, settings.slack_webhook_url));
    }
    
    if (settings.sms_enabled && settings.sms_phone_number) {
      promises.push(sendSMSAlert(alert, settings.sms_phone_number));
    }
    
    if (promises.length > 0) {
      await Promise.allSettled(promises);
      console.log(`Alert sent via ${promises.length} channel(s)`);
    } else {
      console.log('No notification channels enabled');
    }
  } catch (error) {
    console.error('Error sending alert:', error);
  }
};

const sendEmailAlert = async (alert: any, emailAddress: string) => {
  try {
    // Note: This is a placeholder. In production, you would use a service like:
    // - SendGrid
    // - AWS SES
    // - Mailgun
    // - Nodemailer with SMTP
    
    console.log(`📧 Email alert would be sent to ${emailAddress}:`);
    console.log(`   Subject: FIRE Sentinel Alert - ${alert.symbol}`);
    console.log(`   Message: ${alert.message}`);
    
    // Example with a hypothetical email service:
    // await axios.post('https://api.emailservice.com/send', {
    //   to: emailAddress,
    //   subject: `FIRE Sentinel Alert - ${alert.symbol}`,
    //   text: alert.message,
    // });
  } catch (error) {
    console.error('Email alert error:', error);
  }
};

const sendSlackAlert = async (alert: any, webhookUrl: string) => {
  try {
    const color = alert.alert_type === 'profit_target' ? 'good' : 
                  alert.alert_type === 'stop_loss' ? 'danger' : 
                  alert.alert_type === 'negative_sentiment' ? 'warning' : '#36a64f';
    
    const payload = {
      attachments: [
        {
          color,
          title: `🚨 ${alert.symbol} Alert`,
          text: alert.message,
          fields: [
            {
              title: 'Alert Type',
              value: alert.alert_type.replace('_', ' ').toUpperCase(),
              short: true,
            },
            {
              title: 'Symbol',
              value: alert.symbol,
              short: true,
            },
          ],
          footer: 'FIRE Sentinel',
          ts: Math.floor(Date.now() / 1000),
        },
      ],
    };
    
    await axios.post(webhookUrl, payload, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 5000,
    });
    
    console.log(`✅ Slack alert sent for ${alert.symbol}`);
  } catch (error) {
    console.error('Slack alert error:', error);
  }
};

const sendSMSAlert = async (alert: any, phoneNumber: string) => {
  try {
    // Note: This is a placeholder. In production, you would use a service like:
    // - Twilio
    // - AWS SNS
    // - Vonage (Nexmo)
    
    console.log(`📱 SMS alert would be sent to ${phoneNumber}:`);
    console.log(`   Message: ${alert.symbol}: ${alert.message}`);
    
    // Example with Twilio:
    // const accountSid = process.env.TWILIO_ACCOUNT_SID;
    // const authToken = process.env.TWILIO_AUTH_TOKEN;
    // const fromNumber = process.env.TWILIO_PHONE_NUMBER;
    // 
    // await axios.post(
    //   `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
    //   new URLSearchParams({
    //     To: phoneNumber,
    //     From: fromNumber,
    //     Body: `${alert.symbol}: ${alert.message}`,
    //   }),
    //   {
    //     auth: { username: accountSid, password: authToken },
    //   }
    // );
  } catch (error) {
    console.error('SMS alert error:', error);
  }
};
