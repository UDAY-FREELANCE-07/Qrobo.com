import { Request, Response, NextFunction } from 'express';
import * as brandService from '../services/admin.brand.service';
import { createBrandSchema, updateBrandSchema, idParamSchema } from '../validators/admin.validator';

export const getBrands = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await brandService.getBrands(req.query as any);
    res.status(200).json({ status: 'success', data: result });
  } catch (error) {
    next(error);
  }
};

export const getBrandById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = idParamSchema.parse(req.params);
    const brand = await brandService.getBrandById(id);
    res.status(200).json({ status: 'success', data: brand });
  } catch (error) {
    next(error);
  }
};

export const createBrand = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = createBrandSchema.parse(req.body);
    const brand = await brandService.createBrand(data);
    res.status(201).json({ status: 'success', data: brand });
  } catch (error) {
    next(error);
  }
};

export const updateBrand = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = idParamSchema.parse(req.params);
    const data = updateBrandSchema.parse(req.body);
    const brand = await brandService.updateBrand(id, data);
    res.status(200).json({ status: 'success', data: brand });
  } catch (error) {
    next(error);
  }
};

export const deleteBrand = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = idParamSchema.parse(req.params);
    await brandService.deleteBrand(id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
