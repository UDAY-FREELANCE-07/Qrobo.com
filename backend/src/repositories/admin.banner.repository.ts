import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const findBanners = async () => {
  return prisma.banner.findMany({ orderBy: { sort_order: 'asc' } });
};

export const findBannerById = async (id: string) => {
  return prisma.banner.findUnique({ where: { id } });
};

export const createBanner = async (data: any) => {
  return prisma.banner.create({ data });
};

export const updateBanner = async (id: string, data: any) => {
  return prisma.banner.update({ where: { id }, data });
};

export const deleteBanner = async (id: string) => {
  return prisma.banner.delete({ where: { id } });
};
