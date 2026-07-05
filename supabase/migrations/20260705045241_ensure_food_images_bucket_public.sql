insert into storage.buckets (
  id,
  name,
  public,
  allowed_mime_types
)
values (
  'food-images',
  'food-images',
  true,
  array['image/webp']
)
on conflict (id) do update
set name = excluded.name,
    public = excluded.public,
    allowed_mime_types = excluded.allowed_mime_types;
