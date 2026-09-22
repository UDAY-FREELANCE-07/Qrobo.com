import { Router } from 'express';
import * as cartController from '../controllers/cart.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', cartController.getCart);
router.post('/merge', cartController.mergeCart);
router.post('/items', cartController.addCartItem);
router.put('/items/:id', cartController.updateCartItem);
router.delete('/items/:id', cartController.removeCartItem);
router.delete('/', cartController.clearCart);

export default router;
