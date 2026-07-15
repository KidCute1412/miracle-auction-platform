create extension if not exists pgcrypto;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'agent_run_status') then
    create type agent_run_status as enum (
      'queued',
      'context_indexing',
      'planning',
      'implementing',
      'testing',
      'reviewing',
      'waiting_approval',
      'succeeded',
      'failed',
      'cancelled',
      'timed_out'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'agent_step_status') then
    create type agent_step_status as enum ('queued', 'running', 'succeeded', 'failed', 'cancelled', 'timed_out');
  end if;

  if not exists (select 1 from pg_type where typname = 'agent_step_name') then
    create type agent_step_name as enum (
      'context_indexing',
      'planning',
      'implementing',
      'testing',
      'reviewing',
      'waiting_approval'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'agent_artifact_type') then
    create type agent_artifact_type as enum (
      'context_pack',
      'plan',
      'patch',
      'test_report',
      'review_report',
      'handoff_summary',
      'command_stdout',
      'command_stderr'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'agent_approval_decision') then
    create type agent_approval_decision as enum ('approved', 'rejected');
  end if;
end $$;

create table if not exists agent_runs (
  id uuid primary key default gen_random_uuid(),
  task text not null check (length(trim(task)) >= 10),
  status agent_run_status not null default 'queued',
  current_step agent_step_name,
  provider_mapping jsonb not null,
  token_budgets jsonb not null,
  error_code text,
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table agent_runs add column if not exists project_config jsonb;
alter table agent_runs add column if not exists workflow_state text;
alter table agent_runs add column if not exists iteration integer not null default 0 check (iteration >= 0);
alter table agent_runs add column if not exists workspace_path text;
alter table agent_runs add column if not exists active_pid integer;

create table if not exists agent_steps (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null references agent_runs(id) on delete cascade,
  step_name agent_step_name not null,
  status agent_step_status not null default 'queued',
  attempts integer not null default 0 check (attempts >= 0),
  error_code text,
  error_message text,
  started_at timestamptz,
  finished_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists agent_artifacts (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null references agent_runs(id) on delete cascade,
  step_id uuid references agent_steps(id) on delete set null,
  artifact_type agent_artifact_type not null,
  name text not null,
  content text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists agent_command_audits (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null references agent_runs(id) on delete cascade,
  step_id uuid references agent_steps(id) on delete set null,
  executable text not null,
  args text[] not null,
  cwd text not null,
  exit_code integer,
  duration_ms integer not null check (duration_ms >= 0),
  stdout_artifact_id uuid references agent_artifacts(id) on delete set null,
  stderr_artifact_id uuid references agent_artifacts(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists agent_approvals (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null references agent_runs(id) on delete cascade,
  decision agent_approval_decision not null,
  reviewer text not null,
  note text,
  created_at timestamptz not null default now()
);

create table if not exists agent_messages (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null references agent_runs(id) on delete cascade,
  iteration integer not null check (iteration >= 0),
  from_agent text not null,
  to_agent text,
  message_type text not null,
  content text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create sequence if not exists agent_events_sequence;

create table if not exists agent_events (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null references agent_runs(id) on delete cascade,
  sequence bigint not null default nextval('agent_events_sequence'),
  event_type text not null,
  channel text not null,
  agent_id text,
  step_id uuid references agent_steps(id) on delete set null,
  content text not null default '',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (run_id, sequence)
);

create index if not exists idx_agent_runs_status_created_at on agent_runs(status, created_at);
create index if not exists idx_agent_steps_run_id_created_at on agent_steps(run_id, created_at);
create index if not exists idx_agent_artifacts_run_id_created_at on agent_artifacts(run_id, created_at);
create index if not exists idx_agent_command_audits_run_id_created_at on agent_command_audits(run_id, created_at);
create index if not exists idx_agent_messages_run_id_created_at on agent_messages(run_id, created_at);
create index if not exists idx_agent_events_run_id_sequence on agent_events(run_id, sequence);
