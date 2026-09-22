import { PrismaClient } from '@prisma/client';
import { CreateReviewInput, UpdateReviewInput } from '../validators/customer.validator';

const prisma = new PrismaClient();

export const findReviewsByProductId = async (productId: string, skip: number, limit: number) => {
  const where = { product_id: productId, is_approved: true };
  const [total, items] = await Promise.all([
    prisma.review.count({ where }),
    prisma.review.findMany({
      where,
      orderBy: { created_at: 'desc' },
      skip,
      take: limit,
      include: {
        user: { select: { id: true, full_name: true, avatar_url: true } }
      }
    }),
  ]);
  return { total, items };
};

export const findReviewByIdAndUserId = async (id: string, userId: string) => {
  return prisma.review.findFirst({
    where: { id, user_id: userId }
  });
};

export const findReviewByUserAndProduct = async (userId: string, productId: string) => {
  return prisma.review.findFirst({
    where: { user_id: userId, product_id: productId }
  });
};

export const createReview = async (userId: string, productId: string, data: CreateReviewInput) => {
  return prisma.review.create({
    data: {
      ...data,
      user_id: userId,
      product_id: productId,
      is_approved: true // Assuming auto-approve for now, or this could be false depending on business rules
    }
  });
};

export const updateReview = async (id: string, data: UpdateReviewInput) => {
  return prisma.review.update({
    where: { id },
    data
  });
};

export const deleteReview = async (id: string) => {
  return prisma.review.delete({
    where: { id }
  });
};
