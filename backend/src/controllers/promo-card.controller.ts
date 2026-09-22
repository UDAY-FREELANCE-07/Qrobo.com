import { Request, Response, NextFunction } from 'express';
import * as promoCardService from '../services/promo-card.service';
import { paginationSchema } from '../validators/public.validator';

export const getPromoCards = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = paginationSchema.parse(req.query);
    const result = await promoCardService.getPromoCards(query);
    res.status(200).json({
      status: 'success',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
