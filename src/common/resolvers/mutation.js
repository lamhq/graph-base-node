const { UserInputError } = require('apollo-server');
const path = require('path');
const querystring = require('querystring');
const logger = require('../log');
const { sendMail } = require('../mail');
const { createToken } = require('../helpers');
const config = require('../../../config');

// send password reset instruction email
function sendMailRequestResetPwd(user) {
  const { appName, mail: { autoEmail } } = config;
  const q = querystring.stringify({
    token: createToken(user, config.resetPasswordTokenLifeTime).value,
  });
  const link = `${config.webUrl}/reset-password?${q}`;

  const message = {
    from: `${appName} <${autoEmail}>`,
    to: `${user.email} <${user.email}>`,
    subject: `${appName} - Password reset request`,
    templatePath: path.resolve(__dirname, 'email/reset-password.pug'),
    params: {
      appName: config.appName,
      link,
    },
  };

  return sendMail(message);
}

async function requestResetPassword(parent, { email }, { db }) {
  const user = await db.models.User.findOne({ email });
  if (!user) {
    throw new UserInputError('The account does not exists');
  }
  try {
    await sendMailRequestResetPwd(user);
    return true;
  } catch (err) {
    logger.error(err);
    throw new UserInputError('Error while sending email.');
  }
}

module.exports = {
  requestResetPassword,
};
