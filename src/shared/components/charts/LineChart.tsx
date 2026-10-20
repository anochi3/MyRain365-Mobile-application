import Svg, { Circle, Line, Polygon, Polyline, Rect, Text as SvgText } from 'react-native-svg';

import { colors } from '@/shared/global.styles';

import ChartFrame, { chartText } from './ChartFrame';

export type LinePoint = {
  label: string;
  value: number;
  isHighlighted?: boolean;
};

type Props = {
  points: LinePoint[];
  min?: number;
  max: number;
  height?: number;
  formatValue: (value: number) => string;
  ticks?: number[];
  fillArea?: boolean;
  showDots?: boolean;
  limit?: { value: number; label: string };
  band?: { from: number; to: number; label: string };
};

const LEFT = 36;
const RIGHT = 12;
const TOP = 16;
const BOTTOM = 24;

export default function LineChart({
  points,
  min = 0,
  max,
  height = 170,
  formatValue,
  ticks = [min, max],
  fillArea = false,
  showDots = false,
  limit,
  band,
}: Props) {
  return (
    <ChartFrame height={height}>
      {(width) => {
        const plotWidth = width - LEFT - RIGHT;
        const plotHeight = height - TOP - BOTTOM;
        const x = (index: number) =>
          LEFT + (points.length > 1 ? (index / (points.length - 1)) * plotWidth : plotWidth / 2);
        const y = (value: number) =>
          TOP + plotHeight * (1 - (Math.min(Math.max(value, min), max) - min) / (max - min || 1));
        const line = points.map((point, index) => `${x(index)},${y(point.value)}`).join(' ');
        const labelEvery = Math.ceil(points.length / 12);

        return (
          <Svg width={width} height={height}>
            {band ? (
              <>
                <Rect
                  x={LEFT}
                  y={y(band.to)}
                  width={plotWidth}
                  height={y(band.from) - y(band.to)}
                  fill={colors.warningBackground}
                />
                <SvgText
                  x={width - RIGHT}
                  y={y(band.to) + 12}
                  textAnchor="end"
                  {...chartText}
                  fill={colors.warningTitle}
                >
                  {band.label}
                </SvgText>
              </>
            ) : null}
            {ticks.map((tick) => [
              <Line
                key={`grid-${tick}`}
                x1={LEFT}
                x2={width - RIGHT}
                y1={y(tick)}
                y2={y(tick)}
                stroke={colors.cardBorder}
              />,
              <SvgText
                key={`tick-${tick}`}
                x={LEFT - 6}
                y={y(tick) + 4}
                textAnchor="end"
                {...chartText}
              >
                {formatValue(tick)}
              </SvgText>,
            ])}
            {limit ? (
              <>
                <Line
                  x1={LEFT}
                  x2={width - RIGHT}
                  y1={y(limit.value)}
                  y2={y(limit.value)}
                  stroke={colors.buttons}
                  strokeDasharray="5 4"
                />
                <SvgText
                  x={width - RIGHT}
                  y={y(limit.value) - 6}
                  textAnchor="end"
                  {...chartText}
                  fill={colors.buttons}
                >
                  {limit.label}
                </SvgText>
              </>
            ) : null}
            {fillArea ? (
              <Polygon
                points={`${x(0)},${y(min)} ${line} ${x(points.length - 1)},${y(min)}`}
                fill={colors.greenBackground}
              />
            ) : null}
            <Polyline
              points={line}
              fill="none"
              stroke={colors.teal}
              strokeWidth={2.5}
              strokeLinejoin="round"
            />
            {showDots
              ? points.map((point, index) => (
                  <Circle
                    key={`dot-${index}`}
                    cx={x(index)}
                    cy={y(point.value)}
                    r={point.isHighlighted ? 8 : 5}
                    fill={point.isHighlighted ? colors.buttons : colors.cardBackground}
                    stroke={point.isHighlighted ? colors.buttons : colors.teal}
                    strokeWidth={3}
                  />
                ))
              : null}
            {points.map((point, index) =>
              index % labelEvery === 0 ? (
                <SvgText
                  key={`x-${index}`}
                  x={x(index)}
                  y={height - 6}
                  textAnchor="middle"
                  {...chartText}
                >
                  {point.label}
                </SvgText>
              ) : null,
            )}
          </Svg>
        );
      }}
    </ChartFrame>
  );
}
