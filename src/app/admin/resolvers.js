
// Mutation: {
//   addPost: async (obj, { data }, { db }) => {
//     const post = new db.models.Post();
//     // validate data
//     post.title = data.title;
//     post.content = data.content;
//     post.categoryId = data.categoryId;
//     post.status = data.status;
//     await post.save();
//     return post;
//   },
// },
