-- ============================================================
-- BloodHelp Supabase Schema
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard
-- ============================================================

-- 1. PROFILES TABLE (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id           UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name    TEXT NOT NULL DEFAULT '',
  email        TEXT DEFAULT '',
  phone        TEXT NOT NULL DEFAULT '',
  blood_group  TEXT CHECK (blood_group IN ('A+','A-','B+','B-','O+','O-','AB+','AB-')),
  city         TEXT NOT NULL DEFAULT 'Nagpur',
  state        TEXT NOT NULL DEFAULT 'Maharashtra',
  role         TEXT NOT NULL DEFAULT 'recipient' CHECK (role IN ('recipient','donor','provider','admin')),
  is_available_donor BOOLEAN DEFAULT FALSE,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- 2. ORGANIZATIONS TABLE
CREATE TABLE IF NOT EXISTS public.organizations (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name             TEXT NOT NULL,
  type             TEXT NOT NULL CHECK (type IN ('Hospital','Blood Bank','NGO')),
  address          TEXT NOT NULL DEFAULT '',
  city             TEXT NOT NULL DEFAULT 'Nagpur',
  state            TEXT NOT NULL DEFAULT 'Maharashtra',
  phone            TEXT NOT NULL DEFAULT '',
  is_verified      BOOLEAN DEFAULT FALSE,
  is_open_24_hours BOOLEAN DEFAULT TRUE,
  operating_hours  TEXT DEFAULT 'Open 24 hours',
  latitude         DOUBLE PRECISION DEFAULT 21.1458,
  longitude        DOUBLE PRECISION DEFAULT 79.0882,
  provider_id      UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- 3. BLOOD INVENTORY TABLE
CREATE TABLE IF NOT EXISTS public.blood_inventory (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  blood_group     TEXT NOT NULL CHECK (blood_group IN ('A+','A-','B+','B-','O+','O-','AB+','AB-')),
  units           INTEGER NOT NULL DEFAULT 0 CHECK (units >= 0),
  last_updated    TIMESTAMPTZ DEFAULT NOW(),
  updated_by      UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  UNIQUE(organization_id, blood_group)
);

-- 4. BLOOD REQUESTS TABLE
CREATE TABLE IF NOT EXISTS public.blood_requests (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  patient_name      TEXT NOT NULL,
  blood_group       TEXT NOT NULL CHECK (blood_group IN ('A+','A-','B+','B-','O+','O-','AB+','AB-')),
  units             INTEGER NOT NULL DEFAULT 1 CHECK (units > 0),
  hospital_name     TEXT NOT NULL,
  hospital_address  TEXT NOT NULL DEFAULT '',
  is_emergency      BOOLEAN DEFAULT FALSE,
  contact_person    TEXT NOT NULL DEFAULT '',
  contact_phone     TEXT NOT NULL DEFAULT '',
  additional_note   TEXT,
  status            TEXT NOT NULL DEFAULT 'Searching' CHECK (status IN ('Searching','Pending','Accepted','Rejected','Completed','Cancelled')),
  organization_id   UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- 5. EMERGENCY REQUESTS TABLE
CREATE TABLE IF NOT EXISTS public.emergency_requests (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  blood_group TEXT NOT NULL CHECK (blood_group IN ('A+','A-','B+','B-','O+','O-','AB+','AB-')),
  units       INTEGER NOT NULL DEFAULT 1,
  contact     TEXT NOT NULL DEFAULT '',
  city        TEXT NOT NULL DEFAULT 'Nagpur',
  status      TEXT NOT NULL DEFAULT 'Broadcasting' CHECK (status IN ('Broadcasting','Accepted','Resolved','Cancelled')),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blood_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blood_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_requests ENABLE ROW LEVEL SECURITY;

-- PROFILES: users can read/update their own profile
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- ORGANIZATIONS: all authenticated users can read; provider updates own; admin full access
CREATE POLICY "orgs_select_all" ON public.organizations FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "orgs_insert_admin" ON public.organizations FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "orgs_update_provider_or_admin" ON public.organizations FOR UPDATE USING (
  provider_id = auth.uid() OR
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- BLOOD INVENTORY: all authenticated users can read; providers update own org
CREATE POLICY "inventory_select_all" ON public.blood_inventory FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "inventory_upsert_provider" ON public.blood_inventory FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.organizations WHERE id = organization_id AND provider_id = auth.uid())
  OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "inventory_update_provider" ON public.blood_inventory FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.organizations WHERE id = organization_id AND provider_id = auth.uid())
  OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- BLOOD REQUESTS: users see own; admin sees all
CREATE POLICY "requests_select_own" ON public.blood_requests FOR SELECT USING (
  requester_id = auth.uid() OR
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','provider'))
);
CREATE POLICY "requests_insert_own" ON public.blood_requests FOR INSERT WITH CHECK (auth.uid() = requester_id);
CREATE POLICY "requests_update_status" ON public.blood_requests FOR UPDATE USING (
  requester_id = auth.uid() OR
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','provider'))
);

-- EMERGENCY REQUESTS: users see own; admin/provider see all
CREATE POLICY "emergency_select" ON public.emergency_requests FOR SELECT USING (
  user_id = auth.uid() OR
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','provider'))
);
CREATE POLICY "emergency_insert_own" ON public.emergency_requests FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- HELPER FUNCTION: auto-update updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_orgs_updated_at BEFORE UPDATE ON public.organizations FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_requests_updated_at BEFORE UPDATE ON public.blood_requests FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================
-- SEED: 4 sample organizations (Nagpur)
-- ============================================================
INSERT INTO public.organizations (id, name, type, address, city, state, phone, is_verified, is_open_24_hours, operating_hours, latitude, longitude) VALUES
  ('a1b2c3d4-0001-0001-0001-000000000001', 'Government Medical College & Hospital', 'Hospital', 'Mahatma Gandhi Rd, Dhantoli, Nagpur 440012', 'Nagpur', 'Maharashtra', '+917122456789', true, true, 'Open 24 hours', 21.1345, 79.0825),
  ('a1b2c3d4-0001-0001-0001-000000000002', 'Red Cross Blood Bank', 'Blood Bank', 'Civil Lines, Near High Court, Nagpur 440001', 'Nagpur', 'Maharashtra', '+917122561234', true, true, 'Open 24 hours', 21.1524, 79.0768),
  ('a1b2c3d4-0001-0001-0001-000000000003', 'LifeCare Hospital', 'Hospital', 'Wardha Rd, Somalwada, Nagpur 440025', 'Nagpur', 'Maharashtra', '+917122789012', false, true, 'Open 24 hours', 21.1021, 79.0684),
  ('a1b2c3d4-0001-0001-0001-000000000004', 'City Blood Bank', 'Blood Bank', 'Dharampeth, VIP Road, Nagpur 440010', 'Nagpur', 'Maharashtra', '+917122534567', true, false, '8:00 AM - 10:00 PM', 21.1412, 79.0612)
ON CONFLICT (id) DO NOTHING;

-- SEED: blood inventory for each org
INSERT INTO public.blood_inventory (organization_id, blood_group, units) VALUES
  ('a1b2c3d4-0001-0001-0001-000000000001','A+',6),('a1b2c3d4-0001-0001-0001-000000000001','A-',1),
  ('a1b2c3d4-0001-0001-0001-000000000001','B+',7),('a1b2c3d4-0001-0001-0001-000000000001','B-',2),
  ('a1b2c3d4-0001-0001-0001-000000000001','O+',8),('a1b2c3d4-0001-0001-0001-000000000001','O-',2),
  ('a1b2c3d4-0001-0001-0001-000000000001','AB+',4),('a1b2c3d4-0001-0001-0001-000000000001','AB-',1),

  ('a1b2c3d4-0001-0001-0001-000000000002','A+',4),('a1b2c3d4-0001-0001-0001-000000000002','A-',0),
  ('a1b2c3d4-0001-0001-0001-000000000002','B+',5),('a1b2c3d4-0001-0001-0001-000000000002','B-',1),
  ('a1b2c3d4-0001-0001-0001-000000000002','O+',5),('a1b2c3d4-0001-0001-0001-000000000002','O-',1),
  ('a1b2c3d4-0001-0001-0001-000000000002','AB+',2),('a1b2c3d4-0001-0001-0001-000000000002','AB-',0),

  ('a1b2c3d4-0001-0001-0001-000000000003','A+',3),('a1b2c3d4-0001-0001-0001-000000000003','A-',1),
  ('a1b2c3d4-0001-0001-0001-000000000003','B+',3),('a1b2c3d4-0001-0001-0001-000000000003','B-',0),
  ('a1b2c3d4-0001-0001-0001-000000000003','O+',2),('a1b2c3d4-0001-0001-0001-000000000003','O-',0),
  ('a1b2c3d4-0001-0001-0001-000000000003','AB+',1),('a1b2c3d4-0001-0001-0001-000000000003','AB-',0),

  ('a1b2c3d4-0001-0001-0001-000000000004','A+',5),('a1b2c3d4-0001-0001-0001-000000000004','A-',2),
  ('a1b2c3d4-0001-0001-0001-000000000004','B+',6),('a1b2c3d4-0001-0001-0001-000000000004','B-',1),
  ('a1b2c3d4-0001-0001-0001-000000000004','O+',4),('a1b2c3d4-0001-0001-0001-000000000004','O-',2),
  ('a1b2c3d4-0001-0001-0001-000000000004','AB+',3),('a1b2c3d4-0001-0001-0001-000000000004','AB-',1)
ON CONFLICT (organization_id, blood_group) DO NOTHING;

