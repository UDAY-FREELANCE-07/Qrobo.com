import { Router } from 'express';
import { getHealth } from '../controllers/health.controller';
import authRoutes from './auth.routes';
import productRoutes from './product.routes';
import categoryRoutes from './category.routes';
import brandRoutes from './brand.routes';
import dealRoutes from './deal.routes';
import bannerRoutes from './banner.routes';
import promoCardRoutes from './promo-card.routes';
import projectRoutes from './project.routes';
import tutorialRoutes from './tutorial.routes';

import addressRoutes from './address.routes';
import cartRoutes from './cart.routes';
import wishlistRoutes from './wishlist.routes';
import orderRoutes from './order.routes';
import reviewRoutes from './review.routes';

import adminRoutes from './admin.routes';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// Health Check
router.get('/health', getHealth);

// Auth Routes
router.use('/auth', authRoutes);

// Public API Routes
router.use('/products', productRoutes);
router.use('/categories', categoryRoutes);
router.use('/brands', brandRoutes);
router.use('/deals', dealRoutes);
router.use('/banners', bannerRoutes);
router.use('/promo-cards', promoCardRoutes);
router.use('/projects', projectRoutes);
router.use('/tutorials', tutorialRoutes);
router.use('/coupons', require('./coupon.routes').default);

// Customer API Routes
router.use('/addresses', addressRoutes);
router.use('/cart', cartRoutes);
router.use('/wishlist', wishlistRoutes);
router.use('/orders', orderRoutes);
router.use('/', reviewRoutes); // Handles /products/:productId/reviews and /reviews/:id

// Admin API Routes
router.use('/admin', authenticate, authorize('ADMIN'), adminRoutes);

export default router;
