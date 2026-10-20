/** Web map: the same Leaflet page in an iframe; messages travel with window.postMessage. */
import { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';

import { useMapBridge } from '../hooks/useMapBridge';
import { MAP_COMMAND_CHANNEL, type BuildingMapProps } from './buildingMap.types';

export default function BuildingMap(props: BuildingMapProps) {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const { html, handleMessage } = useMapBridge(props, (command) => {
    const message = JSON.stringify({ channel: MAP_COMMAND_CHANNEL, command });
    frameRef.current?.contentWindow?.postMessage(message, '*');
  });

  const handleMessageRef = useRef(handleMessage);
  useEffect(() => {
    handleMessageRef.current = handleMessage;
  });

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.source === frameRef.current?.contentWindow && typeof event.data === 'string') {
        handleMessageRef.current(event.data);
      }
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  return (
    <View style={StyleSheet.absoluteFill}>
      <iframe ref={frameRef} title="Aerial map" srcDoc={html} style={styles.frame} />
    </View>
  );
}

const styles = {
  frame: { width: '100%', height: '100%', border: 0 },
} as const;
