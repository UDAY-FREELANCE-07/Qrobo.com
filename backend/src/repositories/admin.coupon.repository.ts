import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const findCoupons = async (skip: number, limit: number) => {
  const [total, items] = await Promise.all([
    prisma.coupon.count(),
    prisma.coupon.findMany({
      orderBy: { created_at: 'desc' },
      skip,
      take: limit,
    }),
  ]);
  return { total, items };
};

export const findCouponById = async (id: string) => {
  return prisma.coupon.findUnique({ where: { id } });
};

export const findCouponByCode = async (code: string) => {
  return prisma.coupon.findUnique({ where: { code } });
};

export const createCoupon = async (data: any) => {
  return prisma.coupon.create({ data });
};

export const updateCoupon = async (id: string, data: any) => {
  return prisma.coupon.update({ where: { id }, data });
};

export const deleteCoupon = async (id: string) => {
  return prisma.coupon.delete({ where: { id } });
};
