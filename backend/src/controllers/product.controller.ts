import { Request, Response, NextFunction } from 'express';
import * as productService from '../services/product.service';
import { productQuerySchema, idParamSchema, identifierParamSchema } from '../validators/public.validator';

export const getProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = productQuerySchema.parse(req.query);
    const result = await productService.getProducts(query);
    res.status(200).json({
      status: 'success',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// Legacy UUID-only endpoint — preserved for backward compatibility
export const getProductById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = idParamSchema.parse(req.params);
    const product = await productService.getProductById(id);
    res.status(200).json({
      status: 'success',
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Flexible product detail endpoint.
 * Accepts :identifier as either a UUID (id lookup) or a slug (slug lookup).
 * Validation: must be non-empty and contain only letters, digits, hyphens, underscores.
 * UUID detection happens in the repository via regex — no DB overhead.
 */
export const getProductByIdentifier = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { identifier } = identifierParamSchema.parse(req.params);
    const product = await productService.getProductByIdentifier(identifier);
    res.status(200).json({
      status: 'success',
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

