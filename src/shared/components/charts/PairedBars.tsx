/** Two bars per day: what was needed (grey) and what the tank supplied (teal, or brick when short). */
import Svg, { Line, Rect, Text as SvgText } from 'react-native-svg';

import { colors } from '@/shared/global.styles';

import ChartFrame, { chartText } from './ChartFrame';

export type PairedBar = {
  label: string;
  back: number;
  front: number;
};

type Props = {
  bars: PairedBar[];
  height?: number;
  formatValue: (value: number) => string;
};

const LEFT = 40;
const BOTTOM = 22;
const TOP = 10;

export default function PairedBars({ bars, height = 160, formatValue }: Props) {
  const max = Math.max(...bars.map((bar) => Math.max(bar.back, bar.front)), 1) * 1.1;

  return (
    <ChartFrame height={height}>
      {(width) => {
        const plotHeight = height - TOP - BOTTOM;
        const baseY = height - BOTTOM;
        const step = (width - LEFT) / bars.length;
        const barWidth = Math.min(36, step * 0.35);
        // Same scaling as the monthly chart: value ÷ max × plot height, up from the base line.
        const y = (value: number) => baseY - (plotHeight * value) / max;

        return (
          <Svg width={width} height={height}>
            {[0, max / 2, max].map((tick) => [
              <Line
                key={`g-${tick}`}
                x1={LEFT}
                x2={width}
                y1={y(tick)}
                y2={y(tick)}
                stroke={colors.cardBorder}
              />,
              <SvgText
                key={`t-${tick}`}
                x={LEFT - 6}
                y={y(tick) + 4}
                textAnchor="end"
                {...chartText}
              >
                {formatValue(tick)}
              </SvgText>,
            ])}
            {bars.map((bar, index) => {
              const center = LEFT + step * index + step / 2;
              return [
                <Rect
                  key={`b-${index}`}
                  x={center - barWidth - 2}
                  y={y(bar.back)}
                  width={barWidth}
                  height={baseY - y(bar.back)}
                  rx={4}
                  fill={colors.inactiveTab}
                />,
                <Rect
                  key={`f-${index}`}
                  x={center + 2}
                  y={y(bar.front)}
                  width={barWidth}
                  height={baseY - y(bar.front)}
                  rx={4}
                  fill={bar.front < bar.back ? colors.warningTitle : colors.teal}
                />,
                <SvgText
                  key={`l-${index}`}
                  x={center}
                  y={height - 6}
                  textAnchor="middle"
                  {...chartText}
                >
                  {bar.label}
                </SvgText>,
              ];
            })}
          </Svg>
        );
      }}
    </ChartFrame>
  );
}
