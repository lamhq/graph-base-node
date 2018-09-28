const validate = require('validate.js');
const { combineResolvers } = require('graphql-resolvers');
const { requirePermission } = require('../../../../common/helpers');
const { UserInputError } = require('apollo-server');
const { encryptPassword } = require('../../../../common/helpers');

/**
 * validate and filter input from profile form
 * @param  object form input
 * @param  User mongoose user model
 * @return object list of validation errors or null
 */
function validateProfileData(data, user) {
  // function that perform password validation
  validate.validators.checkPassword = (value) => {
    if (value && !user.checkPassword(value)) { return 'is wrong'; }
    return null;
  };

  // validation rules
  const rules = {
    username: {
      presence: true,
      length: { minimum: 3, maximum: 30 },
      format: {
        pattern: '[a-z0-9]+',
        flags: 'i',
        message: 'can only contain alphabet and numeric characters',
      },
    },
    email: {
      presence: true,
      email: true,
    },
    password: value =>
      // only validate when value is not empty
      (value ? {
        length: { minimum: 6, maximum: 30 },
      } : false),
    currentPassword: (value, attributes) =>
      // only validate when password is not empty
      (attributes.password ? {
        presence: true,
        checkPassword: true,
      } : false)
    ,
  };

  return validate(data, rules);
}

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
