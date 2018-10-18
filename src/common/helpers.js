const mongoose = require('mongoose');
const ms = require('ms');
const jwt = require('jsonwebtoken');
const validate = require('validate.js');
const querystring = require('querystring');
const {
  skip,
  combineResolvers,
} = require('graphql-resolvers');
const {
  AuthenticationError,
  ForbiddenError,
} = require('apollo-server');
const config = require('../../config');

/**
 * @returns Promise
 */
function connectToDb() {
  mongoose.set('debug', config.db.debug);
  mongoose.Promise = global.Promise;
  const options = {
    config: { autoIndex: false },
    useNewUrlParser: true,
  };
  return mongoose.connect(config.db.uri, options);
}

/**
 * Create an jwt token
 * @param {*} value
 * @param {string} duration in ms() format
 */
function createToken(value, duration) {
  const expireAt = new Date();
  expireAt.setSeconds(expireAt.getSeconds() + (ms(duration) / 1000));
  const token = jwt.sign({ value }, config.appSecret, { expiresIn: duration });
  return {
    value: token,
    expireAt,
  };
}

function decryptToken(token) {
  let data = false;
  try {
    data = jwt.verify(token, config.appSecret);
  } catch (err) {
    // logger.info('Validate access token failed.');
  }
  return data;
}

async function getUserFromRequest(req, User) {
  const auth = req.headers.authorization;
  if (!auth) {
    return null;
  }

  const token = auth.replace('Bearer ', '');
  if (!token) {
    return null;
  }

  const { value } = decryptToken(token);
  if (!value) {
    return false;
  }

  const user = await User.findById(value);
  return user || null;
}

/**
 * Get value of nested property by path
 *
 * @param {Mixed} obj
 * @param {String} path
 * @param {Mixed} defVal default value when the result is undefined
 */
function getObjectValue(obj, path, defVal = undefined) {
  const result = validate.getDeepObjectValue(obj, path);
  return result || defVal;
}

function filterObjectKeys(obj, allowedKeys = []) {
  const result = {};
  allowedKeys.forEach((key) => {
    if (obj[key]) {
      result[key] = obj[key];
    }
  });
  return result;
}

function createWebUrl(path, params = null) {
  const q = params ? `?${querystring.stringify(params)}` : '';
  return `${config.webUrl}/${path}${q}`;
}

function round(number, precision) {
  return parseFloat(number).toFixed(precision);
}

function buildQuery(obj) {
  return Object.keys(obj).map(k => `${encodeURIComponent(k)}=${encodeURIComponent(obj[k])}`).join('&');
}

/**
 * Simple object check.
 * @param item
 * @returns {boolean}
 */
function isObject(item) {
  return (item && typeof item === 'object' && !Array.isArray(item));
}

/**
 * Deep merge multiple objects.
 * Override the first object with the merge result
 * @param target
 * @param ...sources
 */
function deepMerge(target, ...sources) {
  if (!sources.length) return target;
  const source = sources.shift();

  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach((key) => {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} });
        deepMerge(target[key], source[key]);
      } else {
        Object.assign(target, { [key]: source[key] });
      }
    });
  }

  return deepMerge(target, ...sources);
}

/**
 * Deep merge multiple objects
 * Return the merged object without modifying
 */
function mergeObjects(...objects) {
  const result = {};
  deepMerge(result, ...objects);
  return result;
}

function mergeGraphModules(...modules) {
  return modules.reduce((mod, result) => ({
    typeDefs: [...mod.typeDefs, ...result.typeDefs],
    resolvers: mergeObjects(result.resolvers, mod.resolvers),
  }), { typeDefs: '', resolvers: {} });
}

/**
 * Returns an error in case no user
 * is available in the provided context.
 */
function requireAuthenticated(root, args, { user }) {
  return user ? skip : new AuthenticationError('Your must be logged to perform this action');
}

/**
 * Returns an error in case no user is available in the provided context.
 * Or user does not have permission
 *
 * @param  {String} permission
 */
function requirePermission(permission) {
  const resolver = (root, args, { user: { roles } }) => {
    if (roles.includes(permission)) {
      return skip;
    }
    return new ForbiddenError('Your are not allowed to perform this action');
  };
  return combineResolvers(requireAuthenticated, resolver);
}

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

module.exports = {
  connectToDb,
  createToken,
  decryptToken,
  getObjectValue,
  filterObjectKeys,
  createWebUrl,
  round,
  buildQuery,
  getUserFromRequest,
  mergeGraphModules,
  requirePermission,
  escapeRegExp,
};
