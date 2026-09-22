import * as productRepository from '../repositories/admin.product.repository';
import { CreateProductInput, UpdateProductInput } from '../validators/admin.validator';
import { AppError } from '../utils/AppError';
import { getPaginationParams, paginate } from '../utils/pagination.util';
import { PaginationQuery } from '../validators/public.validator';

export const getProducts = async (query: PaginationQuery & { search?: string, category_id?: string, brand_id?: string }) => {
  const { page, limit, skip } = getPaginationParams(query);
  const { total, items } = await productRepository.findProducts(skip, limit, query);
  return paginate(items, total, page, limit);
};

export const getProductById = async (id: string) => {
  const product = await productRepository.findProductById(id);
  if (!product) {
    throw new AppError('Product not found', 404, 'NOT_FOUND');
  }
  return product;
};

export const createProduct = async (data: CreateProductInput) => {
  return productRepository.createProduct(data);
};

export const updateProduct = async (id: string, data: UpdateProductInput) => {
  const product = await productRepository.findProductById(id);
  if (!product) {
    throw new AppError('Product not found', 404, 'NOT_FOUND');
  }
  return productRepository.updateProduct(id, data);
};

export const deleteProduct = async (id: string) => {
  const product = await productRepository.findProductById(id);
  if (!product) {
    throw new AppError('Product not found', 404, 'NOT_FOUND');
  }
  await productRepository.deleteProduct(id);
  return null;
};
