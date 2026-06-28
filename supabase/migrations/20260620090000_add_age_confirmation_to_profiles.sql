alter table public.profiles
  add column if not exists age_confirmed boolean not null default false;

notify pgrst, 'reload schema';
