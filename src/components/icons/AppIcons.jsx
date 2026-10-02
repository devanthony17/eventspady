import React from 'react'

/**
 * Premium handcrafted Ticket / Event Admission Pass icon.
 * Features realistic top & bottom tear notches, a dashed perforation line,
 * an authentic admission star crest, and barcode details.
 * Seamless drop-in replacement for Lucide's default Ticket icon.
 */
export function Ticket({ className = 'size-5', ...props }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      {/* Ticket body with smooth top and bottom tear notches */}
      <path d="M3 7a2 2 0 0 1 2-2h4a1.5 1.5 0 0 1 1.5 1.5 1.5 1.5 0 0 0 3 0A1.5 1.5 0 0 1 15 5h4a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-4a1.5 1.5 0 0 1-1.5-1.5 1.5 1.5 0 0 0-3 0A1.5 1.5 0 0 1 9 19H5a2 2 0 0 1-2-2V7Z" />
      {/* Vertical perforated stub tear line */}
      <path d="M12 6.5v11" strokeDasharray="1.5 2" strokeWidth="1.4" opacity="0.65" />
      {/* Admission star insignia on the left voucher */}
      <path
        d="M7.5 9.4l.45 1.05 1.15.16-.83.81.2 1.14-.97-.51-.97.51.2-1.14-.83-.81 1.15-.16.45-1.05Z"
        fill="currentColor"
        stroke="none"
      />
      {/* Clean admission details on the main ticket stub */}
      <path d="M15 10h3M15 14h2" strokeWidth="1.6" />
    </svg>
  )
}
export const TicketIcon = Ticket

/**
 * Premium Radiant Diamond Starburst / Sparkles icon.
 * Features organic concave curved flares with luminous secondary and tertiary diamond glints.
 * Seamless drop-in replacement for Lucide's default Sparkles icon.
 */
export function Sparkles({ className = 'size-5', ...props }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      {/* Primary elegant concave radiant flare star */}
      <path
        d="M10 2.5C10 6.64 6.64 10 2.5 10C6.64 10 10 13.36 10 17.5C10 13.36 13.36 10 17.5 10C13.36 10 10 6.64 10 2.5Z"
        fill="currentColor"
        fillOpacity="0.15"
      />
      {/* Secondary accent diamond flare */}
      <path
        d="M18.5 2C18.5 4.21 16.71 6 14.5 6C16.71 6 18.5 7.79 18.5 10C18.5 7.79 20.29 6 22.5 6C20.29 6 18.5 4.21 18.5 2Z"
        fill="currentColor"
        fillOpacity="0.2"
      />
      {/* Tertiary micro-star flare */}
      <path
        d="M18 15.5C18 17 17 18 15.5 18C17 18 18 19 18 20.5C18 19 19 18 20.5 18C19 18 18 17 18 15.5Z"
        fill="currentColor"
        fillOpacity="0.25"
      />
    </svg>
  )
}
export const SparklesIcon = Sparkles
