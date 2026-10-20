import { useState, type ReactNode } from 'react';
import { View, type LayoutChangeEvent } from 'react-native';

import { colors, fonts } from '@/shared/global.styles';

export const chartText = {
  fontSize: 10,
  fill: colors.secondaryText,
  fontFamily: fonts.regular,
};

type Props = {
  height: number;
  children: (width: number) => ReactNode;
};

export default function ChartFrame({ height, children }: Props) {
  const [width, setWidth] = useState(0);
  const onLayout = (event: LayoutChangeEvent) =>
    setWidth(Math.floor(event.nativeEvent.layout.width));

  return (
    <View style={{ height }} onLayout={onLayout}>
      {width > 0 ? children(width) : null}
    </View>
  );
}
