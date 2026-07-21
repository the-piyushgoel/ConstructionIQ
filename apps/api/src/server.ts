import { env } from './config/env';
import { Logger } from './utils/logger';
import app from './app';

const PORT = env.PORT;

app.listen(PORT, () => {
  Logger.info(`Server is running on port ${PORT}`);
});
