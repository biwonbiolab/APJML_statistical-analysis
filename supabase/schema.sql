-- ═══════════════════════════════════════════════════════════════════════
-- APJML Main Survey v8 — Supabase / Postgres schema
-- Run this once in Supabase → SQL Editor → New query → Run.
-- ═══════════════════════════════════════════════════════════════════════

-- ── Tables ──────────────────────────────────────────────────────────────

-- Session (one row per participant)
create table if not exists sessions (
  id uuid primary key default gen_random_uuid(),
  condition text not null,            -- 'C1'..'C6'
  personalization text not null,      -- 'low' | 'high'
  explanation text not null,          -- 'none' | 'rationale' | 'data_control'
  block_order int not null,           -- 1..4 (core-block order set)
  item_orders jsonb not null,         -- per-construct item presentation order
  wtp_b_order jsonb not null,         -- WTP_B1..B4 screen presentation order
  created_at timestamptz default now(),
  completed_at timestamptz,
  status text default 'started',      -- started | screened_out | completed
  screen_out_reason text,             -- consent_no | age | residence | online | honest
  user_agent text,
  -- exposure integrity
  exposure_start timestamptz,
  next_enabled_at timestamptz,
  next_clicked_at timestamptz
);

-- Item responses (long format)
create table if not exists responses (
  id bigserial primary key,
  session_id uuid references sessions(id),
  question_code text not null,        -- e.g. 'TRN1','WTP_OE','GENDER'
  value text,                         -- raw string (number / option / comma-joined multi)
  page_key text,                      -- page identifier at save time
  answered_at timestamptz default now(),
  -- one answer per (participant, question); re-saving updates in place
  unique (session_id, question_code)
);

-- Balanced-assignment counter (atomic increment)
create table if not exists assignment_counter (
  condition text primary key,
  n int default 0
);

insert into assignment_counter (condition, n) values
  ('C1',0),('C2',0),('C3',0),('C4',0),('C5',0),('C6',0)
on conflict (condition) do nothing;

create index if not exists responses_session_idx on responses (session_id);
create index if not exists sessions_condition_idx on sessions (condition);
create index if not exists sessions_status_idx on sessions (status);

-- ── Balanced condition assignment ───────────────────────────────────────
-- Serialized with a transaction-scoped advisory lock so concurrent sign-ups
-- always fill the least-populated cell (random tie-break).
create or replace function assign_condition()
returns text
language plpgsql
as $$
declare
  chosen text;
begin
  perform pg_advisory_xact_lock(hashtext('apjml_assignment_counter'));

  select condition into chosen
  from assignment_counter
  order by n asc, random()
  limit 1;

  update assignment_counter set n = n + 1 where condition = chosen;
  return chosen;
end;
$$;

-- ── Stimulus exposure timing (server-authoritative) ─────────────────────
-- Sets exposure_start / next_enabled_at once; idempotent on refresh so the
-- 25s hold is never reset and the participant is never re-exposed.
create or replace function stimulus_start(p_sid uuid, p_hold int)
returns table(exposure_start timestamptz, next_enabled_at timestamptz)
language plpgsql
as $$
begin
  update sessions s
    set exposure_start = coalesce(s.exposure_start, now()),
        next_enabled_at = coalesce(
          s.next_enabled_at, now() + make_interval(secs => p_hold)
        )
  where s.id = p_sid;

  return query
    select s.exposure_start, s.next_enabled_at
    from sessions s
    where s.id = p_sid;
end;
$$;

-- Records the "다음" click only if the 25s hold has elapsed; idempotent.
-- Returns true when the click is (or was already) validly recorded.
create or replace function stimulus_click(p_sid uuid)
returns boolean
language plpgsql
as $$
declare
  ok boolean := false;
begin
  update sessions s
    set next_clicked_at = now()
  where s.id = p_sid
    and s.next_clicked_at is null
    and s.next_enabled_at is not null
    and now() >= s.next_enabled_at;

  if found then
    ok := true;
  else
    select (s.next_clicked_at is not null) into ok
    from sessions s where s.id = p_sid;
  end if;

  return ok;
end;
$$;

-- ── Row Level Security ──────────────────────────────────────────────────
-- The app talks to Postgres exclusively from server API routes using the
-- SERVICE ROLE key (which bypasses RLS). The anon/public key is never used
-- against these tables, so we keep RLS enabled with NO public policies:
-- this denies all anon/public access while the service role continues to work.
alter table sessions enable row level security;
alter table responses enable row level security;
alter table assignment_counter enable row level security;
