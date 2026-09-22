import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const findWishlistByUserId = async (userId: string) => {
  return prisma.wishlist.findMany({
    where: { user_id: userId },
    include: {
      product: {
        select: { id: true, name: true, slug: true, primary_image: true, price: true, stock: true, is_published: true }
      }
    },
    orderBy: { created_at: 'desc' }
  });
};

export const addWishlistItem = async (userId: string, productId: string) => {
  const exists = await prisma.wishlist.findFirst({
    where: { user_id: userId, product_id: productId }
  });
  
  if (exists) return exists;
  
  return prisma.wishlist.create({
    data: {
      user_id: userId,
      product_id: productId,
    },
    include: {
        product: { select: { id: true, name: true, slug: true, primary_image: true, price: true } }
    }
  });
};

export const removeWishlistItem = async (userId: string, productId: string) => {
  return prisma.wishlist.deleteMany({
    where: { user_id: userId, product_id: productId }
  });
};

export const clearWishlist = async (userId: string) => {
  return prisma.wishlist.deleteMany({
    where: { user_id: userId }
  });
};

export const findProductById = async (productId: string) => {
  return prisma.product.findFirst({
    where: { id: productId, is_published: true }
  });
};
