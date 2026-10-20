/** Weather icon for an Open-Meteo weather code (WMO standard). */
import {
  Cloud,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSnow,
  CloudSun,
  Sun,
} from 'phosphor-react-native';

import { colors } from '@/shared/global.styles';

type Props = {
  code: number;
  size?: number;
};

const ICONS = {
  clear: Sun,
  partly: CloudSun,
  cloudy: Cloud,
  fog: CloudFog,
  rain: CloudRain,
  snow: CloudSnow,
  storm: CloudLightning,
};

function kindFor(code: number): keyof typeof ICONS {
  if (code === 0) return 'clear';
  if (code <= 2) return 'partly';
  if (code === 3) return 'cloudy';
  if (code <= 48) return 'fog';
  if (code <= 67 || (code >= 80 && code <= 82)) return 'rain';
  if (code <= 77 || code === 85 || code === 86) return 'snow';
  return 'storm';
}

export default function WeatherIcon({ code, size = 26 }: Props) {
  const IconComponent = ICONS[kindFor(code)];
  return <IconComponent size={size} weight="fill" color={colors.buttons} />;
}
