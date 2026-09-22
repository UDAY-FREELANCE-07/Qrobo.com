import { Request, Response, NextFunction } from 'express';
import * as reviewService from '../services/review.service';
import { createReviewSchema, updateReviewSchema, idParamSchema, productIdParamSchema } from '../validators/customer.validator';
import { paginationSchema } from '../validators/public.validator';

export const getProductReviews = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { productId } = productIdParamSchema.parse(req.params);
    const query = paginationSchema.parse(req.query);
    const result = await reviewService.getProductReviews(productId, query);
    res.status(200).json({ status: 'success', data: result });
  } catch (error) {
    next(error);
  }
};

export const createReview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.userId;
    const { productId } = productIdParamSchema.parse(req.params);
    const data = createReviewSchema.parse(req.body);
    const review = await reviewService.createReview(userId, productId, data);
    res.status(201).json({ status: 'success', data: review });
  } catch (error) {
    next(error);
  }
};

export const updateReview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.userId;
    const { id } = idParamSchema.parse(req.params);
    const data = updateReviewSchema.parse(req.body);
    const review = await reviewService.updateReview(id, userId, data);
    res.status(200).json({ status: 'success', data: review });
  } catch (error) {
    next(error);
  }
};

export const deleteReview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.userId;
    const { id } = idParamSchema.parse(req.params);
    await reviewService.deleteReview(id, userId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
