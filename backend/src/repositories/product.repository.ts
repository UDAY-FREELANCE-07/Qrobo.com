import { PrismaClient, Prisma } from '@prisma/client';
import { ProductQuery } from '../validators/public.validator';

const prisma = new PrismaClient();

export const findProducts = async (query: ProductQuery, skip: number) => {
  const where: Prisma.ProductWhereInput = {
    is_published: true,
  };

  if (query.search) {
    where.OR = [
      { name: { contains: query.search, mode: 'insensitive' } },
      { description: { contains: query.search, mode: 'insensitive' } },
    ];
  }

  if (query.category_id) {
    where.category_id = query.category_id;
  }

  if (query.brand_id) {
    where.brand_id = query.brand_id;
  }

  if (query.min_price !== undefined || query.max_price !== undefined) {
    where.price = {};
    if (query.min_price !== undefined) where.price.gte = query.min_price;
    if (query.max_price !== undefined) where.price.lte = query.max_price;
  }

  if (query.is_featured !== undefined) {
    where.is_featured = query.is_featured;
  }

  if (query.is_deal !== undefined) {
    where.is_deal = query.is_deal;
  }

  let orderBy: Prisma.ProductOrderByWithRelationInput = { created_at: 'desc' };
  if (query.sort === 'price_asc') orderBy = { price: 'asc' };
  else if (query.sort === 'price_desc') orderBy = { price: 'desc' };
  else if (query.sort === 'rating') orderBy = { rating: 'desc' };

  const [total, items] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      orderBy,
      skip,
      take: query.limit,
      include: {
        category: { select: { id: true, name: true, slug: true } },
        brand: { select: { id: true, name: true, slug: true } },
      },
    }),
  ]);

  return { total, items };
};

export const findProductById = async (id: string) => {
  return prisma.product.findFirst({
    where: { id, is_published: true },
    include: {
      category: { select: { id: true, name: true, slug: true } },
      brand: { select: { id: true, name: true, slug: true } },
      deal: {
        where: { is_active: true, starts_at: { lte: new Date() }, ends_at: { gte: new Date() } }
      },
      reviews: {
        where: { is_approved: true },
        take: 5,
        orderBy: { created_at: 'desc' },
        include: { user: { select: { full_name: true, avatar_url: true } } }
      }
    },
  });
};
