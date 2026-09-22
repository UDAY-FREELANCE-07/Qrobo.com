import { Request, Response, NextFunction } from 'express';
import * as dealService from '../services/admin.deal.service';
import { createDealSchema, updateDealSchema, idParamSchema } from '../validators/admin.validator';

export const getDeals = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await dealService.getDeals(req.query as any);
    res.status(200).json({ status: 'success', data: result });
  } catch (error) {
    next(error);
  }
};

export const getDealById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = idParamSchema.parse(req.params);
    const deal = await dealService.getDealById(id);
    res.status(200).json({ status: 'success', data: deal });
  } catch (error) {
    next(error);
  }
};

export const createDeal = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = createDealSchema.parse(req.body);
    const deal = await dealService.createDeal(data);
    res.status(201).json({ status: 'success', data: deal });
  } catch (error) {
    next(error);
  }
};

export const updateDeal = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = idParamSchema.parse(req.params);
    const data = updateDealSchema.parse(req.body);
    const deal = await dealService.updateDeal(id, data);
    res.status(200).json({ status: 'success', data: deal });
  } catch (error) {
    next(error);
  }
};

export const deleteDeal = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = idParamSchema.parse(req.params);
    await dealService.deleteDeal(id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
