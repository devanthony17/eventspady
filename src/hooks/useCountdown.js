import { useEffect, useState } from 'react'
import { countdownParts } from '@lib/utils'

/** Live countdown to `target`. Returns null once the date has passed. */
export function useCountdown(target) {
  const [parts, setParts] = useState(() => countdownParts(target))

  useEffect(() => {
    setParts(countdownParts(target))
    const id = setInterval(() => setParts(countdownParts(target)), 1000)
    return () => clearInterval(id)
  }, [target])

  return parts
}
