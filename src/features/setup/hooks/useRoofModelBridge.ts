import { useEffect, useRef, useState } from 'react';

import {
  detectionCommand,
  parseRoofModelMessage,
  roofModelEngineUri,
  toDetectedMaterial,
  type RoofModelCommand,
} from '@/data/services/roofMaterialService';

import type { RoofModelEngineProps } from '../components/roofModelEngine.types';

const DETECTION_TIMEOUT_MS = 120000;

export function useRoofModelBridge(
  { coordinates, onResult }: RoofModelEngineProps,
  deliver: (command: RoofModelCommand) => void,
) {
  const [engineUri] = useState(roofModelEngineUri);
  const isReady = useRef(false);
  const pendingCommand = useRef<RoofModelCommand | null>(null);
  const latestRequest = useRef(0);
  const answeredRequest = useRef(0);
  const deliverRef = useRef(deliver);
  const onResultRef = useRef(onResult);

  useEffect(() => {
    deliverRef.current = deliver;
    onResultRef.current = onResult;
  });

  const latitude = coordinates?.latitude;
  const longitude = coordinates?.longitude;

  useEffect(() => {
    if (latitude === undefined || longitude === undefined) return;

    const id = latestRequest.current + 1;
    latestRequest.current = id;
    const command = detectionCommand(id, { latitude, longitude });
    if (isReady.current) {
      deliverRef.current(command);
    } else {
      pendingCommand.current = command;
    }

    const timer = setTimeout(() => {
      if (latestRequest.current === id && answeredRequest.current !== id) {
        answeredRequest.current = id;
        onResultRef.current(null);
      }
    }, DETECTION_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [latitude, longitude]);

  const handleMessage = (raw: string) => {
    const message = parseRoofModelMessage(raw);
    if (!message) return;

    if (message.type === 'ready') {
      isReady.current = true;
      if (pendingCommand.current) deliverRef.current(pendingCommand.current);
      pendingCommand.current = null;
      return;
    }

    if (message.id !== latestRequest.current || answeredRequest.current === message.id) return;
    answeredRequest.current = message.id;
    onResultRef.current(toDetectedMaterial(message.result));
  };

  return { engineUri, handleMessage };
}
