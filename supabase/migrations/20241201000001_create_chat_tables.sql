-- Create chat_sessions table for AI chat functionality
create table if not exists public.chat_sessions (
  id uuid default gen_random_uuid() primary key,
  email text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create chat_messages table for storing conversation history
create table if not exists public.chat_messages (
  id uuid default gen_random_uuid() primary key,
  session_id uuid references public.chat_sessions(id) on delete cascade not null,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create indexes for better performance
create index if not exists chat_sessions_email_idx on public.chat_sessions(email);
create index if not exists chat_messages_session_id_idx on public.chat_messages(session_id);
create index if not exists chat_messages_created_at_idx on public.chat_messages(created_at);

-- Enable RLS (Row Level Security)
alter table public.chat_sessions enable row level security;
alter table public.chat_messages enable row level security;

-- Create policies for chat_sessions
create policy "Enable read access for all users" on public.chat_sessions
  for select using (true);

create policy "Enable insert for all users" on public.chat_sessions
  for insert with check (true);

create policy "Enable update for all users" on public.chat_sessions
  for update using (true);

-- Create policies for chat_messages
create policy "Enable read access for all users" on public.chat_messages
  for select using (true);

create policy "Enable insert for all users" on public.chat_messages
  for insert with check (true);

create policy "Enable update for all users" on public.chat_messages
  for update using (true);