-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.projects (
  platform USER-DEFINED NOT NULL DEFAULT 'mobile'::platform_type,
  title text NOT NULL,
  short_desc text NOT NULL,
  full_desc text NOT NULL,
  cover_image text NOT NULL,
  repository_link text,
  demo_link text,
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  images ARRAY NOT NULL DEFAULT '{}'::text[],
  features ARRAY NOT NULL DEFAULT '{}'::text[],
  tech_stack ARRAY NOT NULL DEFAULT '{}'::text[],
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT projects_pkey PRIMARY KEY (id)
);
CREATE TABLE public.experience (
  title text NOT NULL,
  description text NOT NULL,
  date_range text NOT NULL,
  location text NOT NULL,
  image text NOT NULL,
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT experience_pkey PRIMARY KEY (id)
);
CREATE TABLE public.certificates (
  title text NOT NULL,
  issuer text NOT NULL,
  image text NOT NULL,
  credential_link text,
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT certificates_pkey PRIMARY KEY (id)
);
CREATE TABLE public.skills (
  category text NOT NULL,
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  items ARRAY NOT NULL DEFAULT '{}'::text[],
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT skills_pkey PRIMARY KEY (id)
);
CREATE TABLE public.education (
  institution text NOT NULL,
  degree text NOT NULL,
  date_range text NOT NULL,
  location text NOT NULL,
  image text NOT NULL,
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT education_pkey PRIMARY KEY (id)
);
CREATE TABLE public.contact_info (
  photo text,
  email text NOT NULL,
  phone text,
  location text,
  linkedin text,
  github text,
  portfolio text,
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT contact_info_pkey PRIMARY KEY (id)
);