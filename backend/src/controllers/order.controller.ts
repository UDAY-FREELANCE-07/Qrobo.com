import { Request, Response, NextFunction } from 'express';
import * as orderService from '../services/order.service';
import { checkoutSchema, idParamSchema } from '../validators/customer.validator';
import { paginationSchema } from '../validators/public.validator';

export const getOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.userId;
    const query = paginationSchema.parse(req.query);
    const result = await orderService.getOrders(userId, query);
    res.status(200).json({ status: 'success', data: result });
  } catch (error) {
    next(error);
  }
};

export const getOrderById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.userId;
    const { id } = idParamSchema.parse(req.params);
    const order = await orderService.getOrderById(id, userId);
    res.status(200).json({ status: 'success', data: order });
  } catch (error) {
    next(error);
  }
};

export const checkout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.userId;
    const data = checkoutSchema.parse(req.body);
    const order = await orderService.checkout(userId, data);
    res.status(201).json({ status: 'success', data: order });
  } catch (error) {
    next(error);
  }
};
