const mongoose = require('mongoose');

const STATUSES = ['pending', 'reviewed', 'shortlisted', 'rejected', 'hired'];

const applicationSchema = new mongoose.Schema(
  {
    job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true, index: true },
    applicant: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    resumeUrl: { type: String, required: true },
    coverLetter: { type: String, default: '' },
    status: { type: String, enum: STATUSES, default: 'pending' },
  },
  { timestamps: true }
);

applicationSchema.index({ job: 1, applicant: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);
module.exports.STATUSES = STATUSES;
