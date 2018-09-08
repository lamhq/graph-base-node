require('dotenv').config();
const { ApolloServer, gql, UserInputError } = require('apollo-server');
const models = require('./modules/app/models');
const {
  connectToDb,
  verifyPassword,
  createToken,
  verifyToken,
} = require('./modules/common/helpers');
const logger = require('./modules/common/log');

// The GraphQL schema
const typeDefs = gql`
type Query {
  getPosts: [Post]
  getAccessToken(email: String, password: String): AccessToken
}

type User {
  email: String,
  firstname: String,
  lastname: String,
  username: String,
  roles: [String],
  status: String,
  post: [Post]
}

type Category {
  name: String,
  parent: Category,
  posts: [Post]
}

type Post {
  title: String,
  content: String,
  category: Category,
  author: User
}

type AccessToken {
  value: String,
  expireAt: String,
  user: User
}
`;

// A map of functions which return data for the schema.
const resolvers = {
  Query: {
    getPosts: async (obj, args, { db, user }) => {
      const { post } = db.models;
      const filter = {};
      if (!user) {
        filter.status = post.STATUS_ACTIVE;
      }
      const posts = await post.find(filter).sort({ _id: -1 });
      return posts;
    },
    getAccessToken: async (obj, { email, password }, context) => {
      const user = await context.db.models.user.findOne({ email });
      if (!user || !verifyPassword(password, user.password)) {
        throw new UserInputError('Incorrect email or password');
      }
      const { value, expireAt } = createToken(user, '3h');
      return {
        value,
        expireAt,
        user,
      };
    },
  },
  Post: {
    category: async (post, args, context) => {
      if (!post.categoryId) {
        return null;
      }
      const category = await context.db.models.category.findById(post.categoryId);
      return category;
    },
    author: async (post, args, context) => {
      if (!post.authorId) {
        return null;
      }
      const user = await context.db.models.user.findById(post.authorId);
      return user;
    },
  },
};


async function getUserContext(req, model) {
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

  const user = await model.findById(id);
  return user || null;
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }) => {
    const user = await getUserContext(req, models.user);
    return {
      // get current logged user data here
      user,

      // database content
      db: {
        models,
      },
    };
  },
});

server.listen().then(({ url }) => {
  logger.info(`🚀 Server ready at ${url}`);
  connectToDb();
});
