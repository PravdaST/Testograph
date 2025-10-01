-- Add PDF storage columns to chat_sessions table
alter table public.chat_sessions
add column if not exists pdf_url text,
add column if not exists pdf_filename text;

-- Create storage bucket for PDF documents
insert into storage.buckets (id, name, public)
values ('pdf-documents', 'pdf-documents', true)
on conflict (id) do nothing;

-- Create storage policy for PDF documents
create policy "Allow public uploads to pdf-documents bucket" on storage.objects
for insert with check (bucket_id = 'pdf-documents');

create policy "Allow public read access to pdf-documents bucket" on storage.objects
for select using (bucket_id = 'pdf-documents');

create policy "Allow public delete access to pdf-documents bucket" on storage.objects
for delete using (bucket_id = 'pdf-documents');