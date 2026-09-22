import * as customerRepository from '../repositories/admin.customer.repository';
import { AppError } from '../utils/AppError';
import { getPaginationParams, paginate } from '../utils/pagination.util';

export const getCustomers = async (query: any) => {
  const { page, limit, skip } = getPaginationParams(query);
  const { total, items } = await customerRepository.findCustomers(skip, limit, query);
  return paginate(items, total, page, limit);
};

export const getCustomerById = async (id: string) => {
  const customer = await customerRepository.findCustomerById(id);
  if (!customer) {
    throw new AppError('Customer not found', 404, 'NOT_FOUND');
  }
  return customer;
};
