const { expect } = require('chai');
const supertest = require('supertest');
const server = require('../index');
const log = require('../modules/common/log');
const User = require('../modules/common/models/user');

const request = supertest(server);
let token;

async function getApiToken() {
  if (token === undefined) {
    try {
      const user = await User.findOne();
      token = user.createToken().value;
    } catch (error) {
      log.error('Error while generating access token');
      throw error;
    }
  }

  return token;
}

module.exports = {
  expect,
  request,
  getApiToken,
};
