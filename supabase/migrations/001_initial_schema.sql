-- ============================================================
-- Agentic Finance
-- Esquema inicial 
-- ============================================================

create table if not exists public.app_users (
  id uuid primary key,
  display_name text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),

  user_id uuid not null
    references public.app_users(id)
    on delete cascade,

  transaction_type text not null
    check (transaction_type in ('expense', 'income')),

  amount numeric(12, 2) not null
    check (amount > 0),

  currency text not null default 'USD'
    check (currency = 'USD'),

  transaction_date date not null,

  category text not null,

  merchant text,

  notes text,

  source text not null default 'chat'
    check (source in ('chat', 'csv', 'manual', 'receipt')),

  created_at timestamptz not null default now()
);

create table if not exists public.budgets (
  id uuid primary key default gen_random_uuid(),

  user_id uuid not null
    references public.app_users(id)
    on delete cascade,

  category text not null,

  monthly_limit numeric(12, 2) not null
    check (monthly_limit > 0),

  threshold_percent integer not null default 80
    check (
      threshold_percent >= 1
      and threshold_percent <= 100
    ),

  month date not null,

  created_at timestamptz not null default now(),

  updated_at timestamptz not null default now(),

  unique (user_id, category, month)
);

create table if not exists public.support_tickets (
  id uuid primary key default gen_random_uuid(),

  user_id uuid not null
    references public.app_users(id)
    on delete cascade,

  code text not null unique,

  summary text not null,

  category text not null default 'general',

  priority text not null
    check (priority in ('low', 'medium', 'high', 'urgent')),

  status text not null default 'open'
    check (
      status in ('open', 'in_progress', 'resolved', 'closed')
    ),

  reason_for_escalation text not null,

  conversation_context jsonb not null default '[]'::jsonb,

  created_at timestamptz not null default now(),

  updated_at timestamptz not null default now()
);

-- Índices para consultas frecuentes.

create index if not exists transactions_user_date_idx
  on public.transactions(user_id, transaction_date desc);

create index if not exists transactions_user_category_idx
  on public.transactions(user_id, category);

create index if not exists budgets_user_month_idx
  on public.budgets(user_id, month);

create index if not exists support_tickets_user_created_idx
  on public.support_tickets(user_id, created_at desc);

-- Activamos Row Level Security.

alter table public.app_users
  enable row level security;

alter table public.transactions
  enable row level security;

alter table public.budgets
  enable row level security;

alter table public.support_tickets
  enable row level security;

-- Usuario ficticio para la demostración.

insert into public.app_users (
  id,
  display_name
)
values (
  '00000000-0000-0000-0000-000000000001',
  'Usuario Demo'
)
on conflict (id) do nothing;