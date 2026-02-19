-- Add left_at column to competition_participants table
-- This allows users to leave competitions while maintaining history

alter table if exists public.competition_participants
  add column if not exists left_at timestamptz;

-- Create index for efficient filtering of active participants
create index if not exists idx_competition_participants_left_at
  on public.competition_participants (competition_id, left_at)
  where left_at is null;

-- Add policy to allow users to update their own left_at field
-- This enables users to leave competitions themselves
drop policy if exists "update-self-leave" on public.competition_participants;
create policy "update-self-leave" on public.competition_participants
for update using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Update existing RLS policies to only show active participants in some contexts
-- The read policy remains unchanged so we can still see full history if needed
