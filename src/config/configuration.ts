const configuration = () => ({
  PORT: parseInt(process.env.PORT ?? '3000', 10),
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  JWT_SECRET: process.env.JWT_SECRET ?? 'changeme',
});

export default configuration;