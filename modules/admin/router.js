const handlers = require('./handlers');
const express = require('express');

const router = express.Router();

router.route('/admin/session')
  .post(handlers.login);

// send reset password email
router.post('/admin/password-reset/request', handlers.requestResetPassword);

// update account's password
router.put('/admin/password', handlers.resetPassword);

router.use(/^\/admin.*?/, handlers.verifyAdminToken);

router.route('/admin/account')
  .get(handlers.getProfile)
  .put(handlers.updateProfile);

module.exports = router;
