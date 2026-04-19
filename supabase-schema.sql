-- =============================================
-- City Turizm - Supabase Veritabanı Şeması
-- =============================================

-- TURLAR
create table if not exists tours (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  slug text unique not null,
  description text,
  short_description text,
  price numeric not null,
  currency text default 'TRY',
  duration_days int,
  destination text,
  country text,
  category text,
  image_url text,
  gallery text[] default '{}',
  featured boolean default false,
  rating numeric default 0,
  review_count int default 0,
  max_persons int default 20,
  departure_date date,
  includes text[] default '{}',
  excludes text[] default '{}',
  created_at timestamptz default now()
);

-- DESTİNASYONLAR
create table if not exists destinations (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  country text,
  description text,
  image_url text,
  tour_count int default 0,
  slug text unique not null,
  created_at timestamptz default now()
);

-- MÜŞTERİ YORUMLARI
create table if not exists testimonials (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  avatar_url text,
  rating int check (rating >= 1 and rating <= 5),
  comment text,
  tour_title text,
  date date default current_date,
  created_at timestamptz default now()
);

-- SLIDER İÇERİKLERİ
create table if not exists slider_items (
  id uuid default gen_random_uuid() primary key,
  type text check (type in ('image', 'video')) default 'image',
  src text not null,
  title text not null,
  subtitle text,
  cta_text text,
  cta_link text,
  sort_order int default 0,
  active boolean default true,
  created_at timestamptz default now()
);

-- İLETİŞİM FORMU
create table if not exists contact_messages (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  email text not null,
  phone text,
  subject text,
  message text not null,
  created_at timestamptz default now()
);

-- BÜLTEN ABONELİKLERİ
create table if not exists newsletter_subscribers (
  id uuid default gen_random_uuid() primary key,
  email text unique not null,
  created_at timestamptz default now()
);

-- =============================================
-- Public okuma izinleri (RLS)
-- =============================================
alter table tours enable row level security;
alter table destinations enable row level security;
alter table testimonials enable row level security;
alter table slider_items enable row level security;

create policy "Public read tours" on tours for select using (true);
create policy "Public read destinations" on destinations for select using (true);
create policy "Public read testimonials" on testimonials for select using (true);
create policy "Public read slider" on slider_items for select using (active = true);

-- Contact ve newsletter için insert izni
alter table contact_messages enable row level security;
alter table newsletter_subscribers enable row level security;
create policy "Anyone can submit contact" on contact_messages for insert with check (true);
create policy "Anyone can subscribe" on newsletter_subscribers for insert with check (true);

-- =============================================
-- Admin Panel - Sayfa İçerik Yönetimi
-- =============================================
create table if not exists page_content (
  id uuid default gen_random_uuid() primary key,
  page_id text not null,
  section_id text not null,
  field_id text not null,
  tr text default '',
  en text default '',
  updated_at timestamptz default now(),
  unique(page_id, section_id, field_id)
);

alter table page_content enable row level security;

-- Authenticated users (admin) can read/write
create policy "Authenticated can manage page_content"
  on page_content for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- Public read access for frontend
create policy "Public read page_content"
  on page_content for select
  using (true);

-- ═══════════════════════════════════════════════════════════════════════════════
-- NEWSLETTER SUBSCRIBERS
-- ═══════════════════════════════════════════════════════════════════════════════
create table if not exists newsletter_subscribers (
  id uuid default gen_random_uuid() primary key,
  email text not null unique,
  subscribed_at timestamptz default now(),
  active boolean default true
);

alter table newsletter_subscribers enable row level security;

-- Anyone can subscribe
create policy "Public can subscribe"
  on newsletter_subscribers for insert
  with check (true);

-- Authenticated users (admin) can read/manage
create policy "Admin can manage newsletter"
  on newsletter_subscribers for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- ═══════════════════════════════════════════════════════════════════════════════
-- CONTACT MESSAGES
-- ═══════════════════════════════════════════════════════════════════════════════
create table if not exists contact_messages (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  email text not null,
  phone text default '',
  message text not null,
  source text default 'contact',
  is_read boolean default false,
  created_at timestamptz default now()
);

alter table contact_messages enable row level security;

create policy "Public can send messages"
  on contact_messages for insert
  with check (true);

create policy "Admin can manage messages"
  on contact_messages for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- ═══════════════════════════════════════════════════════════════════════════════
-- TEKLİF TALEPLERİ (QUOTES)
-- ═══════════════════════════════════════════════════════════════════════════════
create table if not exists quotes (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  email text not null,
  phone text default '',
  company text default '',
  message text default '',
  source text default 'genel',
  is_read boolean default false,
  created_at timestamptz default now()
);

alter table quotes enable row level security;

create policy "Public can submit quotes"
  on quotes for insert
  with check (true);

create policy "Admin can manage quotes"
  on quotes for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- ═══════════════════════════════════════════════════════════════════════════════
-- BAŞVURULAR (APPLICATIONS)
-- ═══════════════════════════════════════════════════════════════════════════════
create table if not exists applications (
  id uuid default gen_random_uuid() primary key,
  form_type text not null default 'genel',
  name text not null,
  email text not null,
  phone text default '',
  data jsonb default '{}',
  is_read boolean default false,
  created_at timestamptz default now()
);

alter table applications enable row level security;

create policy "Public can submit applications"
  on applications for insert
  with check (true);

create policy "Admin can manage applications"
  on applications for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- ── SEO Settings Table ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS seo_settings (
  key        TEXT PRIMARY KEY,
  value      TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Allow service role full access
ALTER TABLE seo_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access" ON seo_settings
  FOR ALL USING (true) WITH CHECK (true);

-- ── Site Settings Table ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS site_settings (
  key        TEXT PRIMARY KEY,
  value      TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access on site_settings" ON site_settings
  FOR ALL USING (true) WITH CHECK (true);
