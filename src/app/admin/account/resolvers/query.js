const { combineResolvers } = require('graphql-resolvers');
const { requirePermission } = require('../../../../common/helpers');

async function getProfile(obj, args, { user }) {
  return user;
}

module.exports = {
  adminGetPosts: combineResolvers(requirePermission('admin'), getProfile),
};

