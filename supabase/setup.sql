create extension if not exists "pgcrypto";

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  title text not null unique,
  description text not null,
  tech_stack text[] not null default '{}',
  source_url text,
  demo_url text,
  display_order integer not null default 0,
  is_featured boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.cv_files (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  file_path text not null,
  file_url text not null,
  is_active boolean not null default false,
  created_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_projects_updated_at on public.projects;
create trigger set_projects_updated_at
before update on public.projects
for each row
execute function public.set_updated_at();

alter table public.projects enable row level security;
alter table public.cv_files enable row level security;

drop policy if exists "Public can read featured projects" on public.projects;
create policy "Public can read featured projects"
on public.projects
for select
to anon, authenticated
using (is_featured = true);

drop policy if exists "Public can read active cv" on public.cv_files;
create policy "Public can read active cv"
on public.cv_files
for select
to anon, authenticated
using (is_active = true);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('portfolio', 'portfolio', true, 10485760, array['application/pdf'])
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

insert into public.projects
  (title, description, tech_stack, source_url, demo_url, display_order, is_featured)
values
  (
    'BYWAY',
    'Byway is a comprehensive full-stack e-learning platform built with React.js, Django REST Framework, and PostgreSQL. It provides course creation, enrollment, video learning, quizzes, community discussions, real-time chat, progress tracking, grading, and certificate generation.

Note: The backend is hosted on Render''s free tier. Due to Render''s temporary file storage, some uploaded media files may not be available after server restarts.

Demo Login Credentials
Student: Student@123
Instructor: Instructor@123
Admin: admin@123',
    array['Full Stack', 'Django REST', 'React JS'],
    'https://github.com/MrNihalT/Byway-E-Learning-Platform',
    'https://byway-e-learning-platform.vercel.app/',
    1,
    true
  ),
  (
    'ARTS MANAGEMENT SYSTEM',
    'An event management platform built to streamline arts competitions. It supports custom user roles, judge scoring, dynamic rankings, and Redis caching for the leaderboard.',
    array['Full Stack', 'React', 'Django', 'PostgreSQL', 'Redis'],
    'https://github.com/MrNihalT/Arts-Management',
    null,
    2,
    true
  ),
  (
    'ELARA STAYS',
    'A luxury resort discovery and booking platform featuring dynamic category filtering, gallery modals, booking enquiries, structured JSON-LD schemas, and GSAP scroll animations.',
    array['Next.js', 'React', 'GSAP', 'Tailwind CSS'],
    'https://github.com/MrNihalT/ELARA-STAYS',
    'https://elarastays.nihalt.in/',
    3,
    true
  ),
  (
    'TIQNIA',
    'Built and maintained the official IT Fest website for the Department of Computer Applications, WMO IG Arts and Science College, Wayanad using React.js, Vite, and Firebase. Developed responsive pages for event details, schedules, sponsors, and registration information, providing an intuitive user experience across devices. Integrated Firebase services for content management and data handling, enabling a scalable and maintainable platform for future editions of the event.',
    array['React', 'Vite', 'Firebase'],
    'https://github.com/MrNihalT/tiqnia-website',
    'https://igfest.nihalt.in/',
    4,
    true
  ),
  (
    'Blog',
    'Django Blog Application This project is a user-friendly blog application built using the Django framework. It allows users to create accounts, manage their blog posts, and interact with content seamlessly. Designed for simplicity and functionality, the application serves as a robust foundation for anyone looking to build or expand a blogging platform.',
    array['Django'],
    'https://github.com/MrNihalT/blog',
    null,
    5,
    true
  )
on conflict (title) do update set
  description = excluded.description,
  tech_stack = excluded.tech_stack,
  source_url = excluded.source_url,
  demo_url = excluded.demo_url,
  display_order = excluded.display_order,
  is_featured = excluded.is_featured;
