import { Request, Response, NextFunction } from 'express';
import * as customerService from '../services/admin.customer.service';
import { idParamSchema } from '../validators/admin.validator';

export const getCustomers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await customerService.getCustomers(req.query as any);
    res.status(200).json({ status: 'success', data: result });
  } catch (error) {
    next(error);
  }
};

export const getCustomerById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = idParamSchema.parse(req.params);
    const customer = await customerService.getCustomerById(id);
    res.status(200).json({ status: 'success', data: customer });
  } catch (error) {
    next(error);
  }
};
