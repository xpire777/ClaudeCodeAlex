-- CABN Phase 1 MVP Schema
-- Run this in Supabase SQL Editor

-- 1. Profiles table (extends auth.users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  display_name text,
  onboarding_completed boolean default false,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 2. Conversations table
create table if not exists public.conversations (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  persona_slug text not null,
  last_message_at timestamptz default now(),
  created_at timestamptz default now(),
  unique (user_id, persona_slug)
);

alter table public.conversations enable row level security;

create policy "Users can view own conversations"
  on public.conversations for select
  using (auth.uid() = user_id);

create policy "Users can create own conversations"
  on public.conversations for insert
  with check (auth.uid() = user_id);

create policy "Users can update own conversations"
  on public.conversations for update
  using (auth.uid() = user_id);

-- 3. Messages table
create table if not exists public.messages (
  id uuid default gen_random_uuid() primary key,
  conversation_id uuid references public.conversations on delete cascade not null,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz default now()
);

create index if not exists idx_messages_conversation_created
  on public.messages (conversation_id, created_at desc);

alter table public.messages enable row level security;

create policy "Users can view messages in own conversations"
  on public.messages for select
  using (
    exists (
      select 1 from public.conversations
      where conversations.id = messages.conversation_id
      and conversations.user_id = auth.uid()
    )
  );

create policy "Users can create messages in own conversations"
  on public.messages for insert
  with check (
    exists (
      select 1 from public.conversations
      where conversations.id = messages.conversation_id
      and conversations.user_id = auth.uid()
    )
  );

create policy "Users can delete messages in own conversations"
  on public.messages for delete
  using (
    exists (
      select 1 from public.conversations
      where conversations.id = messages.conversation_id
      and conversations.user_id = auth.uid()
    )
  );

create policy "Users can delete own conversations"
  on public.conversations for delete
  using (auth.uid() = user_id);

-- 4. Persona memories table (hierarchical fact storage)
create table if not exists public.persona_memories (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  persona_slug text not null,
  memories jsonb not null default '[]'::jsonb,
  updated_at timestamptz default now(),
  unique (user_id, persona_slug)
);

alter table public.persona_memories enable row level security;

create policy "Users can view own persona memories"
  on public.persona_memories for select
  using (auth.uid() = user_id);

create policy "Users can create own persona memories"
  on public.persona_memories for insert
  with check (auth.uid() = user_id);

create policy "Users can update own persona memories"
  on public.persona_memories for update
  using (auth.uid() = user_id);

create policy "Users can delete own persona memories"
  on public.persona_memories for delete
  using (auth.uid() = user_id);
