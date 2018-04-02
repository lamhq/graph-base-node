const handlers = require('./handlers');
const express = require('express');

const router = express.Router();

router.route('/account/session')
  .post(handlers.login);

// send reset password email
router.post('/account/password-reset/request', handlers.requestResetPassword);

// update account's password
router.put('/account/password', handlers.resetPassword);

router.use(/^\/account.*?/, handlers.verifyAdminToken);

router.route('/account/profile')
  .get(handlers.getProfile)
  .put(handlers.updateProfile);

module.exports = router;
