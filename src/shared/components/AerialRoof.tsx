/** IGN aerial photo around a building with its outline drawn on top. */
import { Image } from 'expo-image';
import { useState } from 'react';
import { StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import Svg, { Polygon } from 'react-native-svg';

import { aerialImageUrl, boundsAround } from '@/data/services/ignService';
import type { Ring } from '@/shared/geo';
import { colors, radii } from '@/shared/global.styles';

type Props = {
  outline: Ring;
  height: number;
  padding?: number;
};

// Ask for an image twice the screen size so it stays sharp on high-density phone screens.
const PIXEL_DENSITY = 2;

export default function AerialRoof({ outline, height, padding = 1.2 }: Props) {
  const [width, setWidth] = useState(0);
  const onLayout = (event: LayoutChangeEvent) =>
    setWidth(Math.floor(event.nativeEvent.layout.width));

  const bounds = width > 0 ? boundsAround(outline, padding, width / height) : null;
  // Converts a map corner to a position on the image: its share of the way across the rectangle × size.
  const toPoint = ([longitude, latitude]: [number, number]) => {
    if (!bounds) return '0,0';
    const x = ((longitude - bounds.west) / (bounds.east - bounds.west)) * width;
    const y = ((bounds.north - latitude) / (bounds.north - bounds.south)) * height;
    return `${x},${y}`;
  };

  return (
    <View style={[styles.frame, { height }]} onLayout={onLayout}>
      {bounds ? (
        <>
          <Image
            source={{ uri: aerialImageUrl(bounds, width * PIXEL_DENSITY, height * PIXEL_DENSITY) }}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            transition={200}
            accessibilityIgnoresInvertColors
          />
          <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
            <Polygon
              points={outline.map(toPoint).join(' ')}
              fill={colors.teal}
              fillOpacity={0.25}
              stroke={colors.cardBackground}
              strokeWidth={2}
            />
          </Svg>
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    borderRadius: radii.card,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.cardBorder,
    backgroundColor: colors.mapBackground,
  },
});
