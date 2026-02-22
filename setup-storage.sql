-- Enable RLS on storage buckets (if not already enabled)
alter table storage.buckets enable row level security;

-- Drop existing policies
drop policy if exists "Public Bucket Access" on storage.buckets;
drop policy if exists "Authenticated Bucket Access" on storage.buckets;

-- Create the bucket if it doesn't exist
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('project-images', 'project-images', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif', 'video/mp4', 'video/mpeg'])
on conflict (id) do nothing;

-- Allow public read access to bucket metadata
create policy "Public Bucket Access"
on storage.buckets for select
to public
using ( id = 'project-images' );

-- Enable RLS on storage.objects
alter table storage.objects enable row level security;

-- Drop existing object policies
drop policy if exists "Public Access" on storage.objects;
drop policy if exists "Authenticated Upload" on storage.objects;
drop policy if exists "Authenticated Update" on storage.objects;
drop policy if exists "Authenticated Delete" on storage.objects;

-- Allow public read access to objects in project-images bucket
create policy "Public Access"
on storage.objects for select
to public
using ( bucket_id = 'project-images' );

-- Allow anon and authenticated users to upload to project-images bucket
create policy "Public Upload"
on storage.objects for insert
to anon, authenticated
with check ( bucket_id = 'project-images' );

-- Allow anon and authenticated users to update objects in project-images bucket
create policy "Public Update"
on storage.objects for update
to anon, authenticated
using ( bucket_id = 'project-images' );

-- Allow anon and authenticated users to delete objects in project-images bucket
create policy "Public Delete"
on storage.objects for delete
to anon, authenticated
using ( bucket_id = 'project-images' );
