import { Router } from 'express';
import * as promoCardController from '../controllers/promo-card.controller';

const router = Router();

router.get('/', promoCardController.getPromoCards);

export default router;
