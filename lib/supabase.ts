// guiadeturismofoz/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// --- TIPOS DE PASSEIOS ---
export interface Tour {
  id: string;
  base_price: number;
  duration_hours: number;
  location: string;
  is_active: boolean;
  category_id: string;
  created_at: string;
  is_women_exclusive: boolean; 
  is_featured: boolean; 
  disabled_week_days: number[];
  disabled_specific_dates: string[];
}

export interface TourTranslation {
  id: string;
  tour_id: string;
  language_code: string;
  title: string;
  description: string;
  whats_included: string;
  whats_excluded: string;
}

export interface TourImage {
  id: string;
  tour_id: string;
  image_url: string;
  alt_text: string;
  display_order: number;
  is_cover: boolean;
}

// --- TIPOS DE COMBOS ---
export interface Combo {
  id: string;
  base_price: number;
  old_price?: number;
  is_active: boolean;
  is_featured: boolean;
  created_at: string;
}

export interface ComboTranslation {
  id: string;
  combo_id: string;
  language_code: string;
  title: string;
  description: string;
  whats_included: string[]; 
}

export interface ComboImage {
  id: string;
  combo_id: string;
  image_url: string;
  display_order: number;
  is_cover: boolean; // <-- ADICIONADO
}

// --- OUTROS TIPOS ---
export interface Category {
  id: string;
  created_at: string;
}

export interface CategoryTranslation {
  id: string;
  category_id: string;
  language_code: string;
  name: string;
  slug: string;
}

export interface SiteSetting {
  id: string;
  setting_key: string;
  setting_value: string;
}

export interface SocialPost {
  id: string;
  platform: 'instagram' | 'tiktok';
  post_url: string;
  thumbnail_url: string;
  type: 'image' | 'video';
  is_active: boolean;
  display_order: number;
}