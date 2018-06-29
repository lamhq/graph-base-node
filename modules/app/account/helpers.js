const validate = require('validate.js');
const querystring = require('querystring');
const path = require('path');
const User = require('../models/user');
const config = require('../../../config');
const { sendMail } = require('../../common/mail');
const { verifyToken, filterObjectKeys } = require('../../common/helpers');

function validateLoginData(data) {
  const rules = {
    loginId: {
      presence: { message: '^Username can\'t be blank' },
    },
    password: {
      presence: true,
    },
  };
  return validate(data, rules, { format: 'grouped' });
}

/**
 * validate and filter input from profile form
 * @param  object form input
 * @param  User mongoose user model
 * @return object list of validation errors or null
 */
function validateProfileData(data, user) {
  // function that perform password validation
  validate.validators.checkPassword = function (value, options, key, attributes) {
    if (value && !user.checkPassword(value)) { return 'is wrong'; }
    return null;
  };

  // validation rules
  const rules = {
    username: {
      presence: true,
      length: { minimum: 3, maximum: 30 },
      format: {
        pattern: '[a-z0-9]+',
        flags: 'i',
        message: 'can only contain alphabet and numeric characters',
      },
    },
    email: {
      presence: true,
      email: true,
    },
    password(value, attributes, attributeName, options, constraints) {
      // only validate when value is not empty
      return value ? {
        length: { minimum: 6, maximum: 30 },
      } : false;
    },
    currentPassword(value, attributes, attributeName, options, constraints) {
      // only validate when password is not empty
      return attributes.password ? {
        presence: true,
        checkPassword: true,
      } : false;
    },
  };

  return validate(data, rules);
}

// validate required fields on forgot password form
async function validateForgotPwdData(data) {
  validate.Promise = global.Promise;

  validate.validators.emailExists = async (value) => {
    const user = await User.findOne({
      email: value,
    });
    return user
      ? Promise.resolve()
      : Promise.resolve('does not exist or account is not enabled');
  };

  const rules = {
    email: {
      presence: { allowEmpty: false },
      email: true,
      emailExists: true,
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

// send password reset instruction email
function sendMailRequestResetPwd(user) {
  const { appName, mail: { autoEmail } } = config;
  const q = querystring.stringify({
    token: user.createToken('10m').value,
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

// validate.js custom async validate function to validate user is valid or not
async function validateUserToken(value) {
  const decoded = verifyToken(value);
  if (!decoded) return Promise.resolve('invalid');

  const user = await User.findOne({
    _id: decoded.userId,
    status: User.STATUS_ACTIVE,
  });
  return user
    ? Promise.resolve()
    : Promise.resolve('is legal but the account does not exist.');
}

// validate form to update new password
async function validateResetPwdData(data) {
  validate.Promise = global.Promise;
  validate.validators.userToken = validateUserToken;
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

async function checkEmailNotExists(value) {
  const user = await User.findOne({
    email: value,
  });
  return !user
    ? Promise.resolve()
    : Promise.resolve('is already registered.');
}

async function validateRegistrationData(data, fields) {
  validate.Promise = global.Promise;
  validate.validators.emailNotExists = checkEmailNotExists;

  let errors;
  let constraints = {
    username: {
      presence: { allowEmpty: false },
      length: { minimum: 3, maximum: 30 },
      format: {
        pattern: '[a-z0-9]+',
        flags: 'i',
        message: 'can only contain alphabet and numeric characters',
      },
      emailNotExists: true,
    },
    email: {
      presence: { allowEmpty: false },
      email: true,
    },
    password: {
      presence: { allowEmpty: false },
    },
    confirmPassword: {
      equality: 'password',
    },
    'profile.firstname': {
      presence: { allowEmpty: false },
    },
    'profile.lastname': {
      presence: { allowEmpty: false },
    },
  };

  // only validate specific fields
  if (Array.isArray(fields)) {
    constraints = filterObjectKeys(constraints, fields);
  }

  try {
    await validate.async(data, constraints, { format: 'grouped' });
  } catch (err) {
    errors = err;
  }
  return errors;
}

module.exports = {
  validateLoginData,
  validateProfileData,
  validateForgotPwdData,
  sendMailRequestResetPwd,
  validateResetPwdData,
  validateRegistrationData,
};
