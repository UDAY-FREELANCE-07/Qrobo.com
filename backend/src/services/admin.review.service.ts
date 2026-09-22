import * as reviewRepository from '../repositories/admin.review.repository';
import { AppError } from '../utils/AppError';
import { getPaginationParams, paginate } from '../utils/pagination.util';

export const getReviews = async (query: any) => {
  const { page, limit, skip } = getPaginationParams(query);
  const { total, items } = await reviewRepository.findReviews(skip, limit, query);
  return paginate(items, total, page, limit);
};

export const getReviewById = async (id: string) => {
  const review = await reviewRepository.findReviewById(id);
  if (!review) {
    throw new AppError('Review not found', 404, 'NOT_FOUND');
  }
  return review;
};

export const updateReview = async (id: string, data: any) => {
  const review = await reviewRepository.findReviewById(id);
  if (!review) {
    throw new AppError('Review not found', 404, 'NOT_FOUND');
  }
  return reviewRepository.updateReview(id, data);
};

export const deleteReview = async (id: string) => {
  const review = await reviewRepository.findReviewById(id);
  if (!review) {
    throw new AppError('Review not found', 404, 'NOT_FOUND');
  }
  await reviewRepository.deleteReview(id);
  return null;
};
