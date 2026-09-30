/**
 * Exports an array of objects to a downloadable CSV file in the browser.
 */
export function exportToCsv(filename, rows, headers) {
  if (!rows || !rows.length) return

  const columnKeys = headers ? Object.keys(headers) : Object.keys(rows[0])
  const headerLabels = headers ? Object.values(headers) : columnKeys

  const escapeCell = (value) => {
    if (value == null) return '""'
    const stringValue = String(value).replace(/"/g, '""')
    return `"${stringValue}"`
  }

  const csvContent = [
    headerLabels.map(escapeCell).join(','),
    ...rows.map((row) => columnKeys.map((key) => escapeCell(row[key])).join(',')),
  ].join('\r\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = filename.endsWith('.csv') ? filename : `${filename}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(link.href)
}
