import * as orderRepository from '../repositories/admin.order.repository';
import { AppError } from '../utils/AppError';
import { getPaginationParams, paginate } from '../utils/pagination.util';

export const getOrders = async (query: any) => {
  const { page, limit, skip } = getPaginationParams(query);
  const { total, items } = await orderRepository.findOrders(skip, limit, query);
  return paginate(items, total, page, limit);
};

export const getOrderById = async (id: string) => {
  const order = await orderRepository.findOrderById(id);
  if (!order) {
    throw new AppError('Order not found', 404, 'NOT_FOUND');
  }
  return order;
};

export const updateOrderStatus = async (id: string, data: any) => {
  const order = await orderRepository.findOrderById(id);
  if (!order) {
    throw new AppError('Order not found', 404, 'NOT_FOUND');
  }
  return orderRepository.updateOrderStatus(id, data);
};
