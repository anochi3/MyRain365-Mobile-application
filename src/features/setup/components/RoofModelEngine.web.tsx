import { useEffect, useRef } from 'react';

import { ROOF_MODEL_CHANNEL } from '@/data/services/roofMaterialService';

import { useRoofModelBridge } from '../hooks/useRoofModelBridge';
import type { RoofModelEngineProps } from './roofModelEngine.types';

export default function RoofModelEngine(props: RoofModelEngineProps) {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const { engineUri, handleMessage } = useRoofModelBridge(props, (command) => {
    const message = JSON.stringify({ channel: ROOF_MODEL_CHANNEL, command });
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

  return <iframe ref={frameRef} title="Roof model" src={engineUri} style={styles.frame} />;
}

const styles = {
  frame: { position: 'absolute', width: 1, height: 1, opacity: 0, border: 0 },
} as const;
