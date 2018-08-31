const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const path = require('path');
const logger = require('./modules/common/log');
const sentry = require('./modules/common/sentry');
const { notFoundExc } = require('./modules/common/helpers');
const router = require('./router');

const app = express();

// integrate template engine
app.set('view engine', 'pug');

// integrate sentry with raven-node
sentry.install();
sentry.addRequestHandler(app);

// enable parsing request boby with different content types
app.use(bodyParser.json());

// log http request to console
app.use(morgan('tiny', {
  stream: logger.stream,
}));

// application router
app.use(router);

// catch 404 and forward to error handler
app.use((req, res, next) => next(notFoundExc('No route found')));

sentry.addErrorHandler(app);

// error handler
app.use((err, req, res, next) => {
  // errors thrown by app
  if (err.status) {
    const { status, ...data } = err;
    res.status(status).json(data);
  } else {
    // uncaught exception
    logger.error(err.stack);
    res.status(500).json({
      code: 'server_error',
      message: 'There is something wrong while processing your request. Please try again later',
      description: err.stack,
    });
  }
});

module.exports = app;
