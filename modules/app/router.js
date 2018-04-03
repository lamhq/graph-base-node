const handlers = require('./handlers');
const express = require('express');

const router = express.Router();

// refresh token
router.post('/tokens', handlers.verifyUserToken, handlers.refreshToken);

module.exports = router;
