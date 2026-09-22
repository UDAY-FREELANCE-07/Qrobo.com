import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

router.post('/signup', authController.signup);
router.post('/signin', authController.signin);
router.post('/signout', authController.signout);
router.post('/refresh', authController.refresh);

// Protected routes
router.get('/me', authenticate, authController.me);
router.put('/profile', authenticate, authController.updateProfile);
router.put('/password', authenticate, authController.updatePassword);

// Example admin route for testing
router.get('/admin-only', authenticate, authorize('ADMIN'), (req, res) => {
  res.status(200).json({ status: 'success', message: 'Welcome Admin' });
});

export default router;
