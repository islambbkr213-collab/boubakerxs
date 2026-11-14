-- Run once: Supabase dashboard -> SQL Editor -> New query -> paste -> Run.
-- Safe to run again. It only ADDS columns; nothing existing is changed or deleted.

alter table public.projects
  add column if not exists thumb_sm   text,                    -- 480px WebP (phones, small cards)
  add column if not exists thumb_lg   text,                    -- 1600px WebP (full-screen preview)
  add column if not exists thumb_blur text,                    -- tiny blurred preview that shows instantly
  add column if not exists video_url  text,                    -- an MP4 you uploaded yourself
  add column if not exists link_url   text,                    -- e.g. a Behance project page
  add column if not exists sort_order integer not null default 0;  -- drag order from the admin

notify pgrst, 'reload schema';

-- OPTIONAL, run as a second query: stops two people booking the same time.
-- If it errors, you have duplicate bookings for one time slot: delete one in the
-- admin (Bookings tab) and run this again.
-- create unique index if not exists bookings_one_per_slot on public.bookings (starts_at);
