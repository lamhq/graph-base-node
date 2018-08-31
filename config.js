const config = {
  appName: 'React Blog',
  appSecret: 'react blog secret',
  port: process.env.PORT || 3000,
  webUrl: process.env.WEB_URL,
  accessTokenLifeTime: '3h',
  resetPasswordTokenLifeTime: '24h',
  sentryDns: process.env.SENTRY_DNS || false,
  db: {
    uri: process.env.DB_URI,
    debug: process.env.MONGOOSE_DEBUG === 'true',
  },
  mail: {
    transport: {
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT, 10),
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PWD,
      },
    },
    autoEmail: 'noreply@mailinator.com',
    adminEmail: 'john@mailinator.com',
  },
  awsConfig: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
    bucket: process.env.AWS_BUCKET,
    websiteEndpoint: process.env.AWS_BUCKET_ENDPOINT,
    objectKeyPrefix: 'upload/',
  },
};

module.exports = config;
