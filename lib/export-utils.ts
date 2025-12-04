/**
 * Export utilities for analytics data
 */

export function exportToCSV(data: any[], filename: string = 'export.csv') {
  if (data.length === 0) return

  const headers = Object.keys(data[0])
  const csvContent = [
    headers.join(','),
    ...data.map((row) =>
      headers.map((header) => {
        const value = row[header]
        if (value === null || value === undefined) return ''
        if (typeof value === 'object') return JSON.stringify(value)
        return String(value).includes(',') ? `"${value}"` : value
      }).join(',')
    ),
  ].join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export function exportToJSON(data: any, filename: string = 'export.json') {
  const jsonContent = JSON.stringify(data, null, 2)
  const blob = new Blob([jsonContent], { type: 'application/json' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export async function exportToPDF(data: any[], title: string = 'Report') {
  // This would require a PDF library like jsPDF
  // For now, we'll just log that PDF export is not yet implemented
  console.warn('PDF export not yet implemented. Please use CSV or JSON export.')
  // In production, you would use jsPDF or similar library
  // import jsPDF from 'jspdf'
  // const doc = new jsPDF()
  // ... generate PDF
  // doc.save(`${title}.pdf`)
}

