import { Router } from 'express';
import * as brandController from '../controllers/brand.controller';

const router = Router();

router.get('/', brandController.getBrands);
router.get('/:id', brandController.getBrandById);

export default router;
