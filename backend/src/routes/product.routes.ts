import { Router } from 'express';
import * as productController from '../controllers/product.controller';

const router = Router();

router.get('/', productController.getProducts);

// Accepts either a UUID (id) or a slug — detection handled in repository
router.get('/:identifier', productController.getProductByIdentifier);

export default router;

