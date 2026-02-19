import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import { Image } from 'expo-image';
import {
  PROFILE_BACKGROUNDS_THUMBS,
  SELECTABLE_BACKGROUNDS,
  type ProfileBackgroundKey,
} from '@/src/constants/profileBackgrounds';

type Props = {
  initialKey: ProfileBackgroundKey;
  onChange?: (key: ProfileBackgroundKey) => void;
};

export default function BackgroundPickerCarousel({ initialKey, onChange }: Props) {
  const [selected, setSelected] = useState<ProfileBackgroundKey>(initialKey);
  useEffect(() => {
    setSelected(initialKey);
  }, [initialKey]);
  const { width } = useWindowDimensions();
  const horizontalPadding = 16;
  const gap = 12;
  const visible = 3;
  const itemSize = useMemo(() => {
    const totalGaps = gap * (visible - 1);
    const totalPadding = horizontalPadding * 2;
    return Math.floor((width - totalPadding - totalGaps) / visible);
  }, [width]);

  // Använd bara valbara bakgrunder (exkluderar exklusiva som bg_00)
  const data = useMemo<ProfileBackgroundKey[]>(
    () => [...SELECTABLE_BACKGROUNDS] as ProfileBackgroundKey[],
    []
  );

  const handlePress = useCallback(
    async (key: ProfileBackgroundKey) => {
      if (key === selected) return;
      setSelected(key);
      onChange?.(key);
    },
    [selected, onChange]
  );

  return (
    <FlatList
      data={data}
      keyExtractor={(k) => k}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: horizontalPadding }}
      ItemSeparatorComponent={() => <View style={{ width: gap }} />}
      renderItem={({ item }) => {
        const isSelected = item === selected;
        return (
          <Pressable onPress={() => handlePress(item)}>
            <View
              style={[
                styles.thumbWrapper,
                {
                  width: itemSize,
                  height: itemSize,
                },
              ]}
            >
              <Image
                source={PROFILE_BACKGROUNDS_THUMBS[item]}
                style={styles.thumb}
                contentFit="cover"
              />
              {isSelected ? <View style={styles.selectionRing} /> : null}
            </View>
          </Pressable>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  thumbWrapper: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  thumb: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  selectionRing: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: '#2f7147',
  },
});


