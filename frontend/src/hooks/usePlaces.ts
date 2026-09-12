import { useCallback, useEffect, useState } from 'react';

import { RouteServiceError, type RouteServiceErrorKind } from '../data/errors';
import { getPlaces } from '../data/routeService';
import type { Place } from '../types/contracts';

export function usePlaces(mapId: string) {
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorKind, setErrorKind] = useState<RouteServiceErrorKind | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setErrorKind(null);

    getPlaces(mapId)
      .then((response) => {
        if (!cancelled) setPlaces(response.places);
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setPlaces([]);
        setErrorKind(error instanceof RouteServiceError ? error.kind : 'SERVER_ERROR');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [mapId, reloadToken]);

  const retry = useCallback(() => setReloadToken((token) => token + 1), []);
  return { places, loading, errorKind, retry };
}
