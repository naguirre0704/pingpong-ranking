import React, { useEffect, useState } from 'react'

export function PinModal({ open, onSubmit, onCancel }) {
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (open) {
      setPin('')
      setError('')
      setBusy(false)
    }
  }, [open])

  if (!open) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      await onSubmit(pin)
    } catch (err) {
      setError(err.message || 'No se pudo validar el PIN')
      setBusy(false)
    }
  }

  return (
    <div className="sheet" role="dialog" aria-modal="true" aria-label="Ingresar PIN">
      <div className="sheet__backdrop" onClick={onCancel} />
      <form className="sheet__panel" onSubmit={handleSubmit}>
        <p className="eyebrow">Acceso de equipo</p>
        <h2 className="sheet__title">Ingresa el PIN</h2>
        <p className="page-sub">Necesario para registrar partidos y administrar jugadores.</p>

        <div className="field" style={{ marginTop: 'var(--tz-space-5)' }}>
          <input
            className="input tnum"
            inputMode="numeric"
            autoComplete="off"
            autoFocus
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            placeholder="••••"
            style={{ textAlign: 'center', letterSpacing: '.3em', fontSize: 'var(--tz-text-xl)' }}
          />
          {error && <span className="field__help" style={{ color: 'var(--tz-danger)' }}>{error}</span>}
        </div>

        <div className="sheet__actions">
          <button type="button" className="btn btn--ghost" onClick={onCancel}>
            Cancelar
          </button>
          <button type="submit" className="btn btn--primary" disabled={busy || !pin}>
            {busy ? 'Validando' : 'Continuar'}
          </button>
        </div>
      </form>
    </div>
  )
}
