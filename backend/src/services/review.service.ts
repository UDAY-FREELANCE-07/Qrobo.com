import * as reviewRepository from '../repositories/review.repository';
import * as productRepository from '../repositories/product.repository';
import { CreateReviewInput, UpdateReviewInput } from '../validators/customer.validator';
import { AppError } from '../utils/AppError';
import { getPaginationParams, paginate } from '../utils/pagination.util';
import { PaginationQuery } from '../validators/public.validator';

export const getProductReviews = async (productId: string, query: PaginationQuery) => {
  const { page, limit, skip } = getPaginationParams(query);
  const { total, items } = await reviewRepository.findReviewsByProductId(productId, skip, limit);
  return paginate(items, total, page, limit);
};

export const createReview = async (userId: string, productId: string, data: CreateReviewInput) => {
  const product = await productRepository.findProductById(productId);
  if (!product) {
    throw new AppError('Product not found', 404, 'NOT_FOUND');
  }

  const existingReview = await reviewRepository.findReviewByUserAndProduct(userId, productId);
  if (existingReview) {
    throw new AppError('You have already reviewed this product', 400, 'BAD_REQUEST');
  }

  return reviewRepository.createReview(userId, productId, data);
};

export const updateReview = async (id: string, userId: string, data: UpdateReviewInput) => {
  const review = await reviewRepository.findReviewByIdAndUserId(id, userId);
  if (!review) {
    throw new AppError('Review not found or you do not have permission', 404, 'NOT_FOUND');
  }

  return reviewRepository.updateReview(id, data);
};

export const deleteReview = async (id: string, userId: string) => {
  const review = await reviewRepository.findReviewByIdAndUserId(id, userId);
  if (!review) {
    throw new AppError('Review not found or you do not have permission', 404, 'NOT_FOUND');
  }

  await reviewRepository.deleteReview(id);
  return null;
};
