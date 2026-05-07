const Job = require('../models/Job');
const asyncHandler = require('../utils/asyncHandler');

exports.list = asyncHandler(async (req, res) => {
  const { q, location, type, skills, page = 1, limit = 12 } = req.query;
  const filter = { isActive: true };
  if (q) filter.$text = { $search: q };
  if (location) filter.location = new RegExp(location, 'i');
  if (type) filter.type = type;
  if (skills) {
    const arr = String(skills).split(',').map((s) => s.trim()).filter(Boolean);
    if (arr.length) filter.skills = { $in: arr.map((s) => new RegExp(`^${s}$`, 'i')) };
  }

  const lim = Math.min(50, Math.max(1, Number(limit)));
  const pg = Math.max(1, Number(page));
  const skip = (pg - 1) * lim;

  const [items, total] = await Promise.all([
    Job.find(filter).sort({ createdAt: -1 }).skip(skip).limit(lim).populate('postedBy', 'name email'),
    Job.countDocuments(filter),
  ]);

  res.json({ items, total, page: pg, pages: Math.ceil(total / lim), limit: lim });
});

exports.get = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id).populate('postedBy', 'name email');
  if (!job) return res.status(404).json({ message: 'Job not found' });
  res.json(job);
});

exports.create = asyncHandler(async (req, res) => {
  const job = await Job.create({ ...req.body, postedBy: req.user._id });
  res.status(201).json(job);
});

const UPDATABLE = ['title', 'company', 'location', 'salaryMin', 'salaryMax', 'type', 'description', 'skills', 'isActive'];

exports.update = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);
  if (!job) return res.status(404).json({ message: 'Job not found' });
  if (req.user.role !== 'admin' && job.postedBy.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  for (const key of UPDATABLE) {
    if (Object.prototype.hasOwnProperty.call(req.body, key)) job[key] = req.body[key];
  }
  await job.save();
  res.json(job);
});

exports.remove = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);
  if (!job) return res.status(404).json({ message: 'Job not found' });
  if (req.user.role !== 'admin' && job.postedBy.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  await job.deleteOne();
  res.json({ ok: true });
});

exports.myPosted = asyncHandler(async (req, res) => {
  const items = await Job.find({ postedBy: req.user._id }).sort({ createdAt: -1 });
  res.json({ items });
});
