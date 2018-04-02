const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt-nodejs')
const ms = require('ms')
const mongoose = require('mongoose')
const config = require('../../config')

function notFoundExc(message) {
  return {
    status: 404,
    code: 'resource_not_found',
    message: message,
  }
}

function validationExc(message, errors) {
  return {
    status: 400,
    code: 'invalid_data',
    message: message,
    errors: errors,
  }
}

function unauthorizedExc(message) {
  return {
    status: 401,
    code: 'unauthorized',
    message: message,
  }
}

/**
 * @returns Promise
 */
function connectToDb() {
  mongoose.set('debug', config.db.debug)
  mongoose.Promise = global.Promise
  var options = {
    config: { autoIndex: false },
    useMongoClient: true,
  }
  return mongoose.connect(config.db.uri, options)
}

function encryptPassword(value) {
  return bcrypt.hashSync(value)
}

function verifyPassword(value, hash) {
  return bcrypt.compareSync(value, hash)
}

/**
 * Create an access token for user
 * @param {Object} user
 * @param {String} duration
 */
function createToken(user, duration) {
  var expiredAt = new Date()
  expiredAt.setSeconds(expiredAt.getSeconds() + ms(duration) / 1000)
  var value = jwt.sign({ userId: user._id }, config.appSecret, { expiresIn: duration })
  return {
    value,
    expiredAt
  }
}

function verifyToken(token) {
  var result = false
  try {
    result = jwt.verify(token, config.appSecret)
  } catch (err) {
    logger.info('Validate access token failed.')
  }
  return result
}

/**
 * Get value of nested property by path
 *
 * @param {Mixed} obj
 * @param {String} path
 * @param {Mixed} defVal default value when the result is undefined
 */
function getObjectValue(obj, path, defVal = undefined) {
  try {
    for (var i = 0, path = path.split('.'), len = path.length; i < len; i++) {
      obj = obj[path[i]]
      if (obj === undefined)
        return defVal
    }
    return obj
  } catch (error) {
    return defVal
  }
}

module.exports = {
  notFoundExc,
  validationExc,
  unauthorizedExc,
  connectToDb,
  encryptPassword,
  verifyPassword,
  createToken,
  verifyToken,
  getObjectValue,
}