const Post = require('../app/models/post');

// The root provides a resolver function for each API endpoint
const root = {
  Query: {
    hello: () => 'Hello world!',
    posts: () => Post.find().sort({ _id: -1 }),
    post: (obj, args, context, info) => {
      console.log(args.id);
      return { id: '111', title: '134', content: '567' };
      // return Post.findById('5a45f1efe2aaf906b45f8e8e');
    },
  },
  Post: {
    id: () => Math.random() * 10,
    name: () => 'test',
    content: () => 'content',
  },
};

module.exports = root;
