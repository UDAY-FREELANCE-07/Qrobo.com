import { Request, Response, NextFunction } from 'express';
import * as dealService from '../services/deal.service';
import { paginationSchema, idParamSchema } from '../validators/public.validator';

export const getDeals = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = paginationSchema.parse(req.query);
    const result = await dealService.getDeals(query);
    res.status(200).json({
      status: 'success',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getDealById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = idParamSchema.parse(req.params);
    const deal = await dealService.getDealById(id);
    res.status(200).json({
      status: 'success',
      data: deal,
    });
  } catch (error) {
    next(error);
  }
};
