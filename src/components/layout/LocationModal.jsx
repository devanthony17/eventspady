import { useState } from 'react'
import { Check, LocateFixed, MapPin, Navigation, X } from 'lucide-react'
import { Modal } from '@components/ui/Modal'
import { Button } from '@components/ui/Button'
import { useLocationContext } from '@context/LocationContext'
import { cn } from '@lib/utils'

export function LocationModal() {
  const {
    isModalOpen,
    closeLocationModal,
    requestLocation,
    setCityLocation,
    clearLocation,
    location,
    status,
    error,
    availableCities,
  } = useLocationContext()

  const [locating, setLocating] = useState(false)

  const handleUseGps = async () => {
    setLocating(true)
    try {
      await requestLocation()
    } catch {
      // Handled in context
    } finally {
      setLocating(false)
    }
  }

  const handleSelectCity = (cityId) => {
    setCityLocation(cityId)
  }

  const handleClear = () => {
    clearLocation()
    closeLocationModal()
  }

  return (
    <Modal
      open={isModalOpen}
      onClose={closeLocationModal}
      title="Choose your location"
      description="Find and sort events happening closest to you."
      size="md"
    >
      <div className="space-y-5">
        {error && (
          <div className="rounded-xl border border-amber-200 bg-amber-50/90 p-3.5 text-xs text-amber-800 dark:border-amber-500/30 dark:bg-amber-950/30 dark:text-amber-300">
            <p className="font-semibold">{error}</p>
            <p className="mt-1 text-amber-700 dark:text-amber-400">
              You can pick one of the cities below to explore nearby events.
            </p>
          </div>
        )}

        {/* GPS location button */}
        <div className="rounded-2xl border border-ink-100 bg-ink-50/50 p-3.5 dark:border-white/10 dark:bg-white/[.03]">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="grid size-10 place-items-center rounded-xl bg-brand-500/10 text-brand-600 dark:bg-brand-500/20 dark:text-brand-400">
                <Navigation className="size-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-ink-900 dark:text-white">Use Device Location</p>
                <p className="text-xs text-ink-500 dark:text-ink-400">
                  {location?.isGps ? 'Currently using accurate GPS coordinates' : 'Detect your current position automatically'}
                </p>
              </div>
            </div>
            <Button
              size="sm"
              variant={location?.isGps ? 'primary' : 'outline'}
              onClick={handleUseGps}
              loading={locating || status === 'pending'}
              iconLeft={LocateFixed}
            >
              {location?.isGps ? 'Detected' : 'Locate me'}
            </Button>
          </div>
        </div>

        {/* Popular Cities in Ghana & Upper West */}
        <div>
          <p className="mb-2.5 text-xs font-bold uppercase tracking-wider text-ink-400 dark:text-ink-500">
            Or select a city
          </p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {availableCities.map((c) => {
              const isSelected = location?.city?.toLowerCase() === c.id.toLowerCase() ||
                location?.name?.toLowerCase() === c.name.toLowerCase()
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => handleSelectCity(c.id)}
                  className={cn(
                    'flex flex-col items-start rounded-xl border p-2.5 text-left transition',
                    isSelected
                      ? 'border-brand-600 bg-brand-50/70 text-brand-900 ring-2 ring-brand-500/30 dark:border-brand-500 dark:bg-brand-950/40 dark:text-brand-200'
                      : 'border-ink-200/80 bg-white hover:border-brand-300 hover:bg-ink-50/50 dark:border-white/10 dark:bg-ink-900/60 dark:hover:border-white/20 dark:hover:bg-white/5',
                  )}
                >
                  <span className="flex w-full items-center justify-between gap-1">
                    <span className="text-xs font-bold text-ink-900 dark:text-white">{c.name}</span>
                    {isSelected && <Check className="size-3.5 text-brand-600 dark:text-brand-400" />}
                  </span>
                  <span className="text-[10px] text-ink-500 dark:text-ink-400">{c.region}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Current status and reset */}
        {location && (
          <div className="flex items-center justify-between border-t border-ink-100 pt-3 dark:border-white/10">
            <div className="flex items-center gap-1.5 text-xs text-ink-600 dark:text-ink-300">
              <MapPin className="size-3.5 text-brand-600" />
              <span>
                Active: <strong className="font-semibold text-ink-900 dark:text-white">{location.name}</strong>
              </span>
            </div>
            <button
              type="button"
              onClick={handleClear}
              className="text-xs font-medium text-rose-600 hover:underline dark:text-rose-400"
            >
              Clear location
            </button>
          </div>
        )}
      </div>
    </Modal>
  )
}
