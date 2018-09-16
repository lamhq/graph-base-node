const { mergeGraphModules } = require('../common/helpers');
const publicModule = require('./public');
const typeDefs = require('./types');
const resolvers = require('./resolvers');

const appModule = {
  typeDefs,
  resolvers,
};

module.exports = mergeGraphModules(appModule, publicModule);
