const express = require('express')
const app = express()
const { notFoundExc } = require('./modules/common/helpers')
const logger = require('./modules/common/log')

// integrate sentry with raven-node
const sentry = require('./modules/common/sentry')
sentry.install()
sentry.addRequestHandler(app)

// enable parsing request boby with different content types
const bodyParser = require('body-parser')
app.use(bodyParser.json())

// log http request to console
const morgan = require('morgan')
app.use(morgan('tiny', {
  stream: logger.stream
}))

// add module's middlewares
app.use('/api', [
  require('./modules/blog/router'),
  require('./modules/admin/router'),
  require('./modules/blog/admin/router'),
])

// Only serves static assets in production
if (process.env.NODE_ENV === 'production') {
  const path = require('path')
  let frontendBuildPath = path.resolve(__dirname, '..', 'build')
  app.use(express.static(frontendBuildPath))
  app.get('/*', function (req, res) {
    res.sendFile(path.resolve(frontendBuildPath, 'index.html'))
  })
}

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  return next(notFoundExc('No route found'))
})

sentry.addErrorHandler(app)

// error handler
app.use(function (err, req, res, next) {
  // errors thrown by app
  if (err.status) {
    let { status, ...data } = err
    res.status(status).json(data)
  } else {
    // uncaught exception
    logger.error(err)
    res.status(500).json({
      code: 'server_error',
      message: err.message,
    })
  }
})

module.exports = app