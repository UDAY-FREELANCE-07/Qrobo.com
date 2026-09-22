import { z } from 'zod';

// UUID Param
export const idParamSchema = z.object({
  id: z.string().uuid('Invalid ID format'),
});

// Category
export const createCategorySchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional().nullable(),
  image_url: z.string().url().optional().nullable(),
  icon_name: z.string().optional().nullable(),
  parent_id: z.string().uuid().optional().nullable(),
  is_featured: z.boolean().optional().default(false),
  sort_order: z.number().int().optional().default(0),
});
export const updateCategorySchema = createCategorySchema.partial();

// Brand
export const createBrandSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional().nullable(),
  logo_url: z.string().url().optional().nullable(),
  country: z.string().optional().nullable(),
});
export const updateBrandSchema = createBrandSchema.partial();

// Product
export const createProductSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional().nullable(),
  short_description: z.string().optional().nullable(),
  category_id: z.string().uuid().optional().nullable(),
  brand_id: z.string().uuid().optional().nullable(),
  sku: z.string().min(1),
  price: z.number().min(0),
  compare_at_price: z.number().min(0).optional().nullable(),
  cost_price: z.number().min(0).optional().nullable(),
  images: z.array(z.string().url()).optional().default([]),
  primary_image: z.string().url().optional().nullable(),
  specifications: z.any().optional().nullable(),
  features: z.array(z.string()).optional().default([]),
  whats_included: z.array(z.string()).optional().default([]),
  compatibility: z.array(z.string()).optional().default([]),
  tags: z.array(z.string()).optional().default([]),
  stock: z.number().int().min(0).optional().default(0),
  low_stock_threshold: z.number().int().min(0).optional().default(5),
  is_featured: z.boolean().optional().default(false),
  is_bestseller: z.boolean().optional().default(false),
  is_new_arrival: z.boolean().optional().default(false),
  is_deal: z.boolean().optional().default(false),
  is_published: z.boolean().optional().default(false),
  weight: z.number().min(0).optional().nullable(),
  dimensions: z.string().optional().nullable(),
});
export const updateProductSchema = createProductSchema.partial();

// Banner
export const createBannerSchema = z.object({
  title: z.string().min(1),
  subtitle: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  image_url: z.string().url().optional().nullable(),
  category_label: z.string().optional().nullable(),
  cta_text: z.string().min(1),
  cta_link: z.string().min(1),
  sort_order: z.number().int().optional().default(0),
  is_active: z.boolean().optional().default(true),
});
export const updateBannerSchema = createBannerSchema.partial();

// PromoCard
export const createPromoCardSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional().nullable(),
  image_url: z.string().url().optional().nullable(),
  cta_text: z.string().min(1),
  cta_link: z.string().min(1),
  background_color: z.string().min(1),
  sort_order: z.number().int().optional().default(0),
  is_active: z.boolean().optional().default(true),
});
export const updatePromoCardSchema = createPromoCardSchema.partial();

// Deal
export const createDealSchema = z.object({
  product_id: z.string().uuid(),
  title: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  discount_percentage: z.number().min(0).max(100).optional().nullable(),
  sale_price: z.number().min(0),
  original_price: z.number().min(0),
  starts_at: z.string().datetime(),
  ends_at: z.string().datetime(),
  is_active: z.boolean().optional().default(true),
});
export const updateDealSchema = createDealSchema.partial();

// Coupon
export const createCouponSchema = z.object({
  code: z.string().min(1),
  description: z.string().optional().nullable(),
  discount_type: z.enum(['PERCENTAGE', 'FIXED']),
  discount_value: z.number().min(0),
  min_order_value: z.number().min(0).optional().default(0),
  max_discount: z.number().min(0).optional().nullable(),
  usage_limit: z.number().int().min(1).optional().nullable(),
  user_id: z.string().uuid().optional().nullable(),
  category_id: z.string().uuid().optional().nullable(),
  expires_at: z.string().datetime().optional().nullable(),
  is_active: z.boolean().optional().default(true),
});
export const updateCouponSchema = createCouponSchema.partial();

// Order Status Update
export const updateOrderStatusSchema = z.object({
  status: z.enum(['PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED']).optional(),
  payment_status: z.enum(['PENDING', 'PAID', 'FAILED', 'REFUNDED']).optional(),
});

// Project
export const createProjectSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional().nullable(),
  difficulty: z.string().min(1),
  estimated_cost: z.number().min(0).optional().nullable(),
  estimated_time: z.string().optional().nullable(),
  image_url: z.string().url().optional().nullable(),
  images: z.array(z.string().url()).optional().default([]),
  video_url: z.string().url().optional().nullable(),
  tutorial: z.string().optional().nullable(),
  tags: z.array(z.string()).optional().default([]),
  is_published: z.boolean().optional().default(false),
});
export const updateProjectSchema = createProjectSchema.partial();

// Tutorial
export const createTutorialSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional().nullable(),
  category: z.string().min(1),
  content: z.string().optional().nullable(),
  image_url: z.string().url().optional().nullable(),
  video_url: z.string().url().optional().nullable(),
  difficulty: z.string().min(1),
  read_time: z.number().int().min(0).optional().default(0),
  tags: z.array(z.string()).optional().default([]),
  is_published: z.boolean().optional().default(false),
});
export const updateTutorialSchema = createTutorialSchema.partial();

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;

export type CreateBrandInput = z.infer<typeof createBrandSchema>;
export type UpdateBrandInput = z.infer<typeof updateBrandSchema>;

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;

export type CreateBannerInput = z.infer<typeof createBannerSchema>;
export type UpdateBannerInput = z.infer<typeof updateBannerSchema>;

export type CreatePromoCardInput = z.infer<typeof createPromoCardSchema>;
export type UpdatePromoCardInput = z.infer<typeof updatePromoCardSchema>;

export type CreateDealInput = z.infer<typeof createDealSchema>;
export type UpdateDealInput = z.infer<typeof updateDealSchema>;

export type CreateCouponInput = z.infer<typeof createCouponSchema>;
export type UpdateCouponInput = z.infer<typeof updateCouponSchema>;

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;

export type CreateTutorialInput = z.infer<typeof createTutorialSchema>;
export type UpdateTutorialInput = z.infer<typeof updateTutorialSchema>;

