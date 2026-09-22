import { Request, Response, NextFunction } from 'express';
import * as reviewService from '../services/admin.review.service';
import { idParamSchema } from '../validators/admin.validator';

export const getReviews = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await reviewService.getReviews(req.query as any);
    res.status(200).json({ status: 'success', data: result });
  } catch (error) {
    next(error);
  }
};

export const getReviewById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = idParamSchema.parse(req.params);
    const review = await reviewService.getReviewById(id);
    res.status(200).json({ status: 'success', data: review });
  } catch (error) {
    next(error);
  }
};

export const updateReview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = idParamSchema.parse(req.params);
    const review = await reviewService.updateReview(id, req.body);
    res.status(200).json({ status: 'success', data: review });
  } catch (error) {
    next(error);
  }
};

export const deleteReview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = idParamSchema.parse(req.params);
    await reviewService.deleteReview(id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
