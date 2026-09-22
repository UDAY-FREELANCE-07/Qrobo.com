import { Request, Response, NextFunction } from 'express';
import * as couponService from '../services/admin.coupon.service';
import { createCouponSchema, updateCouponSchema, idParamSchema } from '../validators/admin.validator';

export const getCoupons = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await couponService.getCoupons(req.query as any);
    res.status(200).json({ status: 'success', data: result });
  } catch (error) {
    next(error);
  }
};

export const getCouponById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = idParamSchema.parse(req.params);
    const coupon = await couponService.getCouponById(id);
    res.status(200).json({ status: 'success', data: coupon });
  } catch (error) {
    next(error);
  }
};

export const createCoupon = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = createCouponSchema.parse(req.body);
    const coupon = await couponService.createCoupon(data);
    res.status(201).json({ status: 'success', data: coupon });
  } catch (error) {
    next(error);
  }
};

export const updateCoupon = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = idParamSchema.parse(req.params);
    const data = updateCouponSchema.parse(req.body);
    const coupon = await couponService.updateCoupon(id, data);
    res.status(200).json({ status: 'success', data: coupon });
  } catch (error) {
    next(error);
  }
};

export const deleteCoupon = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = idParamSchema.parse(req.params);
    await couponService.deleteCoupon(id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
