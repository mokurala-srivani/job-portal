const router = require('express').Router();
const { requireAuth, requireRole } = require('../middleware/auth');
const ctrl = require('../controllers/userController');

router.post('/saved/:jobId', requireAuth, requireRole('job_seeker'), ctrl.toggleSaved);
router.get('/saved', requireAuth, requireRole('job_seeker'), ctrl.savedJobs);

module.exports = router;
