const fs = require('fs');

// enable importing graphql schema file (*.gql)
require.extensions['.gql'] = (module, filename) => {
  module.exports = fs.readFileSync(filename, 'utf8');
};

// load environment variables from .env file
require('dotenv').config();

const { ApolloServer } = require('apollo-server');
const { connectToDb, getUserFromRequest } = require('./modules/common/helpers');
const models = require('./modules/app/models');
const logger = require('./modules/common/log');
const { port } = require('./config');
const schema = require('./schema');

// create apollo server
const server = new ApolloServer({
  schema,
  context: async ({ req }) => {
    // get user identity from request
    const user = await getUserFromRequest(req, models.user);
    return {
      user,
      db: {
        models,
      },
    };
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
