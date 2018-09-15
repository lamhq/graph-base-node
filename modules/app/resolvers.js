const { GraphQLScalarType } = require('graphql');
const { UserInputError } = require('apollo-server');
const { Kind } = require('graphql/language');
const {
  verifyPassword,
  createToken,
} = require('../common/helpers');

// A map of functions which return data for the schema.
const resolvers = {
  Date: new GraphQLScalarType({
    name: 'Date',
    description: 'A string represent date in ISO format',
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
      const { Post } = db.models;
      const filter = {};
      if (!user) {
        filter.status = Post.STATUS_ACTIVE;
      }
      const posts = await Post.find(filter).sort({ _id: -1 });
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
      const user = await context.db.models.User.findOne({ email });
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
  Mutation: {
    addPost: async (obj, { data }, { db }) => {
      const post = new db.models.Post();
      // validate data
      post.title = data.title;
      post.content = data.content;
      post.categoryId = data.categoryId;
      post.status = data.status;
      await post.save();
      return post;
    },
  },
  Post: {
    category: async (post, args, context) => {
      if (!post.categoryId) {
        return null;
      }
      const category = await context.db.models.Category.findById(post.categoryId);
      return category;
    },
    author: async (post, args, context) => {
      if (!post.authorId) {
        return null;
      }
      const user = await context.db.models.User.findById(post.authorId);
      return user;
    },
  },
  Category: {
    posts: async (category, args, { db }) => {
      const posts = await db.models.Post.find({ categoryId: category._id }).sort({ _id: -1 });
      return posts;
    },
    postCount: async (category, args, { db }) => {
      const no = await db.models.Post.countDocuments({ categoryId: category._id });
      return no;
    },
  },
};

module.exports = resolvers;
