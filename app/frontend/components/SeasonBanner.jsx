import React, { useState } from 'react'
import { X, Trophy } from 'lucide-react'

// Aviso de cierre de Q2 / marcha blanca. Se muestra hasta el viernes 26 jun 2026
// (inclusive) y no vuelve a abrirse si el usuario ya lo cerró.
const STORAGE_KEY = 'tazki.seasonBanner.q2-2026.dismissed'
const DEADLINE = new Date('2026-06-27T00:00:00') // expira al terminar el 26 jun

function shouldShow() {
  if (new Date() >= DEADLINE) return false
  try {
    return localStorage.getItem(STORAGE_KEY) !== '1'
  } catch {
    return true
  }
}

export function SeasonBanner() {
  const [open, setOpen] = useState(shouldShow)

  if (!open) return null

  function dismiss() {
    try {
      localStorage.setItem(STORAGE_KEY, '1')
    } catch {
      /* sin localStorage: igual se cierra en esta sesión */
    }
    setOpen(false)
  }

  return (
    <div className="season-banner" role="status">
      <span className="season-banner__icon" aria-hidden="true">
        <Trophy size={18} strokeWidth={2.25} />
      </span>
      <div className="season-banner__body">
        <p className="season-banner__title">Se acaba el Q2</p>
        <p className="season-banner__text">
          Con el Q2 termina la marcha blanca de la app. Desde el Q3 los puntos
          cuentan en serio y vendrán premios. A motivarse y sumar.
        </p>
      </div>
      <button
        className="season-banner__close"
        onClick={dismiss}
        aria-label="Cerrar aviso"
      >
        <X size={16} strokeWidth={2.5} />
      </button>
    </div>
  )
}
