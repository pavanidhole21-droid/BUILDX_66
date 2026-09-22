-- =========================================================
-- BLOODHELP DATABASE SCHEMA & QUERIES (SUPABASE / POSTGRESQL)
-- =========================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis"; -- For geo distance queries (optional but recommended)

-- 2. ENUM TYPES
DO $$ BEGIN
    CREATE TYPE blood_group_type AS ENUM ('A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE organization_type AS ENUM ('Hospital', 'Blood Bank', 'NGO');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE request_status_type AS ENUM ('Searching', 'Pending', 'Accepted', 'Rejected', 'Completed', 'Cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. PROFILES TABLE (Extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    blood_group blood_group_type,
    city TEXT DEFAULT 'Nagpur',
    state TEXT DEFAULT 'Maharashtra',
    latitude DOUBLE PRECISION DEFAULT 21.1458,
    longitude DOUBLE PRECISION DEFAULT 79.0882,
    role TEXT DEFAULT 'recipient' CHECK (role IN ('recipient', 'donor', 'provider', 'admin')),
    is_available_donor BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. ORGANIZATIONS TABLE (Hospitals, Blood Banks, NGOs)
CREATE TABLE IF NOT EXISTS public.organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    type organization_type NOT NULL DEFAULT 'Blood Bank',
    address TEXT NOT NULL,
    city TEXT NOT NULL DEFAULT 'Nagpur',
    state TEXT NOT NULL DEFAULT 'Maharashtra',
    phone TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    is_verified BOOLEAN DEFAULT false,
    is_open_24_hours BOOLEAN DEFAULT true,
    operating_hours TEXT DEFAULT 'Open 24 hours',
    provider_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. BLOOD INVENTORY TABLE
CREATE TABLE IF NOT EXISTS public.blood_inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    blood_group blood_group_type NOT NULL,
    units INTEGER NOT NULL DEFAULT 0 CHECK (units >= 0),
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    CONSTRAINT unique_org_blood_group UNIQUE (organization_id, blood_group)
);

-- 6. BLOOD REQUESTS TABLE
CREATE TABLE IF NOT EXISTS public.blood_requests (
    id TEXT PRIMARY KEY, -- e.g. #BH20250915
    requester_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    patient_name TEXT NOT NULL,
    blood_group blood_group_type NOT NULL,
    units INTEGER NOT NULL DEFAULT 1 CHECK (units > 0),
    hospital_name TEXT NOT NULL,
    hospital_address TEXT,
    is_emergency BOOLEAN DEFAULT false,
    contact_person TEXT NOT NULL,
    contact_phone TEXT NOT NULL,
    additional_note TEXT,
    status request_status_type DEFAULT 'Searching',
    organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================================================
-- 7. SMART SEARCH & RANKING FUNCTION (USP)
-- Calculates distance (Haversine formula in KM) and matches blood availability
-- =========================================================
CREATE OR REPLACE FUNCTION public.search_blood_sources(
    p_blood_group blood_group_type,
    p_units INTEGER,
    p_user_lat DOUBLE PRECISION,
    p_user_lng DOUBLE PRECISION,
    p_max_distance_km DOUBLE PRECISION DEFAULT 25.0,
    p_verified_only BOOLEAN DEFAULT false
)
RETURNS TABLE (
    organization_id UUID,
    organization_name TEXT,
    organization_type organization_type,
    address TEXT,
    city TEXT,
    phone TEXT,
    is_verified BOOLEAN,
    is_open_24_hours BOOLEAN,
    operating_hours TEXT,
    distance_km DOUBLE PRECISION,
    reported_units INTEGER,
    last_updated TIMESTAMPTZ,
    minutes_ago DOUBLE PRECISION,
    match_score INTEGER
) LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY
    SELECT 
        o.id AS organization_id,
        o.name AS organization_name,
        o.type AS organization_type,
        o.address,
        o.city,
        o.phone,
        o.is_verified,
        o.is_open_24_hours,
        o.operating_hours,
        -- Haversine distance formula (in km)
        ROUND((
            6371 * acos(
                cos(radians(p_user_lat)) * cos(radians(o.latitude)) * 
                cos(radians(o.longitude) - radians(p_user_lng)) + 
                sin(radians(p_user_lat)) * sin(radians(o.latitude))
            )
        )::numeric, 1)::DOUBLE PRECISION AS distance_km,
        COALESCE(i.units, 0) AS reported_units,
        COALESCE(i.last_updated, o.updated_at) AS last_updated,
        EXTRACT(EPOCH FROM (NOW() - COALESCE(i.last_updated, o.updated_at))) / 60.0 AS minutes_ago,
        -- Smart Score: units match + verification + proximity + freshness
        (
            CASE WHEN COALESCE(i.units, 0) >= p_units THEN 50
                 WHEN COALESCE(i.units, 0) > 0 THEN 20
                 ELSE 0 END +
            CASE WHEN o.is_verified THEN 20 ELSE 0 END +
            CASE WHEN (6371 * acos(cos(radians(p_user_lat)) * cos(radians(o.latitude)) * cos(radians(o.longitude) - radians(p_user_lng)) + sin(radians(p_user_lat)) * sin(radians(o.latitude)))) <= 5.0 THEN 20 ELSE 10 END +
            CASE WHEN (EXTRACT(EPOCH FROM (NOW() - COALESCE(i.last_updated, o.updated_at))) / 60.0) <= 60 THEN 15 ELSE 5 END
        )::INTEGER AS match_score
    FROM public.organizations o
    LEFT JOIN public.blood_inventory i 
        ON o.id = i.organization_id AND i.blood_group = p_blood_group
    WHERE 
        (NOT p_verified_only OR o.is_verified = true)
        AND (
            6371 * acos(
                cos(radians(p_user_lat)) * cos(radians(o.latitude)) * 
                cos(radians(o.longitude) - radians(p_user_lng)) + 
                sin(radians(p_user_lat)) * sin(radians(o.latitude))
            )
        ) <= p_max_distance_km
    ORDER BY match_score DESC, distance_km ASC;
END;
$$;

-- =========================================================
-- 8. ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blood_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blood_requests ENABLE ROW LEVEL SECURITY;

-- Profiles: Public can view donors, users can update their own
CREATE POLICY "Public profiles are viewable by everyone" 
ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Organizations: Everyone can view verified organizations
CREATE POLICY "Organizations are viewable by everyone" 
ON public.organizations FOR SELECT USING (true);

CREATE POLICY "Providers can update own organization" 
ON public.organizations FOR UPDATE USING (auth.uid() = provider_id);

-- Blood Inventory: Public viewable, provider editable
CREATE POLICY "Blood inventory is viewable by everyone" 
ON public.blood_inventory FOR SELECT USING (true);

CREATE POLICY "Providers can update their blood inventory" 
ON public.blood_inventory FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.organizations o 
        WHERE o.id = blood_inventory.organization_id AND o.provider_id = auth.uid()
    )
);

