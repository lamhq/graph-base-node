const { UserInputError } = require('apollo-server');
const path = require('path');
const validate = require('validate.js');
const querystring = require('querystring');
const { combineResolvers } = require('graphql-resolvers');

const config = require('../../config');
const { requirePermission, encryptPassword } = require('../common/helpers');
const { createToken, verifyToken } = require('../common/helpers');
const { sendMail } = require('../common/mail');
const logger = require('../common/log');
const { validatePost, validateProfileData } = require('./helpers');

async function login(obj, { email, password }, context) {
  const user = await context.db.models.User.findOne({ email });
  if (!user || !user.isPasswordValid(password)) {
    throw new UserInputError('Incorrect email or password');
  }
  const { value, expireAt } = user.createToken(config.accessTokenLifeTime);
  return {
    value,
    expireAt,
    user,
  };
}

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

async function adminUpdateProfile(category, args, { user }) {
  const inputErrors = validateProfileData(args, user);
  if (inputErrors) {
    throw new UserInputError('Please correct your inputs', { inputErrors });
  }

  user.email = args.email;
  user.username = args.username;
  user.firstname = args.firstname;
  user.lastname = args.lastname;
  if (args.password) {
    user.password = encryptPassword(args.password);
  }
  await user.save();
  return user;
}

async function adminAddPost(category, { data }, { db }) {
  const post = new db.models.Post();
  const inputErrors = validatePost(data);
  if (inputErrors) {
    throw new UserInputError('Please correct your inputs', { inputErrors });
  }

  post.title = data.title;
  post.content = data.content;
  post.categoryId = data.categoryId;
  post.status = data.status;
  await post.save();
  return post;
}

async function adminUpdatePost(category, { id, data }, { db }) {
  const post = await db.models.Post.findById(id);
  if (!post) {
    throw new UserInputError('Post not found');
  }

  const inputErrors = validatePost(data);
  if (inputErrors) {
    throw new UserInputError('Please correct your inputs', { inputErrors });
  }

  post.title = data.title;
  post.content = data.content;
  post.categoryId = data.categoryId;
  post.status = data.status;
  await post.save();
  return post;
}

async function adminDeletePost(category, { id }, { db }) {
  const post = await db.models.Post.findById(id);
  if (!post) {
    throw new UserInputError('Post not found');
  }

  await post.remove();
  return post;
}

module.exports = {
  login,
  requestResetPassword,
  resetPassword,
  adminUpdateProfile: combineResolvers(requirePermission('admin'), adminUpdateProfile),
  adminAddPost: combineResolvers(requirePermission('admin'), adminAddPost),
  adminUpdatePost: combineResolvers(requirePermission('admin'), adminUpdatePost),
  adminDeletePost: combineResolvers(requirePermission('admin'), adminDeletePost),
};
