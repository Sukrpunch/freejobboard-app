-- Alert Campaigns Table
create table if not exists campaigns (
  id uuid primary key default gen_random_uuid(),
  board_id uuid references boards(id) on delete cascade not null,
  subject text not null,
  job_count int default 0,
  recipient_count int default 0,
  sent_at timestamptz not null default now()
);

create index if not exists campaigns_board_id on campaigns(board_id);

alter table campaigns enable row level security;

create policy "campaigns_owner" on campaigns for all using (
  exists (select 1 from boards b where b.id = campaigns.board_id and b.owner_id = auth.uid())
);
