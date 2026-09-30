create extension if not exists pgcrypto;

create table public.gyms (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 120),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  timezone text not null default 'Asia/Kolkata',
  currency text not null default 'INR' check (char_length(currency) = 3),
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.gym_users (
  id uuid primary key default gen_random_uuid(),
  gym_id uuid not null references public.gyms(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'owner' check (role in ('owner','staff')),
  created_at timestamptz not null default now(),
  unique (gym_id, user_id)
);

create table public.members (
  id uuid primary key default gen_random_uuid(),
  gym_id uuid not null references public.gyms(id) on delete cascade,
  full_name text not null check (char_length(full_name) between 1 and 160),
  phone text not null,
  email text,
  status text not null default 'active' check (status in ('active','inactive','archived')),
  joined_at date not null default current_date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, gym_id)
);

create table public.membership_plans (
  id uuid primary key default gen_random_uuid(),
  gym_id uuid not null references public.gyms(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 120),
  duration_days integer not null check (duration_days > 0 and duration_days <= 3650),
  price numeric(12,2) not null check (price >= 0),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, gym_id)
);

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  gym_id uuid not null references public.gyms(id) on delete cascade,
  member_id uuid not null references public.members(id) on delete cascade,
  plan_id uuid not null references public.membership_plans(id) on delete restrict,
  start_date date not null,
  end_date date not null check (end_date >= start_date),
  status text not null default 'active'
    check (status in ('active','expired','cancelled','renewed')),
  price_snapshot numeric(12,2) not null check (price_snapshot >= 0),
  created_at timestamptz not null default now(),
  unique (id, gym_id),
  constraint subscriptions_member_same_gym_fkey
    foreign key (member_id, gym_id)
    references public.members(id, gym_id)
    on delete cascade,
  constraint subscriptions_plan_same_gym_fkey
    foreign key (plan_id, gym_id)
    references public.membership_plans(id, gym_id)
    on delete restrict
);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  gym_id uuid not null references public.gyms(id) on delete cascade,
  member_id uuid not null references public.members(id) on delete cascade,
  subscription_id uuid references public.subscriptions(id) on delete set null,
  amount numeric(12,2) not null check (amount >= 0),
  method text not null check (method in ('cash','upi','card','bank_transfer','other')),
  paid_at timestamptz not null default now(),
  reference text,
  notes text,
  created_at timestamptz not null default now(),
  constraint payments_member_same_gym_fkey
    foreign key (member_id, gym_id)
    references public.members(id, gym_id)
    on delete cascade,
  constraint payments_subscription_same_gym_fkey
    foreign key (subscription_id, gym_id)
    references public.subscriptions(id, gym_id)
    on delete set null
);

create table public.reminders (
  id uuid primary key default gen_random_uuid(),
  gym_id uuid not null references public.gyms(id) on delete cascade,
  member_id uuid not null references public.members(id) on delete cascade,
  subscription_id uuid not null references public.subscriptions(id) on delete cascade,
  channel text not null default 'manual'
    check (channel in ('manual','email','whatsapp','sms')),
  scheduled_for timestamptz not null,
  sent_at timestamptz,
  status text not null default 'pending'
    check (status in ('pending','sent','failed','cancelled')),
  created_at timestamptz not null default now(),
  constraint reminders_member_same_gym_fkey
    foreign key (member_id, gym_id)
    references public.members(id, gym_id)
    on delete cascade,
  constraint reminders_subscription_same_gym_fkey
    foreign key (subscription_id, gym_id)
    references public.subscriptions(id, gym_id)
    on delete cascade
);

create index gym_users_user_id_idx on public.gym_users(user_id);
create index members_gym_id_idx on public.members(gym_id);
create index members_gym_status_idx on public.members(gym_id, status);
create index plans_gym_id_idx on public.membership_plans(gym_id);
create index subscriptions_gym_end_date_idx on public.subscriptions(gym_id, end_date);
create index subscriptions_member_id_idx on public.subscriptions(member_id);
create index subscriptions_plan_id_idx on public.subscriptions(plan_id);
create index subscriptions_member_gym_idx on public.subscriptions(member_id, gym_id);
create index subscriptions_plan_gym_idx on public.subscriptions(plan_id, gym_id);
create index payments_gym_paid_at_idx on public.payments(gym_id, paid_at desc);
create index payments_member_id_idx on public.payments(member_id);
create index payments_subscription_id_idx on public.payments(subscription_id);
create index payments_member_gym_idx on public.payments(member_id, gym_id);
create index payments_subscription_gym_idx on public.payments(subscription_id, gym_id);
create index reminders_gym_scheduled_idx on public.reminders(gym_id, scheduled_for);
create index reminders_member_id_idx on public.reminders(member_id);
create index reminders_subscription_id_idx on public.reminders(subscription_id);
create index reminders_member_gym_idx on public.reminders(member_id, gym_id);
create index reminders_subscription_gym_idx on public.reminders(subscription_id, gym_id);
create index gyms_created_by_idx on public.gyms(created_by);

