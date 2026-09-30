import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { CITY_COORDINATES, distanceKm } from '@lib/utils'
import { useLocations } from '@hooks/api'

const LOCATION_STORAGE_KEY = 'eventspady:user_location'

export const AVAILABLE_CITIES = [
  { id: 'Wa', name: 'Wa (Central)', region: 'Upper West', lat: 10.0606, lng: -2.5057 },
  { id: 'Jirapa', name: 'Jirapa', region: 'Upper West', lat: 10.5312, lng: -2.705 },
  { id: 'Nandom', name: 'Nandom', region: 'Upper West', lat: 10.8542, lng: -2.7667 },
  { id: 'Wechiau', name: 'Wechiau', region: 'Upper West', lat: 9.7833, lng: -2.8333 },
  { id: 'Sombo', name: 'Sombo', region: 'Upper West', lat: 10.1587, lng: -2.5601 },
  { id: 'Lawra', name: 'Lawra', region: 'Upper West', lat: 10.6433, lng: -2.8167 },
  { id: 'Tumu', name: 'Tumu', region: 'Upper West', lat: 10.8753, lng: -1.9792 },
  { id: 'Tamale', name: 'Tamale', region: 'Northern Region', lat: 9.4008, lng: -0.8393 },
  { id: 'Bolgatanga', name: 'Bolgatanga', region: 'Upper East', lat: 10.7856, lng: -0.8514 },
  { id: 'Kumasi', name: 'Kumasi', region: 'Ashanti Region', lat: 6.6885, lng: -1.6244 },
  { id: 'Accra', name: 'Accra', region: 'Greater Accra', lat: 5.6037, lng: -0.187 },
]

const LocationContext = createContext(null)

function getStoredLocation() {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(LOCATION_STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (parsed?.lat && parsed?.lng) {
        return parsed
      }
    }
  } catch (e) {
    console.error('Failed to read stored location:', e)
  }
  return null
}

export function LocationProvider({ children }) {
  const { data: locationsData } = useLocations()
  const availableCities = useMemo(() => {
    if (Array.isArray(locationsData) && locationsData.length > 0) return locationsData
    if (Array.isArray(locationsData?.locations) && locationsData.locations.length > 0) return locationsData.locations
    if (Array.isArray(locationsData?.data) && locationsData.data.length > 0) return locationsData.data
    return AVAILABLE_CITIES
  }, [locationsData])

  const [location, setLocation] = useState(() => getStoredLocation())
  const [status, setStatus] = useState(location ? 'granted' : 'idle') // idle | pending | granted | denied | unsupported
  const [error, setError] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Save to localStorage whenever location changes
  useEffect(() => {
    if (location) {
      try {
        localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(location))
      } catch (e) {
        console.warn('Failed to save location:', e)
      }
    } else {
      localStorage.removeItem(LOCATION_STORAGE_KEY)
    }
  }, [location])

  const openLocationModal = useCallback(() => {
    setIsModalOpen(true)
  }, [])

  const closeLocationModal = useCallback(() => {
    setIsModalOpen(false)
  }, [])

  // Find closest city name if coordinates match roughly
  const findClosestCityName = useCallback((coords) => {
    let closestCity = 'My Location'
    let minDistance = Infinity

    for (const city of AVAILABLE_CITIES) {
      const dist = distanceKm(coords, { lat: city.lat, lng: city.lng })
      if (dist !== null && dist < minDistance) {
        minDistance = dist
        closestCity = city.name
      }
    }

    if (minDistance <= 25) {
      return closestCity
    }
    return 'My Location'
  }, [])

  const setCityLocation = useCallback((cityName) => {
    const city = AVAILABLE_CITIES.find(
      (c) => c.id.toLowerCase() === cityName.toLowerCase() || c.name.toLowerCase() === cityName.toLowerCase()
    ) || { id: cityName, name: cityName, ...CITY_COORDINATES[cityName] }

    if (city && city.lat != null && city.lng != null) {
      const loc = {
        lat: city.lat,
        lng: city.lng,
        name: city.name,
        city: city.id,
        isGps: false,
      }
      setLocation(loc)
      setStatus('granted')
      setError(null)
      setIsModalOpen(false)
      return loc
    }
    return null
  }, [])

  const requestLocation = useCallback(() => {
    if (!('geolocation' in navigator)) {
      setStatus('unsupported')
      setError('Location services are not supported by your browser.')
      setIsModalOpen(true)
      return Promise.reject(new Error('Geolocation unsupported'))
    }

    setStatus('pending')
    setError(null)

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude }
          const name = findClosestCityName(coords)
          const loc = {
            ...coords,
            name,
            city: name,
            isGps: true,
          }
          setLocation(loc)
          setStatus('granted')
          setError(null)
          setIsModalOpen(false)
          resolve(loc)
        },
        (err) => {
          let msg = 'Could not access device location.'
          if (err.code === 1) {
            msg = 'Location access was denied. Choose your city below:'
          } else if (err.code === 2) {
            msg = 'Position unavailable. Choose your city below:'
          } else if (err.code === 3) {
            msg = 'Location request timed out. Choose your city below:'
          }
          setStatus('denied')
          setError(msg)
          // Automatically open modal to let user pick city easily!
          setIsModalOpen(true)
          resolve(null)
        },
        { enableHighAccuracy: false, timeout: 6000, maximumAge: 300000 },
      )
    })
  }, [findClosestCityName])

  const clearLocation = useCallback(() => {
    setLocation(null)
    setStatus('idle')
    setError(null)
  }, [])

  const value = {
    position: location ? { lat: location.lat, lng: location.lng } : null,
    location,
    locationName: location?.name || null,
    status,
    error,
    isModalOpen,
    openLocationModal,
    closeLocationModal,
    requestLocation,
    setCityLocation,
    clearLocation,
    availableCities,
  }

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  )
}

export function useLocationContext() {
  const context = useContext(LocationContext)
  if (!context) {
    throw new Error('useLocationContext must be used within a LocationProvider')
  }
  return context
}
