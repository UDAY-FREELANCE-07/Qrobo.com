import { PrismaClient, Prisma } from '@prisma/client';
import { CreateProductInput, UpdateProductInput } from '../validators/admin.validator';

const prisma = new PrismaClient();

export const findProducts = async (skip: number, limit: number, filters: any) => {
  const where: Prisma.ProductWhereInput = {};
  
  if (filters.search) {
    where.name = { contains: filters.search, mode: 'insensitive' };
  }
  if (filters.category_id) {
    where.category_id = filters.category_id;
  }
  if (filters.brand_id) {
    where.brand_id = filters.brand_id;
  }

  const [total, items] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      orderBy: { created_at: 'desc' },
      skip,
      take: limit,
      include: {
        category: { select: { id: true, name: true } },
        brand: { select: { id: true, name: true } }
      }
    }),
  ]);
  return { total, items };
};

export const findProductById = async (id: string) => {
  return prisma.product.findUnique({
    where: { id },
    include: {
        category: true,
        brand: true
    }
  });
};

export const createProduct = async (data: CreateProductInput) => {
  return prisma.product.create({
    data
  });
};

export const updateProduct = async (id: string, data: UpdateProductInput) => {
  return prisma.product.update({
    where: { id },
    data
  });
};

export const deleteProduct = async (id: string) => {
  return prisma.product.delete({
    where: { id }
  });
};
