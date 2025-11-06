import { createClient } from '@supabase/supabase-js';

// As variáveis de ambiente devem estar no seu arquivo .env.local
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Tipos (do seu arquivo original)
export interface Tour {
  id: string;
  base_price: number;
  duration_hours: number;
  location: string;
  is_active: boolean;
  category_id: string;
  created_at: string;
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
}

export interface TourAvailability {
  id: string;
  tour_id: string;
  available_date: string;
  total_spots: number;
  spots_booked: number;
}

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