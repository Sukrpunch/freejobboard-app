-- Resume Database Feature
-- Candidates upload resumes, employers search/download

create table if not exists resumes (
  id uuid primary key default gen_random_uuid(),
  board_id uuid references boards(id) on delete cascade not null,
  candidate_id uuid references candidates(id) on delete cascade,
  candidate_name text not null,
  candidate_email text not null,
  file_name text not null,
  file_path text not null,
  file_size int,
  mime_type text,
  parsed_text text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists resume_downloads (
  id uuid primary key default gen_random_uuid(),
  resume_id uuid references resumes(id) on delete cascade not null,
  board_id uuid references boards(id) on delete cascade not null,
  downloaded_by_email text,
  downloaded_at timestamptz not null default now()
);

-- Indexes for search
create index if not exists resumes_board_id on resumes(board_id);
create index if not exists resumes_candidate_email on resumes(candidate_email);
create index if not exists resumes_parsed_text on resumes using gin(to_tsvector('english', parsed_text));
create index if not exists resume_downloads_resume_id on resume_downloads(resume_id);

-- RLS: Candidates can upload/manage their own; Employers can view/download if they have Resume Database app
alter table resumes enable row level security;
alter table resume_downloads enable row level security;

-- Candidates can insert their own resumes
create policy "resumes_insert" on resumes for insert with check (true);

-- Candidates can view/update their own resumes
create policy "resumes_own" on resumes for select using (candidate_email = current_user_email());
create policy "resumes_update_own" on resumes for update using (candidate_email = current_user_email());

-- Employers (board owners) can view resumes from their board if they have Resume Database app installed
create policy "resumes_employer_view" on resumes for select using (
  exists (
    select 1 from boards b
    join board_apps ba on ba.board_id = b.id
    where b.id = resumes.board_id
    and b.owner_id = auth.uid()
    and ba.app_slug = 'resume-database'
    and ba.active = true
  )
);

-- Log downloads
create policy "resume_downloads_insert" on resume_downloads for insert with check (true);

-- View download history (employers only)
create policy "resume_downloads_view" on resume_downloads for select using (
  exists (
    select 1 from boards b
    where b.id = resume_downloads.board_id
    and b.owner_id = auth.uid()
  )
);
