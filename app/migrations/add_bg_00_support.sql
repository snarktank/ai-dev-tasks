-- Migration: Add support for bg_00 (exclusive/admin-only background)
-- This allows bg_00 to be set manually in the database, but it won't appear in the app's UI picker
-- Run this in your Supabase SQL editor

-- Drop ALL possible constraint names (different versions might use different names)
alter table public.profiles
  drop constraint if exists profiles_background_key_check;

alter table public.profiles
  drop constraint if exists profiles_background_key_allowed;

-- Add a new constraint that includes bg_00
alter table public.profiles
  add constraint profiles_background_key_check
  check (background_key in ('bg_00','bg_01','bg_02','bg_03','bg_04','bg_05','bg_06','bg_07','bg_08'));

-- Note: bg_00 can now be set manually in the database,
-- but it won't appear as an option in the app's profile settings UI.
