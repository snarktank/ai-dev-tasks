export const MISSION_IMAGES = {
  ms_bike: require('@/assets/images/missions/ms_bike.jpeg'),
  ms_recycle: require('@/assets/images/missions/ms_recycle.jpeg'),
  ms_transit: require('@/assets/images/missions/ms_transit.jpeg'),
  ms_vegetarian: require('@/assets/images/missions/ms_vegetarian.jpeg'),
  ms_standard: require('@/assets/images/missions/ms_standard.jpeg'),
} as const;

export type MissionImageKey = keyof typeof MISSION_IMAGES;

export const DEFAULT_MISSION_IMAGE: MissionImageKey = 'ms_standard';

export function safeMissionImageKey(key: string | null | undefined): MissionImageKey {
  if (!key) return DEFAULT_MISSION_IMAGE;
  return (key in MISSION_IMAGES ? key : DEFAULT_MISSION_IMAGE) as MissionImageKey;
}


