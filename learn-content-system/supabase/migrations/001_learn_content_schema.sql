-- =====================================================
-- Learn Content System - Database Schema
-- Cluster-Pillar Model for Educational Content
-- =====================================================

-- Step 1: Create blog_posts table (if it doesn't exist)
-- This table stores both regular blog posts AND learn guides
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Basic Info
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT,
  content TEXT,

  -- Media
  featured_image_url TEXT,

  -- Categorization
  category TEXT NOT NULL, -- 'learn-guide' | 'astrology' | 'tarot' | 'numerology' | etc.

  -- Learn Content Specific Fields
  guide_type TEXT, -- 'cluster' | 'pillar' | NULL (for regular blog posts)
  guide_category TEXT, -- 'planets' | 'signs' | 'houses' | 'aspects' | 'guides'
  main_topic TEXT DEFAULT 'astrology', -- 'astrology' | 'tarot' | 'numerology' | etc.
  suggested_pillars TEXT[], -- Array of pillar titles (for clusters)
  parent_cluster_slug TEXT, -- Reference to parent cluster (for pillars)

  -- SEO & Metadata
  meta_title TEXT,
  meta_description TEXT,
  keywords TEXT[],

  -- Publishing
  status TEXT DEFAULT 'draft', -- 'draft' | 'published' | 'archived'
  published_at TIMESTAMPTZ,
  scheduled_for TIMESTAMPTZ,

  -- Analytics
  view_count INTEGER DEFAULT 0,
  word_count INTEGER,
  reading_time INTEGER, -- in minutes

  -- AI Generated
  ai_generated BOOLEAN DEFAULT false,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Author (optional - if you have auth system)
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Step 2: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON blog_posts(category);
CREATE INDEX IF NOT EXISTS idx_blog_posts_guide_type ON blog_posts(guide_type);
CREATE INDEX IF NOT EXISTS idx_blog_posts_guide_category ON blog_posts(guide_category);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON blog_posts(published_at);
CREATE INDEX IF NOT EXISTS idx_blog_posts_main_topic ON blog_posts(main_topic);

-- Step 3: Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_blog_posts_updated_at ON blog_posts;
CREATE TRIGGER update_blog_posts_updated_at
  BEFORE UPDATE ON blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Step 4: Create profiles table with admin field (if it doesn't exist)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 5: Row Level Security (RLS) Policies

-- Enable RLS
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Public can read published guides
CREATE POLICY "Public can read published guides" ON blog_posts
  FOR SELECT
  USING (status = 'published');

-- Authenticated users can read their own drafts
CREATE POLICY "Users can read own drafts" ON blog_posts
  FOR SELECT
  USING (auth.uid() = author_id);

-- Only admins can insert/update/delete guides
CREATE POLICY "Admins can insert guides" ON blog_posts
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

CREATE POLICY "Admins can update guides" ON blog_posts
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

CREATE POLICY "Admins can delete guides" ON blog_posts
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Profiles: Users can read their own profile
CREATE POLICY "Users can read own profile" ON profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Admins can read all profiles
CREATE POLICY "Admins can read all profiles" ON profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Step 6: Example Data (Optional - for testing)
-- Uncomment to insert sample cluster and pillar

/*
INSERT INTO blog_posts (
  title,
  slug,
  excerpt,
  content,
  category,
  guide_type,
  guide_category,
  main_topic,
  status,
  published_at,
  meta_title,
  meta_description,
  suggested_pillars,
  ai_generated
) VALUES (
  'Планети в астрологията - Пълно ръководство',
  'planeti-v-astrologiyata',
  'Разберете значението на всички планети в астрологичната карта.',
  '<div class="tldr-section"><p>Планетите са основните строителни блокове на астрологията...</p></div>',
  'learn-guide',
  'cluster',
  'planets',
  'astrology',
  'published',
  NOW(),
  'Планети в астрологията - Пълно ръководство 2025',
  'Разберете как планетите влияят на вашата натална карта. Пълен гид за начинаещи и напреднали.',
  ARRAY['Слънцето в астрологията', 'Луната в астрологията', 'Меркурий в астрологията'],
  true
);

INSERT INTO blog_posts (
  title,
  slug,
  excerpt,
  content,
  category,
  guide_type,
  guide_category,
  main_topic,
  status,
  published_at,
  meta_title,
  meta_description,
  ai_generated
) VALUES (
  'Слънцето в астрологията - Задълбочено ръководство',
  'slanceto-v-astrologiyata',
  'Слънцето символизира нашата есенция, идентичност и жизнена сила.',
  '<div class="tldr-section"><p>Слънцето е най-важната планета в астрологията...</p></div>',
  'learn-guide',
  'pillar',
  'planets',
  'astrology',
  'published',
  NOW(),
  'Слънцето в астрологията - Пълно значение и влияние',
  'Научете всичко за Слънцето в астрологията: символика, значение в знаците и къщите.',
  true
);
*/

-- =====================================================
-- Migration Complete
-- =====================================================
-- Next steps:
-- 1. Run this migration: supabase db push
-- 2. Make your first user admin:
--    UPDATE profiles SET is_admin = true WHERE email = 'your@email.com';
-- 3. Access /admin/learn-content to start creating content
-- =====================================================
