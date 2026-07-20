import app from './app';

const PORT = process.env.PORT || 4000;

const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`FATAL ERROR: Environment variable ${envVar} is not defined.`);
    process.exit(1);
  }
}

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
