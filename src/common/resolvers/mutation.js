const { UserInputError } = require('apollo-server');
const path = require('path');
const validate = require('validate.js');
const querystring = require('querystring');
const logger = require('../log');
const { sendMail } = require('../mail');
const {
  createToken,
  verifyToken,
  encryptPassword,
} = require('../helpers');
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

async function validateResetPwdData(data, User) {
  validate.Promise = global.Promise;

  validate.validators.userToken = async (value) => {
    const decoded = verifyToken(value);
    if (!decoded) return Promise.resolve('^Your request is invalid or expired');

    const user = await User.findById(decoded.id);
    return user
      ? Promise.resolve()
      : Promise.resolve('^Invalid request.');
  };

  const rules = {
    token: {
      presence: { allowEmpty: false },
      userToken: true,
    },
    password: {
      presence: { allowEmpty: false },
      length: { minimum: 6, maximum: 30 },
    },
  };

  let errors;
  try {
    await validate.async(data, rules, { format: 'grouped' });
  } catch (err) {
    errors = err;
  }
  return errors;
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
    throw new UserInputError('Error while sending reset password email.');
  }
}

async function resetPassword(parent, args, { db }) {
  const { User } = db.models;
  const inputErrors = await validateResetPwdData(args, User);
  if (inputErrors) {
    let msg = 'Please correct your inputs';
    if (inputErrors.token) {
      [msg] = inputErrors.token;
    }
    throw new UserInputError(msg, { inputErrors });
  }

  const decoded = verifyToken(args.token);
  const user = await User.findById(decoded.id);
  user.password = encryptPassword(args.password);
  await user.save();
  return true;
}

module.exports = {
  requestResetPassword,
  resetPassword,
};
