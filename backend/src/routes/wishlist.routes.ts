import { Router } from 'express';
import * as wishlistController from '../controllers/wishlist.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', wishlistController.getWishlist);
router.post('/items', wishlistController.addWishlistItem);
router.delete('/items/:productId', wishlistController.removeWishlistItem);
router.delete('/', wishlistController.clearWishlist);

export default router;
