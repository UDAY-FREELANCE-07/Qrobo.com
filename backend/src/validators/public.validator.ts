import { z } from 'zod';

export const paginationSchema = z.object({
  page: z.string().optional().transform(val => (val ? parseInt(val, 10) : 1)),
  limit: z.string().optional().transform(val => (val ? parseInt(val, 10) : 20)),
});

export const idParamSchema = z.object({
  id: z.string().uuid('Invalid ID format'),
});

export const productQuerySchema = paginationSchema.extend({
  search: z.string().optional(),
  category_id: z.string().uuid().optional(),
  brand_id: z.string().uuid().optional(),
  min_price: z.string().optional().transform(val => (val ? parseFloat(val) : undefined)),
  max_price: z.string().optional().transform(val => (val ? parseFloat(val) : undefined)),
  sort: z.enum(['newest', 'price_asc', 'price_desc', 'rating', 'popularity']).optional(),
  is_featured: z.string().optional().transform(val => val === 'true' ? true : undefined),
  is_deal: z.string().optional().transform(val => val === 'true' ? true : undefined),
  is_bestseller: z.string().optional().transform(val => val === 'true' ? true : undefined),
  is_new_arrival: z.string().optional().transform(val => val === 'true' ? true : undefined),
  category_slugs: z.string().optional(),
  slug: z.string().optional(),
});

export const categoryQuerySchema = paginationSchema.extend({
  search: z.string().optional(),
  parent_id: z.string().uuid().optional().nullable(),
  is_featured: z.string().optional().transform(val => val === 'true' ? true : undefined),
});

export const brandQuerySchema = paginationSchema.extend({
  search: z.string().optional(),
});

export const projectQuerySchema = paginationSchema.extend({
  search: z.string().optional(),
  difficulty: z.string().optional(),
  slug: z.string().optional(),
});

export const tutorialQuerySchema = paginationSchema.extend({
  search: z.string().optional(),
  category: z.string().optional(),
  difficulty: z.string().optional(),
  slug: z.string().optional(),
});

export type PaginationQuery = z.infer<typeof paginationSchema>;
export type ProductQuery = z.infer<typeof productQuerySchema>;
export type CategoryQuery = z.infer<typeof categoryQuerySchema>;
export type BrandQuery = z.infer<typeof brandQuerySchema>;
export type ProjectQuery = z.infer<typeof projectQuerySchema>;
export type TutorialQuery = z.infer<typeof tutorialQuerySchema>;
