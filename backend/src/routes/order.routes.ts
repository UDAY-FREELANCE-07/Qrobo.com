import { Router } from 'express';
import * as orderController from '../controllers/order.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', orderController.getOrders);
router.post('/', orderController.checkout);
router.get('/:id', orderController.getOrderById);

export default router;
