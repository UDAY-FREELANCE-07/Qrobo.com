import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export const findReviews = async (skip: number, limit: number, filters: any) => {
  const where: Prisma.ReviewWhereInput = {};
  if (filters.product_id) where.product_id = filters.product_id;
  if (filters.rating) where.rating = Number(filters.rating);

  const [total, items] = await Promise.all([
    prisma.review.count({ where }),
    prisma.review.findMany({
      where,
      orderBy: { created_at: 'desc' },
      skip,
      take: limit,
      include: {
        user: { select: { id: true, full_name: true, email: true } },
        product: { select: { id: true, name: true } }
      }
    }),
  ]);
  return { total, items };
};

export const findReviewById = async (id: string) => {
  return prisma.review.findUnique({
    where: { id },
    include: {
        user: { select: { id: true, full_name: true, email: true } },
        product: { select: { id: true, name: true } }
    }
  });
};

export const updateReview = async (id: string, data: any) => {
  return prisma.review.update({
    where: { id },
    data,
    include: {
      user: { select: { id: true, full_name: true, email: true } },
      product: { select: { id: true, name: true } }
    }
  });
};

export const deleteReview = async (id: string) => {
  return prisma.review.delete({ where: { id } });
};
