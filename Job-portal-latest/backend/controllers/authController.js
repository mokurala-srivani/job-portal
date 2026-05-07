const User = require('../models/User');
const { sign } = require('../utils/token');
const asyncHandler = require('../utils/asyncHandler');

exports.register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;
  const exists = await User.findOne({ email });
  if (exists) return res.status(409).json({ message: 'Email already registered' });
  const user = new User({ name, email, role: role === 'recruiter' ? 'recruiter' : 'job_seeker' });
  await user.setPassword(password);
  await user.save();
  res.status(201).json({ user, token: sign(user) });
});

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !(await user.verifyPassword(password))) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  res.json({ user, token: sign(user) });
});

exports.me = asyncHandler(async (req, res) => {
  res.json({ user: req.user });
});
