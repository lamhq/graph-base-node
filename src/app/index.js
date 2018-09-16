const { mergeGraphModules } = require('../common/helpers');
const pub = require('./public');
const admin = require('./admin');
const typeDefs = require('./types');
const resolvers = require('./resolvers');

const app = {
  typeDefs,
  resolvers,
};

module.exports = mergeGraphModules(app, pub, admin);
