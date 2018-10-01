const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');
const { createToken, decryptToken } = require('../../common/helpers');

const schema = mongoose.Schema({
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  firstname: { type: String },
  lastname: { type: String },
  password: { type: String, required: true },
  status: { type: String, required: true },
  roles: [{ type: String, required: true }],
}, { timestamps: true });

class ModelClass {
  /**
   * Update password for user
   * @param {string} value raw password
   */
  setPassword(value) {
    const hash = bcrypt.hashSync(value);
    this.password = hash;
  }

  /**
   * Check password valid
   * @param {boolean} value
   */
  isPasswordValid(value) {
    return bcrypt.compareSync(value, this.password);
  }

  /**
   * Generate a token object for reseting password
   * @param {String} duration
   */
  createToken(duration) {
    return createToken(this._id, duration);
  }

  /**
   * Check if token is valid
   * @param {String} value
   */
  isTokenValid(value) {
    const data = decryptToken(value);
    return data && data.value === this._id;
  }
}

schema.loadClass(ModelClass);

const User = mongoose.model('User', schema);

// available user roles
User.ROLE_ADMIN = 'Admin';
User.ROLE_CUSTOMER = 'Customer';

// available user statuses
User.STATUS_PENDING = 'Pending';
User.STATUS_ACTIVE = 'Active';
User.STATUS_INACTIVE = 'Inactive';

module.exports = User;
