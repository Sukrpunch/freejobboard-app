-- FreeJobBoard.ai Database Schema

-- Boards
create table if not exists boards (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  tagline text,
  custom_domain text unique,
  owner_id uuid references auth.users(id) on delete cascade not null,
  logo_url text,
  primary_color text not null default '#6366f1',
  theme text not null default 'light' check (theme in ('light','dark','auto')),
  category text,
  approved boolean not null default true,
  created_at timestamptz not null default now()
);

-- Jobs
create table if not exists jobs (
  id uuid primary key default gen_random_uuid(),
  board_id uuid references boards(id) on delete cascade not null,
  employer_id uuid,
  title text not null,
  slug text not null,
  company text not null,
  company_logo_url text,
  location text not null default 'Remote',
  remote boolean not null default false,
  job_type text not null default 'full-time' check (job_type in ('full-time','part-time','contract','freelance','internship')),
  salary_min integer,
  salary_max integer,
  salary_currency text not null default 'USD',
  description text not null,
  requirements text,
  apply_url text,
  apply_email text,
  status text not null default 'active' check (status in ('draft','active','filled','expired')),
  featured boolean not null default false,
  views integer not null default 0,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  unique(board_id, slug)
);

-- Employers
create table if not exists employers (
  id uuid primary key default gen_random_uuid(),
  board_id uuid references boards(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  company_name text not null,
  website text,
  logo_url text,
  description text,
  verified boolean not null default false,
  created_at timestamptz not null default now(),
  unique(board_id, user_id)
);

-- Candidates
create table if not exists candidates (
  id uuid primary key default gen_random_uuid(),
  board_id uuid references boards(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  email text not null,
  resume_url text,
  headline text,
  created_at timestamptz not null default now(),
  unique(board_id, user_id)
);

-- Applications
create table if not exists applications (
  id uuid primary key default gen_random_uuid(),
  job_id uuid references jobs(id) on delete cascade not null,
  candidate_id uuid references candidates(id) on delete set null,
  name text not null,
  email text not null,
  resume_url text,
  cover_note text,
  status text not null default 'new' check (status in ('new','reviewed','shortlisted','rejected')),
  created_at timestamptz not null default now()
);

-- Job Alerts
create table if not exists job_alerts (
  id uuid primary key default gen_random_uuid(),
  board_id uuid references boards(id) on delete cascade not null,
  email text not null,
  keywords text,
  categories text[],
  confirmed boolean not null default false,
  created_at timestamptz not null default now(),
  unique(board_id, email)
);

-- Board Apps
create table if not exists board_apps (
  id uuid primary key default gen_random_uuid(),
  board_id uuid references boards(id) on delete cascade not null,
  app_slug text not null,
  stripe_subscription_id text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique(board_id, app_slug)
);

-- RLS Policies
alter table boards enable row level security;
alter table jobs enable row level security;
alter table employers enable row level security;
alter table candidates enable row level security;
alter table applications enable row level security;
alter table job_alerts enable row level security;
alter table board_apps enable row level security;

-- Boards: owner full access, public read approved boards
create policy "boards_owner" on boards for all using (auth.uid() = owner_id);
create policy "boards_public_read" on boards for select using (approved = true);

-- Jobs: board owner full access, public read active jobs
create policy "jobs_board_owner" on jobs for all using (
  exists (select 1 from boards where boards.id = jobs.board_id and boards.owner_id = auth.uid())
);
create policy "jobs_public_read" on jobs for select using (status = 'active');

-- Employers: own record
create policy "employers_own" on employers for all using (auth.uid() = user_id);
create policy "employers_board_owner" on employers for select using (
  exists (select 1 from boards where boards.id = employers.board_id and boards.owner_id = auth.uid())
);

-- Candidates: own record
create policy "candidates_own" on candidates for all using (auth.uid() = user_id);

-- Applications: applicant or board owner
create policy "applications_own" on applications for insert with check (true);
create policy "applications_board_owner" on applications for select using (
  exists (
    select 1 from jobs j
    join boards b on b.id = j.board_id
    where j.id = applications.job_id and b.owner_id = auth.uid()
  )
);

-- Job alerts: insert open, manage own
create policy "alerts_insert" on job_alerts for insert with check (true);
create policy "alerts_own" on job_alerts for select using (true);

-- Board apps: owner only
create policy "board_apps_owner" on board_apps for all using (
  exists (select 1 from boards where boards.id = board_apps.board_id and boards.owner_id = auth.uid())
);

-- Indexes
create index if not exists jobs_board_id_status on jobs(board_id, status);
create index if not exists jobs_board_id_featured on jobs(board_id, featured);
create index if not exists jobs_created_at on jobs(created_at desc);
create index if not exists boards_slug on boards(slug);
create index if not exists boards_custom_domain on boards(custom_domain);
