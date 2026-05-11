import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import accountsRouter from './routes/accounts';
import stocksRouter from './routes/stocks';
import alertsRouter from './routes/alerts';
import newsRouter from './routes/news';
import settingsRouter from './routes/settings';
import priceAlertsRouter from './routes/priceAlerts';
import authRouter from './routes/auth';
import { startScheduledJobs } from './jobs/scheduler';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/accounts', accountsRouter);
app.use('/api/stocks', stocksRouter);
app.use('/api/alerts', alertsRouter);
app.use('/api/news', newsRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/price-alerts', priceAlertsRouter);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 API available at http://localhost:${PORT}/api`);
  console.log(`🏥 Health check at http://localhost:${PORT}/health`);
  
  // Start scheduled jobs
  startScheduledJobs();
});

export default app;
