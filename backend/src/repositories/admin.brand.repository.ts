import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export const findBrands = async (skip: number, limit: number, filters: any) => {
  const where: Prisma.BrandWhereInput = {};
  
  if (filters.search) {
    where.name = { contains: filters.search, mode: 'insensitive' };
  }

  const [total, items] = await Promise.all([
    prisma.brand.count({ where }),
    prisma.brand.findMany({
      where,
      orderBy: { created_at: 'desc' },
      skip,
      take: limit,
      include: {
        _count: { select: { products: true } }
      }
    }),
  ]);
  return { total, items };
};

export const findBrandById = async (id: string) => {
  return prisma.brand.findUnique({
    where: { id },
    include: {
        _count: { select: { products: true } }
    }
  });
};

export const createBrand = async (data: any) => {
  return prisma.brand.create({
    data
  });
};

export const updateBrand = async (id: string, data: any) => {
  return prisma.brand.update({
    where: { id },
    data
  });
};

export const deleteBrand = async (id: string) => {
  return prisma.brand.delete({
    where: { id }
  });
};
