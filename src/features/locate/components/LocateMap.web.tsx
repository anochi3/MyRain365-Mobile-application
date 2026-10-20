import { useEffect, useImperativeHandle, useMemo, useRef, type Ref } from 'react';

import { mapHtml } from '../mapHtml';
import type { LatLon } from '../ign';
import type { LocateMapHandle } from './LocateMap';

type Props = {
  ref?: Ref<LocateMapHandle>;
  start: LatLon & { zoom: number };
  outlineColor: string;
  onMoveStart: () => void;
  onMoveEnd: (center: LatLon, intended: boolean) => void;
};

// Web: the same Leaflet page in an iframe, so the team can preview the screen in a browser.
export default function LocateMap({ ref, start, outlineColor, onMoveStart, onMoveEnd }: Props) {
  const frame = useRef<HTMLIFrameElement>(null);
  const ready = useRef(false);
  const queue = useRef<object[]>([]);
  const html = useMemo(() => mapHtml(start, outlineColor), []); // eslint-disable-line react-hooks/exhaustive-deps
  const handlers = useRef({ onMoveStart, onMoveEnd });
  useEffect(() => {
    handlers.current = { onMoveStart, onMoveEnd };
  });

  const post = (m: object) => {
    if (!ready.current) return void queue.current.push(m);
    frame.current?.contentWindow?.postMessage({ __locateMapIn: true, msg: m }, '*');
  };

  useImperativeHandle(ref, () => ({
    flyTo: (p, zoom) => post({ type: 'flyTo', lat: p.lat, lon: p.lon, zoom }),
    setOutline: (ring) => post({ type: 'outline', ring }),
  }));

  useEffect(() => {
    const onMsg = (e: MessageEvent) => {
      if (e.source !== frame.current?.contentWindow || !e.data?.__locateMap) return;
      const m = JSON.parse(e.data.data);
      if (m.type === 'ready') {
        ready.current = true;
        queue.current.splice(0).forEach(post);
      } else if (m.type === 'moveStart') handlers.current.onMoveStart();
      else if (m.type === 'moveEnd') handlers.current.onMoveEnd({ lat: m.lat, lon: m.lon }, m.intended);
    };
    window.addEventListener('message', onMsg);
    return () => window.removeEventListener('message', onMsg);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <iframe
      ref={frame}
      title="Aerial map"
      srcDoc={html}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0 }}
    />
  );
}
