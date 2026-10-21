import { useEffect, useRef, useState } from 'react';

import {
  detectionCommand,
  parseRoofModelMessage,
  roofModelEngineUri,
  toDetectedMaterial,
  type DetectedMaterial,
  type RoofModelCommand,
} from '@/data/services/roofMaterialService';
import type { RoofModelEngineProps } from '@/shared/components/roofModelEngine.types';

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

  const [answer] = useState(() => (id: number, detection: DetectedMaterial | null) => {
    if (id !== latestRequest.current || answeredRequest.current === id) return;
    answeredRequest.current = id;
    onResultRef.current(detection);
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

    const timer = setTimeout(() => answer(id, null), DETECTION_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [latitude, longitude, answer]);

  const handleMessage = (raw: string) => {
    const message = parseRoofModelMessage(raw);
    if (!message) return;

    if (message.type === 'ready') {
      isReady.current = true;
      if (pendingCommand.current) deliverRef.current(pendingCommand.current);
      pendingCommand.current = null;
      return;
    }

    answer(message.id, toDetectedMaterial(message.result));
  };

  const handleFailure = () => answer(latestRequest.current, null);

  return { engineUri, handleMessage, handleFailure };
}
