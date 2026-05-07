const router = require('express').Router();
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { requireAuth, requireRole } = require('../middleware/auth');
const ctrl = require('../controllers/jobController');
const { JOB_TYPES } = require('../models/Job');

const jobValidators = [
  body('title').trim().notEmpty(),
  body('company').trim().notEmpty(),
  body('location').trim().notEmpty(),
  body('description').trim().isLength({ min: 20 }),
  body('type').optional().isIn(JOB_TYPES),
  body('salaryMin').optional().isInt({ min: 0 }),
  body('salaryMax').optional().isInt({ min: 0 }),
  body('skills').optional().isArray(),
];

router.get('/', ctrl.list);
router.get('/mine/posted', requireAuth, requireRole('recruiter', 'admin'), ctrl.myPosted);
router.get('/:id', ctrl.get);
router.post('/', requireAuth, requireRole('recruiter', 'admin'), jobValidators, validate, ctrl.create);
router.put('/:id', requireAuth, requireRole('recruiter', 'admin'), jobValidators, validate, ctrl.update);
router.delete('/:id', requireAuth, requireRole('recruiter', 'admin'), ctrl.remove);

module.exports = router;
