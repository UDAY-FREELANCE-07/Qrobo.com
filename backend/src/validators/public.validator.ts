import { z } from 'zod';

export const paginationSchema = z.object({
  page: z.string().optional().transform(val => (val ? parseInt(val, 10) : 1)),
  limit: z.string().optional().transform(val => (val ? parseInt(val, 10) : 20)),
});

export const idParamSchema = z.object({
  id: z.string().uuid('Invalid ID format'),
});

// Accepts either a UUID (product id) or a slug (e.g. yantrax-arduino-starter-kit).
// Detection is done at the service/repository layer — not here — so we just
// validate that the value is a non-empty string with valid identifier characters.
export const identifierParamSchema = z.object({
  identifier: z
    .string()
    .min(1, 'Identifier is required')
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      'Identifier must be a UUID or a slug (letters, numbers, hyphens, underscores)'
    ),
});

export type IdentifierParam = z.infer<typeof identifierParamSchema>;

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
