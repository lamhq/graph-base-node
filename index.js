require('dotenv').config();
const { ApolloServer, gql } = require('apollo-server');
const models = require('./modules/app/models');
const { connectToDb } = require('./modules/common/helpers');

// The GraphQL schema
const typeDefs = gql`
type Query {
  getPosts: [Post]
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
`;

// A map of functions which return data for the schema.
const resolvers = {
  Query: {
    getPosts: (obj, args, context, info) => context.db.models.post.find(),
  },
  Post: {
    category: (post, args, context, info) => {
      if (!post.categoryId) {
        return null;
      }
      return context.db.models.category.findById(post.categoryId);
    },
    author: (post, args, context, info) => {
      if (!post.authorId) {
        return null;
      }
      return context.db.models.user.findById(post.authorId);
    },
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => ({

    db: {
      models,
    },
  }),
});

server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
  connectToDb();
});
