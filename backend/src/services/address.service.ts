import * as addressRepository from '../repositories/address.repository';
import { CreateAddressInput, UpdateAddressInput } from '../validators/customer.validator';
import { AppError } from '../utils/AppError';

export const getAddresses = async (userId: string) => {
  return addressRepository.findAddressesByUserId(userId);
};

export const getAddressById = async (id: string, userId: string) => {
  const address = await addressRepository.findAddressByIdAndUserId(id, userId);
  if (!address) {
    throw new AppError('Address not found', 404, 'NOT_FOUND');
  }
  return address;
};

export const createAddress = async (userId: string, data: CreateAddressInput) => {
  return addressRepository.createAddress(userId, data);
};

export const updateAddress = async (id: string, userId: string, data: UpdateAddressInput) => {
  const address = await addressRepository.findAddressByIdAndUserId(id, userId);
  if (!address) {
    throw new AppError('Address not found', 404, 'NOT_FOUND');
  }
  return addressRepository.updateAddress(id, userId, data);
};

export const deleteAddress = async (id: string, userId: string) => {
  const address = await addressRepository.findAddressByIdAndUserId(id, userId);
  if (!address) {
    throw new AppError('Address not found', 404, 'NOT_FOUND');
  }
  
  if (address.is_default) {
    throw new AppError('Cannot delete default address. Set another address as default first.', 400, 'BAD_REQUEST');
  }

  await addressRepository.deleteAddress(id);
  return null;
};
