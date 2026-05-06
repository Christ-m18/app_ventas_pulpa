/**
 * Supabase Product Repository — Infrastructure implementation.
 * Implements the IProductRepository interface defined in packages/core.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import type {
  IProductRepository,
} from '../../core/domain/repositories/product.repository';
import type {
  ProductWithCategory,
  Category,
} from '../../core/domain/entities/product';

export class SupabaseProductRepository implements IProductRepository {
  constructor(private readonly client: SupabaseClient) {}

  async getAll(): Promise<ProductWithCategory[]> {
    const { data, error } = await this.client
      .from('products')
      .select('*, categories(*)')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[SupabaseProductRepo] getAll error:', error.message);
      return [];
    }

    return (data ?? []) as ProductWithCategory[];
  }

  async getFeatured(limit = 6): Promise<ProductWithCategory[]> {
    const { data, error } = await this.client
      .from('products')
      .select('*, categories(*)')
      .eq('is_featured', true)
      .limit(limit);

    if (error) {
      console.error('[SupabaseProductRepo] getFeatured error:', error.message);
      return [];
    }

    return (data ?? []) as ProductWithCategory[];
  }

  async getById(id: string): Promise<ProductWithCategory | null> {
    const { data, error } = await this.client
      .from('products')
      .select('*, categories(*)')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // No rows
      console.error('[SupabaseProductRepo] getById error:', error.message);
      return null;
    }

    return data as ProductWithCategory;
  }

  async getCategories(): Promise<Category[]> {
    const { data, error } = await this.client
      .from('categories')
      .select('*')
      .order('name');

    if (error) {
      console.error('[SupabaseProductRepo] getCategories error:', error.message);
      return [];
    }

    return (data ?? []) as Category[];
  }

  async search(query: string): Promise<ProductWithCategory[]> {
    const { data, error } = await this.client
      .from('products')
      .select('*, categories(*)')
      .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
      .order('name');

    if (error) {
      console.error('[SupabaseProductRepo] search error:', error.message);
      return [];
    }

    return (data ?? []) as ProductWithCategory[];
  }
}
