const path = require('path')

var config = {
  port: process.env.PORT || 3000,
  webUrl: process.env.WEB_URL,
  db: {
    uri: process.env.DB_URI,
    debug: process.env.MONGOOSE_DEBUG==='true'
  },
  appName: 'React Blog',
  appSecret: 'react blog secret',
  logPath: process.env.LOG_PATH || path.resolve(__dirname, 'logs'),
  sentryDns: process.env.SENTRY_DNS || false,
  mail: {
    transport: {
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT),
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PWD,
      },
    },
    autoEmail: 'noreply@careinterchange.com',
  },
  accessTokenLifeTime: '3h',
  s3Config: {
    accessKeyId: 'AKIAJZYDLKBI7KI7ZF6Q',
    secretAccessKey: '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',
    bucket: 'lamhq',
    region: 'ap-southeast-1',
  }
}

module.exports = config