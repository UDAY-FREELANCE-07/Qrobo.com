import { Router } from 'express';
import * as reviewController from '../controllers/review.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Public endpoint
router.get('/products/:productId/reviews', reviewController.getProductReviews);

// Authenticated endpoints
router.post('/products/:productId/reviews', authenticate, reviewController.createReview);
router.put('/reviews/:id', authenticate, reviewController.updateReview);
router.delete('/reviews/:id', authenticate, reviewController.deleteReview);

export default router;
