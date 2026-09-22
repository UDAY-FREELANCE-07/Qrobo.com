import * as couponRepository from '../repositories/admin.coupon.repository';
import { CreateCouponInput, UpdateCouponInput } from '../validators/admin.validator';
import { AppError } from '../utils/AppError';
import { getPaginationParams, paginate } from '../utils/pagination.util';
import { PaginationQuery } from '../validators/public.validator';

export const getCoupons = async (query: PaginationQuery) => {
  const { page, limit, skip } = getPaginationParams(query);
  const { total, items } = await couponRepository.findCoupons(skip, limit);
  return paginate(items, total, page, limit);
};

export const getCouponById = async (id: string) => {
  const coupon = await couponRepository.findCouponById(id);
  if (!coupon) {
    throw new AppError('Coupon not found', 404, 'NOT_FOUND');
  }
  return coupon;
};

export const createCoupon = async (data: CreateCouponInput) => {
  const existing = await couponRepository.findCouponByCode(data.code);
  if (existing) {
    throw new AppError('Coupon code already exists', 400, 'BAD_REQUEST');
  }
  return couponRepository.createCoupon(data);
};

export const updateCoupon = async (id: string, data: UpdateCouponInput) => {
  const coupon = await couponRepository.findCouponById(id);
  if (!coupon) {
    throw new AppError('Coupon not found', 404, 'NOT_FOUND');
  }
  
  if (data.code && data.code !== coupon.code) {
      const existing = await couponRepository.findCouponByCode(data.code);
      if (existing) {
        throw new AppError('Coupon code already exists', 400, 'BAD_REQUEST');
      }
  }

  return couponRepository.updateCoupon(id, data);
};

export const deleteCoupon = async (id: string) => {
  const coupon = await couponRepository.findCouponById(id);
  if (!coupon) {
    throw new AppError('Coupon not found', 404, 'NOT_FOUND');
  }
  await couponRepository.deleteCoupon(id);
  return null;
};
