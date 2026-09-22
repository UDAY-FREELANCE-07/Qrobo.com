import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const findPromoCards = async () => {
  return prisma.promoCard.findMany({ orderBy: { sort_order: 'asc' } });
};

export const findPromoCardById = async (id: string) => {
  return prisma.promoCard.findUnique({ where: { id } });
};

export const createPromoCard = async (data: any) => {
  return prisma.promoCard.create({ data });
};

export const updatePromoCard = async (id: string, data: any) => {
  return prisma.promoCard.update({ where: { id }, data });
};

export const deletePromoCard = async (id: string) => {
  return prisma.promoCard.delete({ where: { id } });
};
