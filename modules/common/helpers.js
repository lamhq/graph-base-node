const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt-nodejs');
const ms = require('ms');
const mongoose = require('mongoose');
const config = require('../../config');
const validate = require('validate.js');
const querystring = require('querystring');

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

function encryptPassword(value) {
  return bcrypt.hashSync(value);
}

function verifyPassword(value, hash) {
  return bcrypt.compareSync(value, hash);
}

/**
 * Create an access token for user
 * @param {Object} user
 * @param {String} duration
 */
function createToken(user, duration) {
  const expireAt = new Date();
  expireAt.setSeconds(expireAt.getSeconds() + (ms(duration) / 1000));
  const value = jwt.sign({ id: user._id }, config.appSecret, { expiresIn: duration });
  return {
    value,
    expireAt,
  };
}

function verifyToken(token) {
  let result = false;
  try {
    result = jwt.verify(token, config.appSecret);
  } catch (err) {
    // logger.info('Validate access token failed.');
  }
  return result;
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

  const { id } = verifyToken(token);
  if (!id) {
    return false;
  }

  const user = await User.findById(id);
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

function mergeGraphModules(modules) {
  return modules.reduce((mod, result) => ({
    typeDefs: [...mod.typeDefs, ...result.typeDefs],
    resolvers: mergeObjects(mod.resolvers, result.resolvers),
  }), { typeDefs: [], resolvers: {} });
}

module.exports = {
  connectToDb,
  encryptPassword,
  verifyPassword,
  createToken,
  verifyToken,
  getObjectValue,
  filterObjectKeys,
  createWebUrl,
  round,
  buildQuery,
  getUserFromRequest,
  mergeGraphModules,
};
