import { Request, Response, NextFunction } from 'express';
import * as orderService from '../services/admin.order.service';
import { updateOrderStatusSchema, idParamSchema } from '../validators/admin.validator';

export const getOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await orderService.getOrders(req.query as any);
    res.status(200).json({ status: 'success', data: result });
  } catch (error) {
    next(error);
  }
};

export const getOrderById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = idParamSchema.parse(req.params);
    const order = await orderService.getOrderById(id);
    res.status(200).json({ status: 'success', data: order });
  } catch (error) {
    next(error);
  }
};

export const updateOrderStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = idParamSchema.parse(req.params);
    const data = updateOrderStatusSchema.parse(req.body);
    const order = await orderService.updateOrderStatus(id, data);
    res.status(200).json({ status: 'success', data: order });
  } catch (error) {
    next(error);
  }
};
