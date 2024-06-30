const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  firstname: { type: String, required: true},
  lastname: { type: String, required: true},  
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email:{ type: String, required: true, unique: true  },
  phone:{ type: String, required: true },
  role: { type: String, enum: ['admin', 'user'], default: 'user' },
  organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
  deletedAt: { type: Date, default: null },
  is_deleted: { type: Boolean, default: false },
  createdAt:{type: Date, default: Date.now},
  updatedAt:{type: Date, default: null},
});

UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

UserSchema.methods.comparePassword = function(userPassword) {
  return bcrypt.compare(userPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
