import * as wishlistRepository from '../repositories/wishlist.repository';
import { AppError } from '../utils/AppError';

export const getWishlist = async (userId: string) => {
  return wishlistRepository.findWishlistByUserId(userId);
};

export const addWishlistItem = async (userId: string, productId: string) => {
  const product = await wishlistRepository.findProductById(productId);
  if (!product) {
    throw new AppError('Product not found or unavailable', 404, 'NOT_FOUND');
  }

  await wishlistRepository.addWishlistItem(userId, productId);
  return wishlistRepository.findWishlistByUserId(userId);
};

export const removeWishlistItem = async (userId: string, productId: string) => {
  await wishlistRepository.removeWishlistItem(userId, productId);
  return wishlistRepository.findWishlistByUserId(userId);
};

export const clearWishlist = async (userId: string) => {
  await wishlistRepository.clearWishlist(userId);
  return [];
};
