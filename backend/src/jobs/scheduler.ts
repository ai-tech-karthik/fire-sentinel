import cron from 'node-cron';
import { runPriceMonitor } from './priceMonitor';
import { runNewsMonitor } from './newsMonitor';
import { query } from '../config/database';

let priceMonitorJob: cron.ScheduledTask | null = null;
let newsMonitorJob: cron.ScheduledTask | null = null;

export const startScheduledJobs = async () => {
  console.log('🕐 Starting scheduled jobs...');
  
  try {
    // Get settings to determine frequencies
    const settings = await query('SELECT * FROM settings LIMIT 1');
    
    if (settings.rows.length === 0) {
      console.log('⚠️  No settings found, using default frequencies');
      startPriceMonitor(300); // 5 minutes
      startNewsMonitor(600); // 10 minutes
      return;
    }
    
    const { price_check_frequency, news_check_frequency } = settings.rows[0];
    
    startPriceMonitor(price_check_frequency || 300);
    startNewsMonitor(news_check_frequency || 600);
    
    console.log('✅ Scheduled jobs started successfully');
  } catch (error) {
    console.error('❌ Error starting scheduled jobs:', error);
  }
};

const startPriceMonitor = (frequencySeconds: number) => {
  // Stop existing job if any
  if (priceMonitorJob) {
    priceMonitorJob.stop();
  }
  
  // Convert seconds to cron expression
  const cronExpression = secondsToCron(frequencySeconds);
  
  console.log(`📊 Price monitor: every ${frequencySeconds}s (${cronExpression})`);
  
  priceMonitorJob = cron.schedule(cronExpression, async () => {
    console.log('🔄 Running price monitor...');
    try {
      await runPriceMonitor();
      console.log('✅ Price monitor completed');
    } catch (error) {
      console.error('❌ Price monitor error:', error);
    }
  });
  
  // Run immediately on start
  setTimeout(() => {
    console.log('🚀 Running initial price monitor...');
    runPriceMonitor().catch(console.error);
  }, 5000);
};

const startNewsMonitor = (frequencySeconds: number) => {
  // Stop existing job if any
  if (newsMonitorJob) {
    newsMonitorJob.stop();
  }
  
  // Convert seconds to cron expression
  const cronExpression = secondsToCron(frequencySeconds);
  
  console.log(`📰 News monitor: every ${frequencySeconds}s (${cronExpression})`);
  
  newsMonitorJob = cron.schedule(cronExpression, async () => {
    console.log('🔄 Running news monitor...');
    try {
      await runNewsMonitor();
      console.log('✅ News monitor completed');
    } catch (error) {
      console.error('❌ News monitor error:', error);
    }
  });
  
  // Run immediately on start (after price monitor)
  setTimeout(() => {
    console.log('🚀 Running initial news monitor...');
    runNewsMonitor().catch(console.error);
  }, 10000);
};

// Convert seconds to cron expression
// For simplicity, we'll use minute-based cron for frequencies >= 60s
const secondsToCron = (seconds: number): string => {
  if (seconds < 60) {
    // For very short intervals, run every minute
    return '* * * * *';
  }
  
  const minutes = Math.floor(seconds / 60);
  
  if (minutes === 1) {
    return '* * * * *'; // Every minute
  } else if (minutes < 60) {
    return `*/${minutes} * * * *`; // Every N minutes
  } else {
    const hours = Math.floor(minutes / 60);
    return `0 */${hours} * * *`; // Every N hours
  }
};

// Update job frequencies dynamically
export const updateJobFrequencies = async () => {
  try {
    const settings = await query('SELECT * FROM settings LIMIT 1');
    
    if (settings.rows.length === 0) {
      return;
    }
    
    const { price_check_frequency, news_check_frequency } = settings.rows[0];
    
    console.log('🔄 Updating job frequencies...');
    startPriceMonitor(price_check_frequency || 300);
    startNewsMonitor(news_check_frequency || 600);
    console.log('✅ Job frequencies updated');
  } catch (error) {
    console.error('❌ Error updating job frequencies:', error);
  }
};

// Stop all jobs (for graceful shutdown)
export const stopScheduledJobs = () => {
  console.log('🛑 Stopping scheduled jobs...');
  
  if (priceMonitorJob) {
    priceMonitorJob.stop();
    priceMonitorJob = null;
  }
  
  if (newsMonitorJob) {
    newsMonitorJob.stop();
    newsMonitorJob = null;
  }
  
  console.log('✅ Scheduled jobs stopped');
};

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, stopping scheduled jobs...');
  stopScheduledJobs();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, stopping scheduled jobs...');
  stopScheduledJobs();
  process.exit(0);
});
