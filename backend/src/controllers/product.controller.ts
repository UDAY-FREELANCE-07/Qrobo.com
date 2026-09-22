import { Request, Response, NextFunction } from 'express';
import * as productService from '../services/product.service';
import { productQuerySchema, idParamSchema } from '../validators/public.validator';

export const getProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = productQuerySchema.parse(req.query);
    const result = await productService.getProducts(query);
    res.status(200).json({
      status: 'success',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getProductById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = idParamSchema.parse(req.params);
    const product = await productService.getProductById(id);
    res.status(200).json({
      status: 'success',
      data: product,
    });
  } catch (error) {
    next(error);
  }
};
