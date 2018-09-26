const { mergeGraphModules } = require('../../common/helpers');
const post = require('./post');
const account = require('./account');

module.exports = mergeGraphModules(post, account);
