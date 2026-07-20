import express from 'express';
import { setupSecurity } from './middleware/security';
import { errorHandler } from './middleware/errorHandler';
import { authRouter } from './modules/auth';
import { projectRouter } from './modules/projects';

const app = express();

app.use(express.json());
setupSecurity(app);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Routers
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/projects', projectRouter);

app.use(errorHandler);

export default app;
