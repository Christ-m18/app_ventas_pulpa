export interface Category {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  unit: string;
  image_url: string;
  category_id: string;
  is_combo: boolean;
  is_featured: boolean;
  benefits: string[];
  created_at: string;
  updated_at: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export type ProductWithCategory = Product & { categories: Category };
