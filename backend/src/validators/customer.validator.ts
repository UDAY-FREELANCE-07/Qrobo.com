import { z } from 'zod';

export const idParamSchema = z.object({
  id: z.string().uuid('Invalid ID format'),
});

export const productIdParamSchema = z.object({
  productId: z.string().uuid('Invalid Product ID format'),
});

export const createAddressSchema = z.object({
  label: z.string().min(1, 'Label is required'),
  full_name: z.string().min(1, 'Full name is required'),
  phone: z.string().min(1, 'Phone is required'),
  address_line1: z.string().min(1, 'Address line 1 is required'),
  address_line2: z.string().optional().nullable(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  postal_code: z.string().min(1, 'Postal code is required'),
  country: z.string().min(1, 'Country is required'),
  is_default: z.boolean().optional().default(false),
});

export const updateAddressSchema = createAddressSchema.partial();

export const addCartItemSchema = z.object({
  product_id: z.string().uuid('Invalid Product ID'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1').default(1),
});

export const updateCartItemSchema = z.object({
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
});

export const mergeCartSchema = z.object({
  items: z.array(z.object({
    product_id: z.string().uuid('Invalid Product ID'),
    quantity: z.number().int().min(1, 'Quantity must be at least 1'),
  })),
});

export const checkoutSchema = z.object({
  shipping_address_id: z.string().uuid('Invalid Shipping Address ID'),
  billing_address_id: z.string().uuid('Invalid Billing Address ID').optional(),
  payment_method: z.string().min(1, 'Payment method is required'),
  coupon_code: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export const createReviewSchema = z.object({
  rating: z.number().int().min(1).max(5, 'Rating must be between 1 and 5'),
  title: z.string().optional().nullable(),
  body: z.string().optional().nullable(),
  images: z.array(z.string().url()).optional().default([]),
});

export const updateReviewSchema = createReviewSchema.partial();

export type CreateAddressInput = z.infer<typeof createAddressSchema>;
export type UpdateAddressInput = z.infer<typeof updateAddressSchema>;
export type AddCartItemInput = z.infer<typeof addCartItemSchema>;
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>;
export type MergeCartInput = z.infer<typeof mergeCartSchema>;
export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type UpdateReviewInput = z.infer<typeof updateReviewSchema>;
