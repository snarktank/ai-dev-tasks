-- Migration: Allow all authenticated users to view all profiles
-- This enables features like leaderboards, search, and viewing any user's profile
-- Run this in your Supabase SQL editor

-- Drop the policy if it already exists (to avoid conflicts)
drop policy if exists "profiles-select-all-authenticated" on public.profiles;

-- Add a policy that allows all authenticated users to read all profiles
-- This is in addition to the existing policies for own profile and friends
create policy "profiles-select-all-authenticated" on public.profiles
  for select using (
    -- Any authenticated user can read any profile
    auth.role() = 'authenticated'
  );

-- Note: This policy allows public viewing of profiles.
-- If you want more privacy, you can modify this policy to only show
-- limited information (like username and name) to non-friends.
