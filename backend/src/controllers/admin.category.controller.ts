import { Request, Response, NextFunction } from 'express';
import * as categoryService from '../services/admin.category.service';
import { createCategorySchema, updateCategorySchema, idParamSchema } from '../validators/admin.validator';

export const getCategories = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await categoryService.getCategories(req.query as any);
    res.status(200).json({ status: 'success', data: result });
  } catch (error) {
    next(error);
  }
};

export const getCategoryById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = idParamSchema.parse(req.params);
    const category = await categoryService.getCategoryById(id);
    res.status(200).json({ status: 'success', data: category });
  } catch (error) {
    next(error);
  }
};

export const createCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = createCategorySchema.parse(req.body);
    const category = await categoryService.createCategory(data);
    res.status(201).json({ status: 'success', data: category });
  } catch (error) {
    next(error);
  }
};

export const updateCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = idParamSchema.parse(req.params);
    const data = updateCategorySchema.parse(req.body);
    const category = await categoryService.updateCategory(id, data);
    res.status(200).json({ status: 'success', data: category });
  } catch (error) {
    next(error);
  }
};

export const deleteCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = idParamSchema.parse(req.params);
    await categoryService.deleteCategory(id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
