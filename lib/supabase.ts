import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  detectSessionInUrl: true,
  flowType: 'pkce',
  },
});

export type Database = {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          image_url: string | null;
          icon_name: string | null;
          parent_id: string | null;
          is_featured: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['categories']['Row']>;
        Update: Partial<Database['public']['Tables']['categories']['Row']>;
      };
      brands: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          logo_url: string | null;
          country: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['brands']['Row']>;
        Update: Partial<Database['public']['Tables']['brands']['Row']>;
      };
      products: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          short_description: string | null;
          category_id: string | null;
          brand_id: string | null;
          sku: string;
          price: number;
          compare_at_price: number | null;
          cost_price: number | null;
          images: string[];
          primary_image: string | null;
          specifications: Record<string, string>;
          features: string[];
          whats_included: string[];
          compatibility: string[];
          tags: string[];
          rating: number;
          review_count: number;
          stock: number;
          reserved_stock: number;
          low_stock_threshold: number;
          is_featured: boolean;
          is_bestseller: boolean;
          is_new_arrival: boolean;
          is_deal: boolean;
          is_published: boolean;
          weight: number | null;
          dimensions: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['products']['Row']>;
        Update: Partial<Database['public']['Tables']['products']['Row']>;
      };
      reviews: {
        Row: {
          id: string;
          product_id: string;
          user_id: string;
          order_id: string | null;
          rating: number;
          title: string | null;
          body: string | null;
          images: string[];
          is_verified_purchase: boolean;
          is_approved: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['reviews']['Row']>;
        Update: Partial<Database['public']['Tables']['reviews']['Row']>;
      };
      carts: {
        Row: {
          id: string;
          user_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['carts']['Row']>;
        Update: Partial<Database['public']['Tables']['carts']['Row']>;
      };
      cart_items: {
        Row: {
          id: string;
          cart_id: string;
          product_id: string;
          quantity: number;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['cart_items']['Row']>;
        Update: Partial<Database['public']['Tables']['cart_items']['Row']>;
      };
      wishlists: {
        Row: {
          id: string;
          user_id: string;
          product_id: string;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['wishlists']['Row']>;
        Update: Partial<Database['public']['Tables']['wishlists']['Row']>;
      };
      addresses: {
        Row: {
          id: string;
          user_id: string;
          label: string;
          full_name: string;
          phone: string;
          address_line1: string;
          address_line2: string | null;
          city: string;
          state: string;
          postal_code: string;
          country: string;
          is_default: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['addresses']['Row']>;
        Update: Partial<Database['public']['Tables']['addresses']['Row']>;
      };
      orders: {
        Row: {
          id: string;
          order_number: string;
          user_id: string;
          status: string;
          payment_status: string;
          payment_method: string;
          payment_id: string | null;
          razorpay_order_id: string | null;
          razorpay_payment_id: string | null;
          razorpay_signature: string | null;
          subtotal: number;
          discount: number;
          shipping_cost: number;
          tax: number;
          total: number;
          coupon_code: string | null;
          shipping_address: Record<string, string> | null;
          billing_address: Record<string, string> | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['orders']['Row']>;
        Update: Partial<Database['public']['Tables']['orders']['Row']>;
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string | null;
          product_name: string;
          product_image: string | null;
          product_slug: string | null;
          sku: string | null;
          price: number;
          quantity: number;
          total: number;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['order_items']['Row']>;
        Update: Partial<Database['public']['Tables']['order_items']['Row']>;
      };
      coupons: {
        Row: {
          id: string;
          code: string;
          description: string | null;
          discount_type: string;
          discount_value: number;
          min_order_value: number;
          max_discount: number | null;
          usage_limit: number | null;
          used_count: number;
          user_id: string | null;
          category_id: string | null;
          expires_at: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['coupons']['Row']>;
        Update: Partial<Database['public']['Tables']['coupons']['Row']>;
      };
      banners: {
        Row: {
          id: string;
          title: string;
          subtitle: string | null;
          description: string | null;
          image_url: string | null;
          category_label: string | null;
          cta_text: string;
          cta_link: string;
          sort_order: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['banners']['Row']>;
        Update: Partial<Database['public']['Tables']['banners']['Row']>;
      };
      promo_cards: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          image_url: string | null;
          cta_text: string;
          cta_link: string;
          background_color: string;
          sort_order: number;
          is_active: boolean;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['promo_cards']['Row']>;
        Update: Partial<Database['public']['Tables']['promo_cards']['Row']>;
      };
      deals: {
        Row: {
          id: string;
          product_id: string;
          title: string | null;
          description: string | null;
          discount_percentage: number | null;
          sale_price: number;
          original_price: number;
          starts_at: string;
          ends_at: string;
          is_active: boolean;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['deals']['Row']>;
        Update: Partial<Database['public']['Tables']['deals']['Row']>;
      };
      projects: {
        Row: {
          id: string;
          title: string;
          slug: string;
          description: string | null;
          difficulty: string;
          estimated_cost: number | null;
          estimated_time: string | null;
          image_url: string | null;
          images: string[];
          video_url: string | null;
          tutorial: string | null;
          tags: string[];
          is_published: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['projects']['Row']>;
        Update: Partial<Database['public']['Tables']['projects']['Row']>;
      };
      project_components: {
        Row: {
          id: string;
          project_id: string;
          product_id: string | null;
          name: string;
          quantity: number;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['project_components']['Row']>;
        Update: Partial<Database['public']['Tables']['project_components']['Row']>;
      };
      tutorials: {
        Row: {
          id: string;
          title: string;
          slug: string;
          description: string | null;
          category: string;
          content: string | null;
          image_url: string | null;
          video_url: string | null;
          difficulty: string;
          read_time: number;
          tags: string[];
          is_published: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['tutorials']['Row']>;
        Update: Partial<Database['public']['Tables']['tutorials']['Row']>;
      };
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          phone: string | null;
          role: string;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['profiles']['Row']>;
        Update: Partial<Database['public']['Tables']['profiles']['Row']>;
      };
    };
  };
};
