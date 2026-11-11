const escapeCell = (value) => {
  if (value === null || value === undefined) return ''
  const s = String(value)
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

/** columns: [{ header: 'Name', value: (row) => row.name }] */
export function toCsv(rows, columns) {
  const head = columns.map((c) => escapeCell(c.header)).join(',')
  const body = rows.map((r) => columns.map((c) => escapeCell(c.value(r))).join(','))
  return [head, ...body].join('\n')
}
