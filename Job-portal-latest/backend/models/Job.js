const mongoose = require('mongoose');

const JOB_TYPES = ['full-time', 'part-time', 'contract', 'internship', 'remote'];

const jobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    company: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true, index: true },
    salaryMin: { type: Number, min: 0 },
    salaryMax: { type: Number, min: 0 },
    type: { type: String, enum: JOB_TYPES, default: 'full-time', index: true },
    description: { type: String, required: true },
    skills: { type: [String], default: [], index: true },
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

jobSchema.index({ title: 'text', description: 'text', skills: 'text', company: 'text' });
jobSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Job', jobSchema);
module.exports.JOB_TYPES = JOB_TYPES;
