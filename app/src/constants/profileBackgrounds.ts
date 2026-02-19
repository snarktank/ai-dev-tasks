export const DEFAULT_PROFILE_BG = 'bg_02' as const;

// Alla tillgängliga bakgrunder (inklusive exklusiva som bg_00)
export const PROFILE_BACKGROUNDS_PORTRAIT = {
  bg_00: require('../../assets/images/profile-backgrounds/portrait/bg_00.jpeg'), // Exklusiv bakgrund
  bg_01: require('../../assets/images/profile-backgrounds/portrait/bg_01.jpeg'),
  bg_02: require('../../assets/images/profile-backgrounds/portrait/bg_02.jpeg'),
  bg_03: require('../../assets/images/profile-backgrounds/portrait/bg_03.jpeg'),
  bg_04: require('../../assets/images/profile-backgrounds/portrait/bg_04.jpeg'),
  bg_05: require('../../assets/images/profile-backgrounds/portrait/bg_05.jpeg'),
  bg_06: require('../../assets/images/profile-backgrounds/portrait/bg_06.jpeg'),
  bg_07: require('../../assets/images/profile-backgrounds/portrait/bg_07.jpeg'),
} as const;

export const PROFILE_BACKGROUNDS_THUMBS = {
  bg_00: require('../../assets/images/profile-backgrounds/thumbs/bg_01.png'), // Använder bg_01 som placeholder tills bg_00.png finns
  bg_01: require('../../assets/images/profile-backgrounds/thumbs/bg_01.png'),
  bg_02: require('../../assets/images/profile-backgrounds/thumbs/bg_02.png'),
  bg_03: require('../../assets/images/profile-backgrounds/thumbs/bg_03.png'),
  bg_04: require('../../assets/images/profile-backgrounds/thumbs/bg_04.png'),
  bg_05: require('../../assets/images/profile-backgrounds/thumbs/bg_05.png'),
  bg_06: require('../../assets/images/profile-backgrounds/thumbs/bg_06.png'),
  bg_07: require('../../assets/images/profile-backgrounds/thumbs/bg_07.png'),
} as const;

// Bakgrunder som visas i profil-pickern (EXKLUDERAR bg_00)
// bg_00 är en exklusiv bakgrund som bara kan sättas manuellt i databasen
export const SELECTABLE_BACKGROUNDS = [
  'bg_01',
  'bg_02',
  'bg_03',
  'bg_04',
  'bg_05',
  'bg_06',
  'bg_07',
] as const;

export type ProfileBackgroundKey = keyof typeof PROFILE_BACKGROUNDS_PORTRAIT;
export type SelectableBackgroundKey = typeof SELECTABLE_BACKGROUNDS[number];

export function safeBackgroundKey(key: string | null | undefined): ProfileBackgroundKey {
  if (!key) return DEFAULT_PROFILE_BG;
  return (key in PROFILE_BACKGROUNDS_PORTRAIT ? key : DEFAULT_PROFILE_BG) as ProfileBackgroundKey;
}


