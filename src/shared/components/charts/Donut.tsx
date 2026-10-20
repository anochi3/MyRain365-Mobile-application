import Svg, { Circle, Text as SvgText } from 'react-native-svg';

import { colors, fonts } from '@/shared/global.styles';

type Props = {
  fraction: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  label: string;
};

export default function Donut({
  fraction,
  size = 104,
  strokeWidth = 12,
  color = colors.teal,
  label,
}: Props) {
  const center = size / 2;
  const radius = center - strokeWidth / 2 - 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(1, fraction));

  return (
    <Svg width={size} height={size} accessibilityLabel={label}>
      <Circle
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        stroke={colors.inactiveTab}
        strokeWidth={strokeWidth}
      />
      <Circle
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={`${circumference * clamped} ${circumference}`}
        transform={`rotate(-90 ${center} ${center})`}
      />
      <SvgText
        x={center}
        y={center + size * 0.09}
        textAnchor="middle"
        fontSize={size * 0.27}
        fontFamily={fonts.bold}
        fill={colors.primaryText}
      >
        {label}
      </SvgText>
    </Svg>
  );
}
