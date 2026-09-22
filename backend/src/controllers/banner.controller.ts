import { Request, Response, NextFunction } from 'express';
import * as bannerService from '../services/banner.service';
import { paginationSchema } from '../validators/public.validator';

export const getBanners = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = paginationSchema.parse(req.query);
    const result = await bannerService.getBanners(query);
    res.status(200).json({
      status: 'success',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
