const validate = require('validate.js');

function validatePost(data) {
  const rules = {
    title: {
      presence: { allowEmpty: false },
    },
    content: {
      presence: { allowEmpty: false },
    },
  };

  return validate(data, rules);
}

function getQueryData({ q, limit = 4, page = 1 }) {
  const limit2 = parseInt(limit, 10);
  const page2 = parseInt(page, 10);
  const conditions = {};

  // apply text search
  if (q) {
    conditions.title = new RegExp(q, 'i');
    conditions.content = new RegExp(q, 'i');
  }

  // calculate offset
  const offset = (page2 - 1) * limit2;
  return {
    conditions,
    limit: limit2,
    page,
    offset,
  };
}

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

module.exports = {
  validatePost,
  getQueryData,
  validateProfileData,
};
