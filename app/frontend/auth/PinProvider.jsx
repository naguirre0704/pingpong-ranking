import React, { createContext, useCallback, useContext, useRef, useState } from 'react'
import { clearStoredPin, getPin, setStoredPin, validatePin } from '~/api/client'
import { PinModal } from '~/components/PinModal'

const PinContext = createContext(null)
export const usePin = () => useContext(PinContext)

export function PinProvider({ children }) {
  const [open, setOpen] = useState(false)
  const [hasPin, setHasPin] = useState(() => !!getPin())
  const resolverRef = useRef(null)

  // Resolves with a valid PIN, opening the modal if none is stored yet.
  // Resolves with null if the user cancels.
  const ensurePin = React.useCallback(() => {
    const existing = getPin()
    if (existing) return Promise.resolve(existing)
    setOpen(true)
    return new Promise((resolve) => {
      resolverRef.current = resolve
    })
  }, [])

  const submit = async (pin) => {
    const ok = await validatePin(pin)
    if (!ok) throw new Error('PIN incorrecto')
    setStoredPin(pin)
    setHasPin(true)
    setOpen(false)
    resolverRef.current?.(pin)
    resolverRef.current = null
  }

  const cancel = () => {
    setOpen(false)
    resolverRef.current?.(null)
    resolverRef.current = null
  }

  const forget = () => {
    clearStoredPin()
    setHasPin(false)
  }

  return (
    <PinContext.Provider value={{ ensurePin, forget, hasPin }}>
      {children}
      <PinModal open={open} onSubmit={submit} onCancel={cancel} />
    </PinContext.Provider>
  )
}
