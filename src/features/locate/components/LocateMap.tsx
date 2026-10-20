import { useImperativeHandle, useMemo, useRef, type Ref } from 'react';
import { StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

import { mapHtml } from '../mapHtml';
import type { LatLon } from '../ign';

export type LocateMapHandle = {
  flyTo: (p: LatLon, zoom?: number) => void;
  setOutline: (ring: [number, number][] | null) => void;
};

type Props = {
  ref?: Ref<LocateMapHandle>;
  start: LatLon & { zoom: number };
  outlineColor: string;
  onMoveStart: () => void;
  onMoveEnd: (center: LatLon, intended: boolean) => void;
};

// Native: Leaflet inside a WebView (bundled in Expo Go, no map API key needed).
export default function LocateMap({ ref, start, outlineColor, onMoveStart, onMoveEnd }: Props) {
  const web = useRef<WebView>(null);
  const ready = useRef(false);
  const queue = useRef<object[]>([]);
  const html = useMemo(() => mapHtml(start, outlineColor), []); // eslint-disable-line react-hooks/exhaustive-deps

  const post = (m: object) => {
    if (!ready.current) return void queue.current.push(m);
    web.current?.injectJavaScript(`window.receive(${JSON.stringify(m)}); true;`);
  };

  useImperativeHandle(ref, () => ({
    flyTo: (p, zoom) => post({ type: 'flyTo', lat: p.lat, lon: p.lon, zoom }),
    setOutline: (ring) => post({ type: 'outline', ring }),
  }));

  return (
    <WebView
      ref={web}
      style={StyleSheet.absoluteFill}
      originWhitelist={['*']}
      source={{ html, baseUrl: 'https://myrain365.local/' }}
      javaScriptEnabled
      scrollEnabled={false}
      bounces={false}
      overScrollMode="never"
      setSupportMultipleWindows={false}
      onMessage={(e) => {
        const m = JSON.parse(e.nativeEvent.data);
        if (m.type === 'ready') {
          ready.current = true;
          queue.current.splice(0).forEach(post);
        } else if (m.type === 'moveStart') onMoveStart();
        else if (m.type === 'moveEnd') onMoveEnd({ lat: m.lat, lon: m.lon }, m.intended);
      }}
    />
  );
}
