import { Request, Response, NextFunction } from 'express';
import * as cartService from '../services/cart.service';
import { addCartItemSchema, updateCartItemSchema, idParamSchema } from '../validators/customer.validator';

export const getCart = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.userId;
    const cart = await cartService.getCart(userId);
    res.status(200).json({ status: 'success', data: cart });
  } catch (error) {
    next(error);
  }
};

export const addCartItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.userId;
    const data = addCartItemSchema.parse(req.body);
    const cart = await cartService.addCartItem(userId, data);
    res.status(200).json({ status: 'success', data: cart });
  } catch (error) {
    next(error);
  }
};

export const updateCartItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.userId;
    const { id } = idParamSchema.parse(req.params);
    const data = updateCartItemSchema.parse(req.body);
    const cart = await cartService.updateCartItem(userId, id, data);
    res.status(200).json({ status: 'success', data: cart });
  } catch (error) {
    next(error);
  }
};

export const removeCartItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.userId;
    const { id } = idParamSchema.parse(req.params);
    const cart = await cartService.removeCartItem(userId, id);
    res.status(200).json({ status: 'success', data: cart });
  } catch (error) {
    next(error);
  }
};

export const clearCart = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.userId;
    const cart = await cartService.clearCart(userId);
    res.status(200).json({ status: 'success', data: cart });
  } catch (error) {
    next(error);
  }
};

export const mergeCart = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.userId;
    const data = require('../validators/customer.validator').mergeCartSchema.parse(req.body);
    const cart = await cartService.mergeCart(userId, data);
    res.status(200).json({ status: 'success', data: cart });
  } catch (error) {
    next(error);
  }
};
