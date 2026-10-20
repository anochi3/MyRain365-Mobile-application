import { useEffect, useState } from 'react';

import { suggestAddresses, type AddressSuggestion } from '@/data/services/ignService';

const DEBOUNCE_MS = 220;
const NO_SUGGESTIONS: AddressSuggestion[] = [];

export function useAddressSuggestions(query: string, isEnabled: boolean): AddressSuggestion[] {
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);

  useEffect(() => {
    if (!isEnabled) {
      return;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => {
      suggestAddresses(query, controller.signal)
        .then(setSuggestions)
        .catch(() => setSuggestions([]));
    }, DEBOUNCE_MS);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [query, isEnabled]);

  return isEnabled ? suggestions : NO_SUGGESTIONS;
}
