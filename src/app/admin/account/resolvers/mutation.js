const { combineResolvers } = require('graphql-resolvers');
const { requirePermission } = require('../../../../common/helpers');
const { UserInputError } = require('apollo-server');
const { validateProfileData } = require('../helpers');
const { encryptPassword } = require('../../../../common/helpers');

async function adminUpdateProfile(category, { data }, { user }) {
  const inputErrors = validateProfileData(data, user);
  if (inputErrors) {
    throw new UserInputError('Please correct your inputs', { inputErrors });
  }

  user.email = data.email;
  user.username = data.username;
  user.firstname = data.firstname;
  user.lastname = data.lastname;
  if (data.password) {
    user.password = encryptPassword(data.password);
  }
  await user.save();
  return user;
}

module.exports = {
  adminUpdateProfile: combineResolvers(requirePermission('admin'), adminUpdateProfile),
};
