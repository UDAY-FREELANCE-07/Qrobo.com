import { Request, Response, NextFunction } from 'express';
import * as wishlistService from '../services/wishlist.service';
import { productIdParamSchema } from '../validators/customer.validator';

export const getWishlist = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.userId;
    const items = await wishlistService.getWishlist(userId);
    res.status(200).json({ status: 'success', data: items });
  } catch (error) {
    next(error);
  }
};

export const addWishlistItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.userId;
    const { product_id } = req.body;
    
    if (!product_id) {
        return res.status(400).json({ status: 'error', message: 'product_id is required' });
    }

    const items = await wishlistService.addWishlistItem(userId, product_id);
    res.status(201).json({ status: 'success', data: items });
  } catch (error) {
    next(error);
  }
};

export const removeWishlistItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.userId;
    const { productId } = productIdParamSchema.parse(req.params);
    const items = await wishlistService.removeWishlistItem(userId, productId);
    res.status(200).json({ status: 'success', data: items });
  } catch (error) {
    next(error);
  }
};

export const clearWishlist = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.userId;
    const items = await wishlistService.clearWishlist(userId);
    res.status(200).json({ status: 'success', data: items });
  } catch (error) {
    next(error);
  }
};
