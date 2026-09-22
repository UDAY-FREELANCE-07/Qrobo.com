import { Request, Response, NextFunction } from 'express';
import * as productService from '../services/admin.product.service';
import { createProductSchema, updateProductSchema, idParamSchema } from '../validators/admin.validator';

export const getProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await productService.getProducts(req.query as any);
    res.status(200).json({ status: 'success', data: result });
  } catch (error) {
    next(error);
  }
};

export const getProductById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = idParamSchema.parse(req.params);
    const product = await productService.getProductById(id);
    res.status(200).json({ status: 'success', data: product });
  } catch (error) {
    next(error);
  }
};

export const createProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = createProductSchema.parse(req.body);
    const product = await productService.createProduct(data);
    res.status(201).json({ status: 'success', data: product });
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = idParamSchema.parse(req.params);
    const data = updateProductSchema.parse(req.body);
    const product = await productService.updateProduct(id, data);
    res.status(200).json({ status: 'success', data: product });
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = idParamSchema.parse(req.params);
    await productService.deleteProduct(id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
