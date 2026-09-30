import { useLocationContext } from '@context/LocationContext'

/**
 * Shared geolocation and location selection hook.
 * Backed by LocationContext with persistent storage and fallback city selection.
 */
export function useGeolocation() {
  const context = useLocationContext()

  return {
    ...context,
    request: context.requestLocation,
    clear: context.clearLocation,
  }
}

