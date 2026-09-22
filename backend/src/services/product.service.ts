import * as productRepository from '../repositories/product.repository';
import { ProductQuery } from '../validators/public.validator';
import { getPaginationParams, paginate } from '../utils/pagination.util';
import { AppError } from '../utils/AppError';

export const getProducts = async (query: ProductQuery) => {
  const { page, limit, skip } = getPaginationParams(query);
  const { total, items } = await productRepository.findProducts(query, skip);
  return paginate(items, total, page, limit);
};

export const getProductById = async (id: string) => {
  const product = await productRepository.findProductById(id);
  if (!product) {
    throw new AppError('Product not found', 404, 'NOT_FOUND');
  }
  return product;
};

/**
 * Fetches a product by UUID id or slug.
 * The repository handles the UUID-vs-slug detection.
 */
export const getProductByIdentifier = async (identifier: string) => {
  const product = await productRepository.findProductByIdentifier(identifier);
  if (!product) {
    throw new AppError('Product not found', 404, 'NOT_FOUND');
  }
  return product;
};