alter table public.gyms enable row level security;
alter table public.gym_users enable row level security;
alter table public.members enable row level security;
alter table public.membership_plans enable row level security;
alter table public.subscriptions enable row level security;
alter table public.payments enable row level security;
alter table public.reminders enable row level security;

grant select, insert, update, delete on public.gyms to authenticated;
grant select, insert, update, delete on public.gym_users to authenticated;
grant select, insert, update, delete on public.members to authenticated;
grant select, insert, update, delete on public.membership_plans to authenticated;
grant select, insert, update, delete on public.subscriptions to authenticated;
grant select, insert, update, delete on public.payments to authenticated;
grant select, insert, update, delete on public.reminders to authenticated;

create policy "users can create gyms"
on public.gyms for insert to authenticated
with check ((select auth.uid()) = created_by);

create policy "gym members can view gym"
on public.gyms for select to authenticated
using (
  created_by = (select auth.uid())
  or exists (
    select 1 from public.gym_users gu
    where gu.gym_id = gyms.id
      and gu.user_id = (select auth.uid())
  )
);

create policy "gym owners can update gym"
on public.gyms for update to authenticated
using (
  exists (
    select 1 from public.gym_users gu
    where gu.gym_id = gyms.id
      and gu.user_id = (select auth.uid())
      and gu.role = 'owner'
  )
)
with check (
  exists (
    select 1 from public.gym_users gu
    where gu.gym_id = gyms.id
      and gu.user_id = (select auth.uid())
      and gu.role = 'owner'
  )
);

create policy "users can view own gym memberships"
on public.gym_users for select to authenticated
using (user_id = (select auth.uid()));

create policy "gym creators can add themselves as owner"
on public.gym_users for insert to authenticated
with check (
  user_id = (select auth.uid())
  and role = 'owner'
  and exists (
    select 1 from public.gyms g
    where g.id = gym_users.gym_id
      and g.created_by = (select auth.uid())
  )
);

create policy "gym members can view members"
on public.members for select to authenticated
using (
  exists (
    select 1 from public.gym_users gu
    where gu.gym_id = members.gym_id
      and gu.user_id = (select auth.uid())
  )
);

create policy "gym members can create members"
on public.members for insert to authenticated
with check (
  exists (
    select 1 from public.gym_users gu
    where gu.gym_id = members.gym_id
      and gu.user_id = (select auth.uid())
  )
);

create policy "gym members can update members"
on public.members for update to authenticated
using (
  exists (
    select 1 from public.gym_users gu
    where gu.gym_id = members.gym_id
      and gu.user_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1 from public.gym_users gu
    where gu.gym_id = members.gym_id
      and gu.user_id = (select auth.uid())
  )
);

create policy "gym owners can delete members"
on public.members for delete to authenticated
using (
  exists (
    select 1 from public.gym_users gu
    where gu.gym_id = members.gym_id
      and gu.user_id = (select auth.uid())
      and gu.role = 'owner'
  )
);

create policy "gym members can view plans"
on public.membership_plans for select to authenticated
using (
  exists (
    select 1 from public.gym_users gu
    where gu.gym_id = membership_plans.gym_id
      and gu.user_id = (select auth.uid())
  )
);

create policy "gym owners can insert plans"
on public.membership_plans for insert to authenticated
with check (
  exists (
    select 1 from public.gym_users gu
    where gu.gym_id = membership_plans.gym_id
      and gu.user_id = (select auth.uid())
      and gu.role = 'owner'
  )
);

create policy "gym owners can update plans"
on public.membership_plans for update to authenticated
using (
  exists (
    select 1 from public.gym_users gu
    where gu.gym_id = membership_plans.gym_id
      and gu.user_id = (select auth.uid())
      and gu.role = 'owner'
  )
)
with check (
  exists (
    select 1 from public.gym_users gu
    where gu.gym_id = membership_plans.gym_id
      and gu.user_id = (select auth.uid())
      and gu.role = 'owner'
  )
);

create policy "gym owners can delete plans"
on public.membership_plans for delete to authenticated
using (
  exists (
    select 1 from public.gym_users gu
    where gu.gym_id = membership_plans.gym_id
      and gu.user_id = (select auth.uid())
      and gu.role = 'owner'
  )
);

create policy "gym members can manage subscriptions"
on public.subscriptions for all to authenticated
using (
  exists (
    select 1 from public.gym_users gu
    where gu.gym_id = subscriptions.gym_id
      and gu.user_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1 from public.gym_users gu
    where gu.gym_id = subscriptions.gym_id
      and gu.user_id = (select auth.uid())
  )
);

create policy "gym members can manage payments"
on public.payments for all to authenticated
using (
  exists (
    select 1 from public.gym_users gu
    where gu.gym_id = payments.gym_id
      and gu.user_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1 from public.gym_users gu
    where gu.gym_id = payments.gym_id
      and gu.user_id = (select auth.uid())
  )
);

create policy "gym members can manage reminders"
on public.reminders for all to authenticated
using (
  exists (
    select 1 from public.gym_users gu
    where gu.gym_id = reminders.gym_id
      and gu.user_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1 from public.gym_users gu
    where gu.gym_id = reminders.gym_id
      and gu.user_id = (select auth.uid())
  )
);
