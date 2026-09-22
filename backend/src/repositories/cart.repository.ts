import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const findCartByUserId = async (userId: string) => {
  return prisma.cart.findUnique({
    where: { user_id: userId },
    include: {
      items: {
        include: {
          product: {
            select: { id: true, name: true, slug: true, primary_image: true, price: true, stock: true, is_published: true }
          }
        },
        orderBy: { created_at: 'asc' }
      }
    }
  });
};

export const createCart = async (userId: string) => {
  return prisma.cart.create({
    data: { user_id: userId },
    include: { items: { include: { product: true } } }
  });
};

export const findProductById = async (productId: string) => {
  return prisma.product.findFirst({
    where: { id: productId, is_published: true }
  });
};

export const addOrUpdateCartItem = async (cartId: string, productId: string, quantity: number) => {
  const existingItem = await prisma.cartItem.findFirst({
    where: { cart_id: cartId, product_id: productId }
  });

  if (existingItem) {
    return prisma.cartItem.update({
      where: { id: existingItem.id },
      data: { quantity: existingItem.quantity + quantity },
    });
  } else {
    return prisma.cartItem.create({
      data: {
        cart_id: cartId,
        product_id: productId,
        quantity,
      }
    });
  }
};

export const updateCartItemQuantity = async (itemId: string, cartId: string, quantity: number) => {
  const item = await prisma.cartItem.findFirst({
    where: { id: itemId, cart_id: cartId }
  });
  
  if (!item) return null;

  return prisma.cartItem.update({
    where: { id: itemId },
    data: { quantity },
  });
};

export const removeCartItem = async (itemId: string, cartId: string) => {
  const item = await prisma.cartItem.findFirst({
    where: { id: itemId, cart_id: cartId }
  });
  
  if (!item) return null;

  return prisma.cartItem.delete({
    where: { id: itemId },
  });
};

export const clearCart = async (cartId: string) => {
  return prisma.cartItem.deleteMany({
    where: { cart_id: cartId }
  });
};

export const mergeGuestCart = async (cartId: string, items: {product_id: string, quantity: number}[]) => {
  return prisma.$transaction(async (tx) => {
    for (const item of items) {
      const product = await tx.product.findFirst({
        where: { id: item.product_id, is_published: true }
      });
      if (!product) continue;

      const existingItem = await tx.cartItem.findFirst({
        where: { cart_id: cartId, product_id: item.product_id }
      });

      if (existingItem) {
        await tx.cartItem.update({
          where: { id: existingItem.id },
          data: { quantity: existingItem.quantity + item.quantity }
        });
      } else {
        await tx.cartItem.create({
          data: {
            cart_id: cartId,
            product_id: item.product_id,
            quantity: item.quantity
          }
        });
      }
    }
  });
};
