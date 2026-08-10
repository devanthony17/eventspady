import { useCallback, useState } from 'react'

/** Powers "events near me". Never auto-prompts — the user has to ask. */
export function useGeolocation() {
  const [position, setPosition] = useState(null)
  const [status, setStatus] = useState('idle') // idle | pending | granted | denied | unsupported
  const [error, setError] = useState(null)

  const request = useCallback(() => {
    if (!('geolocation' in navigator)) {
      setStatus('unsupported')
      setError('Location is not supported by this browser.')
      return
    }

    setStatus('pending')
    setError(null)

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setStatus('granted')
      },
      (err) => {
        setStatus('denied')
        setError(err.message || 'We could not access your location.')
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 },
    )
  }, [])

  const clear = useCallback(() => {
    setPosition(null)
    setStatus('idle')
    setError(null)
  }, [])

  return { position, status, error, request, clear }
}
