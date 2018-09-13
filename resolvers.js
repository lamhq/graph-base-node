const { GraphQLScalarType } = require('graphql');
const { UserInputError } = require('apollo-server');
const { Kind } = require('graphql/language');
const {
  verifyPassword,
  createToken,
} = require('./modules/common/helpers');

// A map of functions which return data for the schema.
const resolvers = {
  Date: new GraphQLScalarType({
    name: 'Date',
    description: 'Custom scalar type for Date',
    serialize(value) {
      return value.toISOString();
    },
    parseValue(value) {
      return new Date(value);
    },
    parseLiteral(ast) {
      if (ast.kind === Kind.STRING) {
        return new Date(ast.value);
      }
      return null;
    },
  }),
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
    getCategories: async (obj, args, { db }) => {
      const { category } = db.models;
      const categories = await category.find().sort({ name: 1 });
      return categories;
    },
    getCategory: async (obj, { id }, { db }) => {
      const { category } = db.models;
      const item = await category.findById(id);
      return item;
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
  Category: {
    posts: async (category, args, { db }) => {
      const posts = await db.models.post.find({ categoryId: category._id }).sort({ _id: -1 });
      return posts;
    },
    postCount: async (category, args, { db }) => {
      const no = await db.models.post.countDocuments({ categoryId: category._id });
      return no;
    },
  },
};

module.exports = resolvers;
