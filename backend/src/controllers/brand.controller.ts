import { Request, Response, NextFunction } from 'express';
import * as brandService from '../services/brand.service';
import { brandQuerySchema, idParamSchema } from '../validators/public.validator';

export const getBrands = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = brandQuerySchema.parse(req.query);
    const result = await brandService.getBrands(query);
    res.status(200).json({
      status: 'success',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getBrandById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = idParamSchema.parse(req.params);
    const brand = await brandService.getBrandById(id);
    res.status(200).json({
      status: 'success',
      data: brand,
    });
  } catch (error) {
    next(error);
  }
};
