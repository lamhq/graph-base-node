const { makeExecutableSchema } = require('graphql-tools');
const typeDefs = require('./types.gql');
const resolvers = require('./resolvers');

const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

module.exports = schema;
