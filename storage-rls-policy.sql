-- Create the bucket
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('project-images', 'project-images', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif'])
on conflict (id) do nothing;

-- Drop existing policies if any
drop policy if exists "Public Access" on storage.objects;
drop policy if exists "Authenticated Access" on storage.objects;

-- Allow public read access to the bucket
create policy "Public Access"
on storage.objects for select
to public
using ( bucket_id = 'project-images' );

-- Allow authenticated users to upload
create policy "Authenticated Upload"
on storage.objects for insert
to authenticated
with check ( bucket_id = 'project-images' );

-- Allow authenticated users to update
create policy "Authenticated Update"
on storage.objects for update
to authenticated
using ( bucket_id = 'project-images' );

-- Allow authenticated users to delete
create policy "Authenticated Delete"
on storage.objects for delete
to authenticated
using ( bucket_id = 'project-images' );

-- Allow public to list bucket
drop policy if exists "Public Bucket Access" on storage.buckets;
create policy "Public Bucket Access"
on storage.buckets for select
to public
using ( id = 'project-images' );
