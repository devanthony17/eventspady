/**
 * Generates and downloads an iCalendar (.ics) file for an event.
 * Compatible with Apple Calendar, Google Calendar, Outlook, etc.
 */
export function downloadIcsFile(event) {
  if (!event) return

  const formatDateIcs = (isoStr) => {
    const d = new Date(isoStr)
    return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
  }

  const title = event.title || 'Event'
  const description = (Array.isArray(event.description) ? event.description.join('\\n\\n') : event.description || '')
    .replace(/\n/g, '\\n')
    .replace(/,/g, '\\,')
  const location = event.venue
    ? `${event.venue.name}, ${event.venue.address || ''}, ${event.venue.city || ''}, Ghana`.replace(/,/g, '\\,')
    : 'Online Event'

  const start = formatDateIcs(event.start || new Date().toISOString())
  const end = formatDateIcs(event.end || new Date(Date.now() + 2 * 3600000).toISOString())
  const now = formatDateIcs(new Date().toISOString())
  const uid = `eventspady-${event.id || Date.now()}@eventspady.com`

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Eventspady//Event Booking//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${now}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${title}`,
    `DESCRIPTION:${description}`,
    `LOCATION:${location}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `${(event.slug || 'event')}.ics`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(link.href)
}
