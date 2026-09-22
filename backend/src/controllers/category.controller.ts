import { Request, Response, NextFunction } from 'express';
import * as categoryService from '../services/category.service';
import { categoryQuerySchema, idParamSchema } from '../validators/public.validator';

export const getCategories = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = categoryQuerySchema.parse(req.query);
    const result = await categoryService.getCategories(query);
    res.status(200).json({
      status: 'success',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getCategoryById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = idParamSchema.parse(req.params);
    const category = await categoryService.getCategoryById(id);
    res.status(200).json({
      status: 'success',
      data: category,
    });
  } catch (error) {
    next(error);
  }
};
