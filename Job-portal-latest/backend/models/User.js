const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const ROLES = ['job_seeker', 'recruiter', 'admin'];

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ROLES, default: 'job_seeker' },
    savedJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Job' }],
  },
  { timestamps: true }
);

userSchema.methods.setPassword = async function (plain) {
  this.passwordHash = await bcrypt.hash(plain, 10);
};

userSchema.methods.verifyPassword = function (plain) {
  return bcrypt.compare(plain, this.passwordHash);
};

userSchema.methods.toJSON = function () {
  const { passwordHash, __v, ...rest } = this.toObject();
  return rest;
};

module.exports = mongoose.model('User', userSchema);
module.exports.ROLES = ROLES;
