const router = require('express').Router();
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { requireAuth } = require('../middleware/auth');
const ctrl = require('../controllers/authController');

router.post(
  '/register',
  [
    body('name').trim().isLength({ min: 2 }).withMessage('Name too short'),
    body('email').isEmail().withMessage('Invalid email').normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Password must be 6+ chars'),
    body('role').optional().isIn(['job_seeker', 'recruiter']),
  ],
  validate,
  ctrl.register
);

router.post(
  '/login',
  [body('email').isEmail().normalizeEmail(), body('password').notEmpty()],
  validate,
  ctrl.login
);

router.get('/me', requireAuth, ctrl.me);

module.exports = router;
