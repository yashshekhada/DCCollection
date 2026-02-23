-- Create a table for categories
create table categories (
  id bigint primary key generated always as identity,
  name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create a table for products
create table products (
  id bigint primary key generated always as identity,
  name text not null,
  description text,
  price numeric not null,
  image_url text,
  category text,
  stock integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Turn on Row Level Security
alter table products enable row level security;
alter table categories enable row level security;

-- Allow read access to everyone
create policy "Public products are viewable by everyone." on products for select using (true);
create policy "Public categories are viewable by everyone." on categories for select using (true);

-- Allow write access only to authenticated users (Admins)
create policy "Users can insert their own products." on products for insert with check (auth.role() = 'authenticated');
create policy "Users can update their own products." on products for update using (auth.role() = 'authenticated');
create policy "Users can delete their own products." on products for delete using (auth.role() = 'authenticated');

create policy "Users can insert categories." on categories for insert with check (auth.role() = 'authenticated');
create policy "Users can update categories." on categories for update using (auth.role() = 'authenticated');
create policy "Users can delete categories." on categories for delete using (auth.role() = 'authenticated');

-- Create a storage bucket for product images
insert into storage.buckets (id, name, public) values ('products', 'products', true);

-- Allow public access to product images
create policy "Public Access" on storage.objects for select using ( bucket_id = 'products' );

-- Allow authenticated users to upload images
create policy "Authenticated users can upload images" on storage.objects for insert with check ( bucket_id = 'products' and auth.role() = 'authenticated' );
