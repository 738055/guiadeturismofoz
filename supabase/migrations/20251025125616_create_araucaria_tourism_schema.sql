/*
  # Araucária Turismo Receptivo - Complete Database Schema
  
  ## Overview
  This migration creates the complete database structure for a premium tourism e-commerce platform
  with multi-language support, date-first booking flow, and WhatsApp checkout integration.
  
  ## New Tables
  
  ### 1. admins
  - `id` (uuid, primary key) - Unique identifier for admin users
  - `username` (text, unique) - Admin login username
  - `password_hash` (text) - Hashed password for secure authentication
  - `created_at` (timestamptz) - Account creation timestamp
  
  ### 2. categories
  - `id` (uuid, primary key) - Unique identifier for tour categories
  - `created_at` (timestamptz) - Category creation timestamp
  
  ### 3. category_translations
  - `id` (uuid, primary key) - Unique identifier for translation
  - `category_id` (uuid, foreign key) - References categories table
  - `language_code` (text) - Language code (pt_BR, en_US, es_ES)
  - `name` (text) - Translated category name
  - `slug` (text) - URL-friendly version of name
  - Unique constraint on (category_id, language_code)
  
  ### 4. tours
  - `id` (uuid, primary key) - Unique identifier for tour
  - `base_price` (numeric) - Base price in BRL
  - `duration_hours` (integer) - Duration in hours
  - `location` (text) - Tour location
  - `is_active` (boolean) - Whether tour is currently active
  - `category_id` (uuid, foreign key) - References categories table
  - `created_at` (timestamptz) - Tour creation timestamp
  
  ### 5. tour_translations
  - `id` (uuid, primary key) - Unique identifier for translation
  - `tour_id` (uuid, foreign key) - References tours table
  - `language_code` (text) - Language code (pt_BR, en_US, es_ES)
  - `title` (text) - Translated tour title
  - `description` (text) - Translated tour description
  - `whats_included` (text) - What's included in the tour
  - `whats_excluded` (text) - What's not included
  - Unique constraint on (tour_id, language_code)
  
  ### 6. tour_images
  - `id` (uuid, primary key) - Unique identifier for image
  - `tour_id` (uuid, foreign key) - References tours table
  - `image_url` (text) - URL to image in storage bucket
  - `alt_text` (text) - Alternative text for accessibility
  - `display_order` (integer) - Order for displaying images
  
  ### 7. tour_availability
  - `id` (uuid, primary key) - Unique identifier for availability slot
  - `tour_id` (uuid, foreign key) - References tours table
  - `available_date` (date) - Date when tour is available
  - `total_spots` (integer) - Total capacity for this date
  - `spots_booked` (integer) - Number of spots already booked
  - Unique constraint on (tour_id, available_date)
  
  ### 8. site_settings
  - `id` (uuid, primary key) - Unique identifier for setting
  - `setting_key` (text, unique) - Setting key name
  - `setting_value` (text) - Setting value
  
  ## Security
  - Enable RLS on all tables
  - Add policies for authenticated admin access
  - Add policies for public read access where appropriate
*/

-- Create admins table
CREATE TABLE IF NOT EXISTS admins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read own data"
  ON admins FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view categories"
  ON categories FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert categories"
  ON categories FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update categories"
  ON categories FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete categories"
  ON categories FOR DELETE
  TO authenticated
  USING (true);

-- Create category_translations table
CREATE TABLE IF NOT EXISTS category_translations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  language_code text NOT NULL,
  name text NOT NULL,
  slug text NOT NULL,
  UNIQUE(category_id, language_code)
);

ALTER TABLE category_translations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view category translations"
  ON category_translations FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert category translations"
  ON category_translations FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update category translations"
  ON category_translations FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete category translations"
  ON category_translations FOR DELETE
  TO authenticated
  USING (true);

-- Create tours table
CREATE TABLE IF NOT EXISTS tours (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  base_price numeric(10, 2) NOT NULL,
  duration_hours integer,
  location text,
  is_active boolean DEFAULT true,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE tours ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active tours"
  ON tours FOR SELECT
  TO anon, authenticated
  USING (is_active = true OR auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert tours"
  ON tours FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update tours"
  ON tours FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete tours"
  ON tours FOR DELETE
  TO authenticated
  USING (true);

-- Create tour_translations table
CREATE TABLE IF NOT EXISTS tour_translations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tour_id uuid NOT NULL REFERENCES tours(id) ON DELETE CASCADE,
  language_code text NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  whats_included text,
  whats_excluded text,
  UNIQUE(tour_id, language_code)
);

ALTER TABLE tour_translations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view tour translations"
  ON tour_translations FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert tour translations"
  ON tour_translations FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update tour translations"
  ON tour_translations FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete tour translations"
  ON tour_translations FOR DELETE
  TO authenticated
  USING (true);

-- Create tour_images table
CREATE TABLE IF NOT EXISTS tour_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tour_id uuid NOT NULL REFERENCES tours(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  alt_text text,
  display_order integer DEFAULT 0
);

ALTER TABLE tour_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view tour images"
  ON tour_images FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert tour images"
  ON tour_images FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update tour images"
  ON tour_images FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete tour images"
  ON tour_images FOR DELETE
  TO authenticated
  USING (true);

-- Create tour_availability table
CREATE TABLE IF NOT EXISTS tour_availability (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tour_id uuid NOT NULL REFERENCES tours(id) ON DELETE CASCADE,
  available_date date NOT NULL,
  total_spots integer NOT NULL,
  spots_booked integer DEFAULT 0,
  UNIQUE(tour_id, available_date)
);

ALTER TABLE tour_availability ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view tour availability"
  ON tour_availability FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert tour availability"
  ON tour_availability FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update tour availability"
  ON tour_availability FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete tour availability"
  ON tour_availability FOR DELETE
  TO authenticated
  USING (true);

-- Create site_settings table
CREATE TABLE IF NOT EXISTS site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key text UNIQUE NOT NULL,
  setting_value text
);

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view site settings"
  ON site_settings FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert site settings"
  ON site_settings FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update site settings"
  ON site_settings FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete site settings"
  ON site_settings FOR DELETE
  TO authenticated
  USING (true);

-- Insert initial site settings
INSERT INTO site_settings (setting_key, setting_value) VALUES
('whatsapp_number', '5545000000000'),
('tripadvisor_url', 'https://www.tripadvisor.com/your_page'),
('contact_email', 'contato@araucaria.com')
ON CONFLICT (setting_key) DO NOTHING;