import express from 'express';
import { setupSecurity } from './middleware/security';
import { errorHandler } from './middleware/errorHandler';
import { authRouter } from './modules/auth';
import { projectRouter } from './modules/projects';
import { riskEventRouter } from './modules/risk-events';
import { predictionRouter } from './modules/predictions';
import { recoveryPlanRouter } from './modules/recovery-plans';
import { decisionRouter } from './modules/decisions';
import intelligenceRouter from './modules/intelligence/intelligence.routes';

const app = express();

app.use(express.json());
setupSecurity(app);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Routers
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/projects', projectRouter);
app.use('/api/v1/risk-events', riskEventRouter);
app.use('/api/v1/predictions', predictionRouter);
app.use('/api/v1/recovery-plans', recoveryPlanRouter);
app.use('/api/v1/decisions', decisionRouter);
app.use('/api/v1/intelligence', intelligenceRouter);

app.use(errorHandler);

export default app;
