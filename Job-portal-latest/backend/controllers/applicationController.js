const path = require('path');
const fs = require('fs');
const Application = require('../models/Application');
const Job = require('../models/Job');
const asyncHandler = require('../utils/asyncHandler');

const safeUnlink = (p) => { if (p) fs.promises.unlink(p).catch(() => {}); };

exports.apply = asyncHandler(async (req, res) => {
  const { jobId, coverLetter } = req.body;
  if (!req.file) return res.status(400).json({ message: 'Resume file required' });

  const job = await Job.findById(jobId);
  if (!job) {
    safeUnlink(req.file.path);
    return res.status(404).json({ message: 'Job not found' });
  }

  const exists = await Application.findOne({ job: jobId, applicant: req.user._id });
  if (exists) {
    safeUnlink(req.file.path);
    return res.status(409).json({ message: 'You already applied to this job' });
  }

  const resumeUrl = `/uploads/${path.basename(req.file.path)}`;
  const app = await Application.create({
    job: jobId,
    applicant: req.user._id,
    resumeUrl,
    coverLetter: coverLetter || '',
  });
  res.status(201).json(app);
});

exports.myApplications = asyncHandler(async (req, res) => {
  const items = await Application.find({ applicant: req.user._id })
    .sort({ createdAt: -1 })
    .populate('job');
  res.json({ items });
});

exports.applicantsForJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.jobId);
  if (!job) return res.status(404).json({ message: 'Job not found' });
  if (req.user.role !== 'admin' && job.postedBy.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  const items = await Application.find({ job: job._id })
    .sort({ createdAt: -1 })
    .populate('applicant', 'name email');
  res.json({ items });
});

exports.updateStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const app = await Application.findById(req.params.id).populate('job');
  if (!app) return res.status(404).json({ message: 'Application not found' });
  if (req.user.role !== 'admin' && app.job.postedBy.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  app.status = status;
  await app.save();
  res.json(app);
});
