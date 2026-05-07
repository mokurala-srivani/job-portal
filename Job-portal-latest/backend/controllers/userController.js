const User = require('../models/User');
const Job = require('../models/Job');
const asyncHandler = require('../utils/asyncHandler');

exports.toggleSaved = asyncHandler(async (req, res) => {
  const { jobId } = req.params;
  const job = await Job.findById(jobId);
  if (!job) return res.status(404).json({ message: 'Job not found' });

  const user = await User.findById(req.user._id);
  const idx = user.savedJobs.findIndex((id) => id.toString() === jobId);
  if (idx === -1) user.savedJobs.push(jobId);
  else user.savedJobs.splice(idx, 1);
  await user.save();
  res.json({ savedJobs: user.savedJobs });
});

exports.savedJobs = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('savedJobs');
  res.json({ items: user.savedJobs });
});