-- Blood Requests: Anyone can insert, requesters and providers can view
CREATE POLICY "Anyone authenticated can create request" 
ON public.blood_requests FOR INSERT WITH CHECK (true);

CREATE POLICY "Requests viewable by requester and providers" 
ON public.blood_requests FOR SELECT USING (
    auth.uid() = requester_id OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('provider', 'admin'))
);

CREATE POLICY "Providers and requesters can update request status" 
ON public.blood_requests FOR UPDATE USING (
    auth.uid() = requester_id OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('provider', 'admin'))
);

-- =========================================================
-- 9. INITIAL SEED DATA (NAGPUR HOSPITALS & BLOOD BANKS)
-- =========================================================
DO $$
DECLARE
    gmch_id UUID := gen_random_uuid();
    redcross_id UUID := gen_random_uuid();
    lifecare_id UUID := gen_random_uuid();
    cityblood_id UUID := gen_random_uuid();
BEGIN
    -- Insert Organizations
    INSERT INTO public.organizations (id, name, type, address, city, state, phone, latitude, longitude, is_verified, is_open_24_hours, operating_hours)
    VALUES 
    (gmch_id, 'Government Medical College & Hospital', 'Hospital', 'Mahatma Gandhi Rd, Dhantoli, Nagpur, Maharashtra 440012', 'Nagpur', 'Maharashtra', '+91 712 245 6789', 21.1345, 79.0825, true, true, 'Open 24 hours'),
    (redcross_id, 'Red Cross Blood Bank', 'Blood Bank', 'Civil Lines, Near High Court, Nagpur, Maharashtra 440001', 'Nagpur', 'Maharashtra', '+91 712 256 1234', 21.1524, 79.0768, true, true, 'Open 24 hours'),
    (lifecare_id, 'LifeCare Hospital', 'Hospital', 'Wardha Rd, Somalwada, Nagpur, Maharashtra 440025', 'Nagpur', 'Maharashtra', '+91 712 278 9012', 21.1021, 79.0684, false, true, 'Open 24 hours'),
    (cityblood_id, 'City Blood Bank', 'Blood Bank', 'Dharampeth, VIP Road, Nagpur, Maharashtra 440010', 'Nagpur', 'Maharashtra', '+91 712 253 4567', 21.1412, 79.0612, true, false, '8:00 AM - 10:00 PM')
    ON CONFLICT (id) DO NOTHING;

    -- Insert Inventory for GMCH
    INSERT INTO public.blood_inventory (organization_id, blood_group, units, last_updated) VALUES
    (gmch_id, 'O+', 8, NOW() - INTERVAL '12 minutes'),
    (gmch_id, 'O-', 2, NOW() - INTERVAL '12 minutes'),
    (gmch_id, 'A+', 6, NOW() - INTERVAL '12 minutes'),
    (gmch_id, 'A-', 1, NOW() - INTERVAL '12 minutes'),
    (gmch_id, 'B+', 7, NOW() - INTERVAL '12 minutes'),
    (gmch_id, 'B-', 2, NOW() - INTERVAL '12 minutes'),
    (gmch_id, 'AB+', 4, NOW() - INTERVAL '12 minutes'),
    (gmch_id, 'AB-', 1, NOW() - INTERVAL '12 minutes')
    ON CONFLICT DO NOTHING;

    -- Insert Inventory for Red Cross
    INSERT INTO public.blood_inventory (organization_id, blood_group, units, last_updated) VALUES
    (redcross_id, 'O+', 5, NOW() - INTERVAL '30 minutes'),
    (redcross_id, 'O-', 1, NOW() - INTERVAL '30 minutes'),
    (redcross_id, 'A+', 4, NOW() - INTERVAL '30 minutes'),
    (redcross_id, 'A-', 0, NOW() - INTERVAL '30 minutes'),
    (redcross_id, 'B+', 5, NOW() - INTERVAL '30 minutes'),
    (redcross_id, 'B-', 1, NOW() - INTERVAL '30 minutes'),
    (redcross_id, 'AB+', 2, NOW() - INTERVAL '30 minutes'),
    (redcross_id, 'AB-', 0, NOW() - INTERVAL '30 minutes')
    ON CONFLICT DO NOTHING;

    -- Sample Initial Blood Requests
    INSERT INTO public.blood_requests (id, patient_name, blood_group, units, hospital_name, hospital_address, is_emergency, contact_person, contact_phone, status, organization_id, created_at) VALUES
    ('#BH20250915', 'Amit Sharma', 'O+', 2, 'Government Medical College & Hospital', 'Dhantoli, Nagpur', true, 'Rohit Sharma', '+91 9876543210', 'Searching', gmch_id, NOW()),
    ('#BH20250910', 'Sunita Verma', 'A+', 1, 'Red Cross Blood Bank', 'Civil Lines, Nagpur', false, 'Rohit Bramhe', '+91 9876543210', 'Accepted', redcross_id, NOW() - INTERVAL '2 days'),
    ('#BH20250905', 'Kavita Patil', 'O+', 3, 'LifeCare Hospital', 'Wardha Rd, Nagpur', false, 'Rohit Bramhe', '+91 9876543210', 'Completed', lifecare_id, NOW() - INTERVAL '5 days'),
    ('#BH20250828', 'Rajesh Kumar', 'B+', 1, 'City Blood Bank', 'Dharampeth, Nagpur', false, 'Rohit Bramhe', '+91 9876543210', 'Cancelled', cityblood_id, NOW() - INTERVAL '10 days')
    ON CONFLICT DO NOTHING;
END $$;
