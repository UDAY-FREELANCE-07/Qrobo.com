import { Router } from 'express';

import * as dashboardController from '../controllers/admin.dashboard.controller';
import * as productController from '../controllers/admin.product.controller';
import * as categoryController from '../controllers/admin.category.controller';
import * as brandController from '../controllers/admin.brand.controller';
import * as bannerController from '../controllers/admin.banner.controller';
import * as promoCardController from '../controllers/admin.promo-card.controller';
import * as dealController from '../controllers/admin.deal.controller';
import * as couponController from '../controllers/admin.coupon.controller';
import * as orderController from '../controllers/admin.order.controller';
import * as customerController from '../controllers/admin.customer.controller';
import * as reviewController from '../controllers/admin.review.controller';
import * as projectController from '../controllers/admin.project.controller';
import * as tutorialController from '../controllers/admin.tutorial.controller';

const router = Router();

// Dashboard
router.get('/dashboard', dashboardController.getDashboardStats);

// Products
router.get('/products', productController.getProducts);
router.post('/products', productController.createProduct);
router.get('/products/:id', productController.getProductById);
router.put('/products/:id', productController.updateProduct);
router.delete('/products/:id', productController.deleteProduct);

// Categories
router.get('/categories', categoryController.getCategories);
router.post('/categories', categoryController.createCategory);
router.get('/categories/:id', categoryController.getCategoryById);
router.put('/categories/:id', categoryController.updateCategory);
router.delete('/categories/:id', categoryController.deleteCategory);

// Brands
router.get('/brands', brandController.getBrands);
router.post('/brands', brandController.createBrand);
router.get('/brands/:id', brandController.getBrandById);
router.put('/brands/:id', brandController.updateBrand);
router.delete('/brands/:id', brandController.deleteBrand);

// Banners
router.get('/banners', bannerController.getBanners);
router.post('/banners', bannerController.createBanner);
router.get('/banners/:id', bannerController.getBannerById);
router.put('/banners/:id', bannerController.updateBanner);
router.delete('/banners/:id', bannerController.deleteBanner);

// Promo Cards
router.get('/promo-cards', promoCardController.getPromoCards);
router.post('/promo-cards', promoCardController.createPromoCard);
router.get('/promo-cards/:id', promoCardController.getPromoCardById);
router.put('/promo-cards/:id', promoCardController.updatePromoCard);
router.delete('/promo-cards/:id', promoCardController.deletePromoCard);

// Deals
router.get('/deals', dealController.getDeals);
router.post('/deals', dealController.createDeal);
router.get('/deals/:id', dealController.getDealById);
router.put('/deals/:id', dealController.updateDeal);
router.delete('/deals/:id', dealController.deleteDeal);

// Coupons
router.get('/coupons', couponController.getCoupons);
router.post('/coupons', couponController.createCoupon);
router.get('/coupons/:id', couponController.getCouponById);
router.put('/coupons/:id', couponController.updateCoupon);
router.delete('/coupons/:id', couponController.deleteCoupon);

// Orders
router.get('/orders', orderController.getOrders);
router.get('/orders/:id', orderController.getOrderById);
router.put('/orders/:id/status', orderController.updateOrderStatus);

// Customers
router.get('/customers', customerController.getCustomers);
router.get('/customers/:id', customerController.getCustomerById);

// Reviews
router.get('/reviews', reviewController.getReviews);
router.get('/reviews/:id', reviewController.getReviewById);
router.put('/reviews/:id', reviewController.updateReview);
router.delete('/reviews/:id', reviewController.deleteReview);

// Projects
router.get('/projects', projectController.getProjects);
router.post('/projects', projectController.createProject);
router.get('/projects/:id', projectController.getProjectById);
router.put('/projects/:id', projectController.updateProject);
router.delete('/projects/:id', projectController.deleteProject);

// Tutorials
router.get('/tutorials', tutorialController.getTutorials);
router.post('/tutorials', tutorialController.createTutorial);
router.get('/tutorials/:id', tutorialController.getTutorialById);
router.put('/tutorials/:id', tutorialController.updateTutorial);
router.delete('/tutorials/:id', tutorialController.deleteTutorial);

export default router;
