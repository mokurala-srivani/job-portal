const router = require('express').Router();
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { requireAuth, requireRole } = require('../middleware/auth');
const upload = require('../middleware/upload');
const ctrl = require('../controllers/applicationController');
const { STATUSES } = require('../models/Application');

router.post(
  '/',
  requireAuth,
  requireRole('job_seeker'),
  upload.single('resume'),
  [body('jobId').notEmpty()],
  validate,
  ctrl.apply
);

router.get('/me', requireAuth, requireRole('job_seeker'), ctrl.myApplications);
router.get('/job/:jobId', requireAuth, requireRole('recruiter', 'admin'), ctrl.applicantsForJob);

router.patch(
  '/:id/status',
  requireAuth,
  requireRole('recruiter', 'admin'),
  [body('status').isIn(STATUSES)],
  validate,
  ctrl.updateStatus
);

module.exports = router;
