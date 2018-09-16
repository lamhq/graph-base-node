const fs = require('fs');

// enable importing graphql schema file (*.gql)
require.extensions['.gql'] = (module, filename) => {
  module.exports = fs.readFileSync(filename, 'utf8');
};

// load environment variables from .env file
require('dotenv').config();

const { ApolloServer } = require('apollo-server');
const { connectToDb, getUserFromRequest } = require('./src/common/helpers');
const { port } = require('./config');
const logger = require('./src/common/log');
const models = require('./src/app/models');
const { typeDefs, resolvers } = require('./src');

// create apollo server
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }) => {
    // get user identity from request
    const user = await getUserFromRequest(req, models.User);
    return {
      user,
      db: {
        models,
      },
    };
  },
  formatError: (error) => {
    logger.error(error.extensions.exception.stacktrace.join('\n'));
    return error;
  },
});

// entry point function
async function run() {
  try {
    await connectToDb();
    logger.info('Connected to database');
    const { url } = await server.listen({ port });
    logger.info(`🚀 Server ready at ${url}`);
  } catch (error) {
    logger.error(error.stack);
  }
}

run();
