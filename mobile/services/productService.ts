import { supabase } from '@/lib/supabase';
import type { Category, ProductWithCategory } from '@/lib/types';

export const productService = {
  async getProducts(): Promise<ProductWithCategory[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*, categories(*)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data ?? []) as ProductWithCategory[];
    } catch (e) {
      console.error('Error fetching products:', e);
      return [];
    }
  },

  async getFeaturedProducts(): Promise<ProductWithCategory[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*, categories(*)')
        .eq('is_featured', true)
        .limit(6);

      if (error) throw error;
      return (data ?? []) as ProductWithCategory[];
    } catch (e) {
      console.error('Error fetching featured products:', e);
      return [];
    }
  },

  async getCategories(): Promise<Category[]> {
    try {
      const { data, error } = await supabase.from('categories').select('*').order('name');

      if (error) throw error;
      return (data ?? []) as Category[];
    } catch (e) {
      console.error('Error fetching categories:', e);
      return [];
    }
  },

  async getProductById(id: string): Promise<ProductWithCategory | null> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*, categories(*)')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as ProductWithCategory;
    } catch (e) {
      console.error(`Error fetching product ${id}:`, e);
      return null;
    }
  },
};
