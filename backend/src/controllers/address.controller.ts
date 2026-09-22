import { Request, Response, NextFunction } from 'express';
import * as addressService from '../services/address.service';
import { createAddressSchema, updateAddressSchema, idParamSchema } from '../validators/customer.validator';

export const getAddresses = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.userId;
    const addresses = await addressService.getAddresses(userId);
    res.status(200).json({ status: 'success', data: addresses });
  } catch (error) {
    next(error);
  }
};

export const getAddressById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.userId;
    const { id } = idParamSchema.parse(req.params);
    const address = await addressService.getAddressById(id, userId);
    res.status(200).json({ status: 'success', data: address });
  } catch (error) {
    next(error);
  }
};

export const createAddress = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.userId;
    const data = createAddressSchema.parse(req.body);
    const address = await addressService.createAddress(userId, data);
    res.status(201).json({ status: 'success', data: address });
  } catch (error) {
    next(error);
  }
};

export const updateAddress = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.userId;
    const { id } = idParamSchema.parse(req.params);
    const data = updateAddressSchema.parse(req.body);
    const address = await addressService.updateAddress(id, userId, data);
    res.status(200).json({ status: 'success', data: address });
  } catch (error) {
    next(error);
  }
};

export const deleteAddress = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.userId;
    const { id } = idParamSchema.parse(req.params);
    await addressService.deleteAddress(id, userId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
