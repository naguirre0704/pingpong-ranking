// es-CL number/date formatting per Tazki brand (§5).

const clNumber = new Intl.NumberFormat('es-CL')

export const formatInt = (n) => clNumber.format(n ?? 0)

// 0.875 -> "87,5%" (one decimal, comma separator, no space before %)
export function formatPercent(ratio) {
  const value = (ratio ?? 0) * 100
  const rounded = Math.round(value * 10) / 10
  return `${rounded.toString().replace('.', ',')}%`
}

const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']

// "28 abr" / "28 abr 2026" if a previous year.
export function formatDate(iso) {
  const d = new Date(iso)
  const now = new Date()
  const base = `${d.getDate()} ${MONTHS[d.getMonth()]}`
  return d.getFullYear() === now.getFullYear() ? base : `${base} ${d.getFullYear()}`
}

export const HAND_LABEL = {
  right: 'Diestro',
  left: 'Zurdo',
  ambidextrous: 'Ambidiestro',
}
