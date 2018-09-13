require('dotenv').config();

const { ApolloServer } = require('apollo-server');
const { connectToDb, getUserFromRequest } = require('./modules/common/helpers');
const models = require('./modules/app/models');
const logger = require('./modules/common/log');
const resolvers = require('./resolvers');
const schema = require('./schema');

const server = new ApolloServer({
  schema,
  resolvers,
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

async function run() {
  try {
    await connectToDb();
    const { url } = await server.listen();
    logger.info(`🚀 Server ready at ${url}`);
  } catch (error) {
    logger.error(error.stack);
  }
}

run();
