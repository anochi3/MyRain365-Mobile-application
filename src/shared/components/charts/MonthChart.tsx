import Svg, { Line, Polyline, Rect, Text as SvgText } from 'react-native-svg';

import type { MonthResult } from '@/data/calculations/simulation';
import { colors } from '@/shared/global.styles';

import ChartFrame, { chartText } from './ChartFrame';

type Props = {
  months: MonthResult[];
  monthInitials: string[];
  unitLabel: string;
  height?: number;
};

const LEFT = 30;
const BOTTOM = 24;
const TOP = 20;

export default function MonthChart({ months, monthInitials, unitLabel, height = 200 }: Props) {
  const top =
    Math.max(
      ...months.map((month) =>
        Math.max(month.inflowM3, month.demandM3, month.averageLevelL / 1000),
      ),
      0.1,
    ) * 1.12;

  return (
    <ChartFrame height={height}>
      {(width) => {
        const plotHeight = height - BOTTOM - TOP;
        const baseY = height - BOTTOM;
        const step = (width - LEFT - 4) / 12;
        const barWidth = Math.min(14, step - 4);
        const y = (value: number) => baseY - (plotHeight * value) / top;
        const levelPoints = months
          .map(
            (month, index) =>
              `${LEFT + 4 + index * step + barWidth / 2},${y(month.averageLevelL / 1000)}`,
          )
          .join(' ');

        return (
          <Svg width={width} height={height}>
            <SvgText x={LEFT} y={11} {...chartText}>
              {unitLabel}
            </SvgText>
            {[0, 0.5, 1].map((share) => (
              <Line
                key={share}
                x1={LEFT}
                x2={width}
                y1={y(top * share)}
                y2={y(top * share)}
                stroke={colors.cardBorder}
              />
            ))}
            {[0, 0.5, 1].map((share) => (
              <SvgText
                key={`label-${share}`}
                x={LEFT - 6}
                y={y(top * share) + 4}
                textAnchor="end"
                {...chartText}
              >
                {(top * share).toFixed(top < 3 ? 1 : 0)}
              </SvgText>
            ))}
            {months.map((month, index) => {
              const x = LEFT + 4 + index * step;
              return [
                <Rect
                  key={`demand-${index}`}
                  x={x}
                  y={y(month.demandM3)}
                  width={barWidth}
                  height={baseY - y(month.demandM3)}
                  rx={4}
                  fill={colors.blueSoft}
                />,
                <Rect
                  key={`inflow-${index}`}
                  x={x + 3}
                  y={y(month.inflowM3)}
                  width={Math.max(barWidth - 6, 2)}
                  height={baseY - y(month.inflowM3)}
                  rx={3}
                  fill={colors.teal}
                />,
                <SvgText
                  key={`month-${index}`}
                  x={x + barWidth / 2}
                  y={height - 6}
                  textAnchor="middle"
                  {...chartText}
                >
                  {monthInitials[index]}
                </SvgText>,
              ];
            })}
            <Polyline
              points={levelPoints}
              fill="none"
              stroke={colors.warningTitle}
              strokeWidth={2.5}
              strokeLinejoin="round"
            />
          </Svg>
        );
      }}
    </ChartFrame>
  );
}
