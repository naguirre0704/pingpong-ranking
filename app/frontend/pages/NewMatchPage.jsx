import React, { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useCreateMatch, usePlayers } from '~/api/hooks'
import { usePin } from '~/auth/PinProvider'
import { previewPoints } from '~/lib/scoring'

const EMPTY = { playerA: '', playerB: '', winner: '', target: 11, withScore: false, winnerScore: '', loserScore: '' }

export function NewMatchPage() {
  const { data: players = [], isLoading } = usePlayers()
  const { ensurePin } = usePin()
  const createMatch = useCreateMatch()

  const [form, setForm] = useState(EMPTY)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  const set = (patch) => {
    setForm((f) => ({ ...f, ...patch }))
    setError('')
    setDone(false)
  }

  const { playerA, playerB, winner, target, withScore, winnerScore, loserScore } = form
  const bothPicked = playerA && playerB && playerA !== playerB
  const loserId = winner && (winner === playerA ? playerB : playerA)

  const canSubmit =
    bothPicked &&
    winner &&
    (!withScore || (winnerScore !== '' && loserScore !== ''))

  const preview = useMemo(
    () => previewPoints({ target, loserScore: withScore ? loserScore : null }),
    [target, withScore, loserScore],
  )

  const nameOf = (id) => players.find((p) => String(p.id) === String(id))?.name || ''

  const submit = async (e) => {
    e.preventDefault()
    if (!canSubmit) return
    const pin = await ensurePin()
    if (!pin) return

    const payload = {
      winner_id: Number(winner),
      loser_id: Number(loserId),
      target,
    }
    if (withScore) {
      payload.winner_score = Number(winnerScore)
      payload.loser_score = Number(loserScore)
    }

    try {
      await createMatch.mutateAsync(payload)
      setForm(EMPTY)
      setDone(true)
    } catch (err) {
      setError(err.message)
    }
  }

  if (!isLoading && players.length < 2) {
    return (
      <div>
        <Header />
        <div className="form-note">
          Necesitas al menos dos jugadores. <Link to="/jugadores" style={{ color: 'var(--tz-violet-600)', fontWeight: 600 }}>Crea jugadores</Link> primero.
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={submit}>
      <Header />

      <div className="stack-lg">
        <div className="toggle-row">
          <PlayerField label="Jugador A" value={playerA} players={players} exclude={playerB}
            onChange={(v) => set({ playerA: v, winner: '' })} />
          <PlayerField label="Jugador B" value={playerB} players={players} exclude={playerA}
            onChange={(v) => set({ playerB: v, winner: '' })} />
        </div>

        {bothPicked && (
          <div className="field">
            <span className="field__label">¿Quién ganó?</span>
            <div className="winner-pick">
              {[playerA, playerB].map((id) => (
                <button type="button" key={id}
                  className={`winner-opt${winner === id ? ' is-active' : ''}`}
                  onClick={() => set({ winner: id })}>
                  <div className="winner-opt__name">{nameOf(id)}</div>
                  <div className="winner-opt__tag">{winner === id ? 'Ganador' : 'Marcar'}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="field">
          <span className="field__label">Tipo de partido</span>
          <div className="toggle-row">
            {[11, 21].map((t) => (
              <button type="button" key={t}
                className={`toggle-opt${target === t ? ' is-active' : ''}`}
                onClick={() => set({ target: t, winnerScore: '', loserScore: '' })}>
                A {t} · {t === 11 ? '2' : '3'} pts
              </button>
            ))}
          </div>
        </div>

        <div className="field">
          <label className="toggle-opt" style={{ justifyContent: 'space-between', padding: '0 16px', cursor: 'pointer' }}>
            <span className="field__label" style={{ margin: 0 }}>Registrar marcador (opcional)</span>
            <input type="checkbox" checked={withScore}
              onChange={(e) => set({ withScore: e.target.checked, winnerScore: e.target.checked ? String(target) : '', loserScore: '' })} />
          </label>
          <span className="field__help">
            Si el perdedor supera {target === 11 ? '8' : '15'} puntos, suma 1 punto al ranking.
          </span>
        </div>

        {withScore && (
          <div className="toggle-row">
            <div className="field">
              <span className="field__label">Marcador ganador</span>
              <input className="input tnum" inputMode="numeric" value={winnerScore}
                onChange={(e) => set({ winnerScore: e.target.value.replace(/\D/g, '') })} />
            </div>
            <div className="field">
              <span className="field__label">Marcador perdedor</span>
              <input className="input tnum" inputMode="numeric" value={loserScore}
                onChange={(e) => set({ loserScore: e.target.value.replace(/\D/g, '') })} />
            </div>
          </div>
        )}

        <div className="form-note">
          Este partido otorga · Ganador <strong className="tnum">{preview.winner}</strong> pts
          {preview.loser > 0 && <> · Perdedor <strong className="tnum">{preview.loser}</strong> pt</>}
        </div>

        {error && <div className="form-error">{error}</div>}
        {done && <div className="form-note" style={{ color: 'var(--tz-success)' }}>Partido registrado.</div>}

        <button type="submit" className="btn btn--primary btn--block"
          disabled={!canSubmit || createMatch.isPending}>
          {createMatch.isPending ? 'Guardando' : 'Agregar Registro'}
        </button>
      </div>
    </form>
  )
}

function Header() {
  return (
    <header className="page-head">
      <p className="eyebrow">Registrar</p>
      <h1 className="page-title">Nuevo partido<span className="dot">.</span></h1>
      <p className="page-sub">Marca quién ganó. El resultado es opcional.</p>
    </header>
  )
}

function PlayerField({ label, value, players, exclude, onChange }) {
  return (
    <div className="field">
      <span className="field__label">{label}</span>
      <select className="select" value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">Elige…</option>
        {players
          .filter((p) => String(p.id) !== String(exclude))
          .map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
      </select>
    </div>
  )
}
