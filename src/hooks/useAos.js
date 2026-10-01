import { useEffect } from 'react'

/**
 * Custom Animate-On-Scroll (AOS) hook using native IntersectionObserver.
 * Observes elements with `[data-aos]` and applies `.aos-animate` when visible.
 */
export function useAos(options = {}) {
  const { threshold = 0.1, rootMargin = '0px 0px -40px 0px', once = true } = options

  useEffect(() => {
    // If the user prefers reduced motion, immediately animate all elements
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) {
      document.querySelectorAll('[data-aos]').forEach((el) => el.classList.add('aos-animate'))
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('aos-animate')
            if (once) {
              observer.unobserve(entry.target)
            }
          } else if (!once) {
            entry.target.classList.remove('aos-animate')
          }
        })
      },
      {
        threshold,
        rootMargin,
      },
    )

    // Observe all current data-aos elements
    const elements = document.querySelectorAll('[data-aos]')
    elements.forEach((el) => observer.observe(el))

    // Observe any elements dynamically added to the DOM
    const mutationObserver = new MutationObserver(() => {
      document.querySelectorAll('[data-aos]:not(.aos-animate)').forEach((el) => {
        observer.observe(el)
      })
    })

    mutationObserver.observe(document.body, { childList: true, subtree: true })

    return () => {
      observer.disconnect()
      mutationObserver.disconnect()
    }
  }, [threshold, rootMargin, once])
}
