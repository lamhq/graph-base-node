const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  firstname: { type: String },
  lastname: { type: String },
  password: { type: String, required: true },
  status: { type: String, required: true },
  roles: [{ type: String, required: true }],
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

// available user roles
User.ROLE_ADMIN = 'Admin';
User.ROLE_CUSTOMER = 'Customer';

// available user statuses
User.STATUS_PENDING = 'Pending';
User.STATUS_ACTIVE = 'Active';
User.STATUS_INACTIVE = 'Inactive';

module.exports = User;
