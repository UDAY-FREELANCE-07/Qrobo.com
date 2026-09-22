import * as cartRepository from '../repositories/cart.repository';
import { AddCartItemInput, UpdateCartItemInput } from '../validators/customer.validator';
import { AppError } from '../utils/AppError';

const formatCartResponse = (cart: any) => {
  let subtotal = 0;
  const items = cart.items?.map((item: any) => {
    const itemTotal = Number(item.product?.price || 0) * item.quantity;
    subtotal += itemTotal;
    return {
      id: item.id,
      product_id: item.product_id,
      quantity: item.quantity,
      product: item.product,
      itemTotal,
    };
  }) || [];

  return {
    id: cart.id,
    user_id: cart.user_id,
    items,
    subtotal,
  };
};

export const getCart = async (userId: string) => {
  let cart = await cartRepository.findCartByUserId(userId);
  if (!cart) {
    cart = await cartRepository.createCart(userId);
  }
  return formatCartResponse(cart);
};

export const addCartItem = async (userId: string, data: AddCartItemInput) => {
  let cart = await cartRepository.findCartByUserId(userId);
  if (!cart) {
    cart = await cartRepository.createCart(userId);
  }

  const product = await cartRepository.findProductById(data.product_id);
  if (!product) {
    throw new AppError('Product not found or unavailable', 404, 'NOT_FOUND');
  }

  await cartRepository.addOrUpdateCartItem(cart.id, data.product_id, data.quantity);
  
  const updatedCart = await cartRepository.findCartByUserId(userId);
  return formatCartResponse(updatedCart);
};

export const updateCartItem = async (userId: string, itemId: string, data: UpdateCartItemInput) => {
  const cart = await cartRepository.findCartByUserId(userId);
  if (!cart) {
    throw new AppError('Cart not found', 404, 'NOT_FOUND');
  }

  const result = await cartRepository.updateCartItemQuantity(itemId, cart.id, data.quantity);
  if (!result) {
    throw new AppError('Cart item not found in your cart', 404, 'NOT_FOUND');
  }

  const updatedCart = await cartRepository.findCartByUserId(userId);
  return formatCartResponse(updatedCart);
};

export const removeCartItem = async (userId: string, itemId: string) => {
  const cart = await cartRepository.findCartByUserId(userId);
  if (!cart) {
    throw new AppError('Cart not found', 404, 'NOT_FOUND');
  }

  const result = await cartRepository.removeCartItem(itemId, cart.id);
  if (!result) {
    throw new AppError('Cart item not found in your cart', 404, 'NOT_FOUND');
  }

  const updatedCart = await cartRepository.findCartByUserId(userId);
  return formatCartResponse(updatedCart);
};

export const clearCart = async (userId: string) => {
  const cart = await cartRepository.findCartByUserId(userId);
  if (cart) {
    await cartRepository.clearCart(cart.id);
  }
  const updatedCart = await cartRepository.findCartByUserId(userId);
  return formatCartResponse(updatedCart);
};

export const mergeCart = async (userId: string, data: any) => {
  let cart = await cartRepository.findCartByUserId(userId);
  if (!cart) {
    cart = await cartRepository.createCart(userId);
  }

  await cartRepository.mergeGuestCart(cart.id, data.items);
  
  const updatedCart = await cartRepository.findCartByUserId(userId);
  return formatCartResponse(updatedCart);
};
