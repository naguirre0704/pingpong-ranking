const PIN_KEY = 'pingpong_pin'

export const getPin = () => localStorage.getItem(PIN_KEY) || ''
export const setStoredPin = (pin) => localStorage.setItem(PIN_KEY, pin)
export const clearStoredPin = () => localStorage.removeItem(PIN_KEY)

// Thin fetch wrapper for the Rails JSON API. Attaches the shared PIN header
// on writes and normalises error shapes ({ error } / { errors: [...] }).
export async function api(path, { method = 'GET', body, pin } = {}) {
  const headers = { Accept: 'application/json' }
  if (body !== undefined) headers['Content-Type'] = 'application/json'

  const usePin = pin ?? getPin()
  if (usePin) headers['X-App-Pin'] = usePin

  const res = await fetch(`/api${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  if (res.status === 204) return null

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const message =
      data.error || (Array.isArray(data.errors) ? data.errors.join(' · ') : 'Algo salió mal')
    const error = new Error(message)
    error.status = res.status
    error.errors = data.errors
    throw error
  }
  return data
}

export async function validatePin(pin) {
  const res = await fetch('/api/session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ pin }),
  })
  return res.ok
}
