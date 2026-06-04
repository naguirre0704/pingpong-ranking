import React, { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useCreateMatch, usePlayers } from '~/api/hooks'
import { usePin } from '~/auth/PinProvider'
import { previewPoints } from '~/lib/scoring'

const EMPTY = {
  playerA: '',
  playerB: '',
  scoreA: '',
  scoreB: '',
  target: 11,
  targetTouched: false,
  noScore: false,
  winner: '', // only used in "sin marcador" mode
}

// A game to 21 can only end with the winner at 21+. So any top score below 21
// is necessarily a game to 11 (incl. long deuces up to 20-18). 21+ -> likely a 21.
const detectTarget = (maxScore) => (maxScore >= 21 ? 21 : 11)

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

  const { playerA, playerB, scoreA, scoreB, targetTouched, noScore, winner } = form
  const bothPicked = playerA && playerB && playerA !== playerB
  const nameOf = (id) => players.find((p) => String(p.id) === String(id))?.name || ''

  // ---- Result-first inference ----
  const scoresFilled = scoreA !== '' && scoreB !== ''
  const a = Number(scoreA)
  const b = Number(scoreB)
  const tie = scoresFilled && a === b
  const winnerByScore = scoresFilled && !tie ? (a > b ? playerA : playerB) : ''
  const maxScore = Math.max(a || 0, b || 0)

  // Effective match type: auto from the score until the user overrides it.
  const target = targetTouched ? form.target : scoresFilled ? detectTarget(maxScore) : form.target
  const targetAuto = !targetTouched && scoresFilled

  const preview = useMemo(() => {
    const loserScore = noScore || !scoresFilled ? null : Math.min(a, b)
    return previewPoints({ target, loserScore })
  }, [target, noScore, scoresFilled, a, b])

  const canSubmit = noScore
    ? bothPicked && !!winner
    : bothPicked && scoresFilled && !tie

  const submit = async (e) => {
    e.preventDefault()
    if (!canSubmit) return
    const pin = await ensurePin()
    if (!pin) return

    let payload
    if (noScore) {
      const loserId = winner === playerA ? playerB : playerA
      payload = { winner_id: Number(winner), loser_id: Number(loserId), target }
    } else {
      const winnerId = winnerByScore
      const loserId = winnerId === playerA ? playerB : playerA
      payload = {
        winner_id: Number(winnerId),
        loser_id: Number(loserId),
        target,
        winner_score: Math.max(a, b),
        loser_score: Math.min(a, b),
      }
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
          Necesitas al menos dos jugadores.{' '}
          <Link to="/jugadores" style={{ color: 'var(--tz-violet-600)', fontWeight: 600 }}>
            Crea jugadores
          </Link>{' '}
          primero.
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={submit}>
      <Header />

      <div className="stack-lg">
        {/* 1 · Jugadores */}
        <div className="toggle-row">
          <PlayerField label="Jugador A" value={playerA} players={players} exclude={playerB}
            onChange={(v) => set({ playerA: v, winner: '' })} />
          <PlayerField label="Jugador B" value={playerB} players={players} exclude={playerA}
            onChange={(v) => set({ playerB: v, winner: '' })} />
        </div>

        {bothPicked && !noScore && (
          <>
            {/* 2 · Resultado (deduce ganador) */}
            <div className="field">
              <span className="field__label">Resultado</span>
              <div className="toggle-row">
                <ScoreField name={nameOf(playerA)} value={scoreA} leading={winnerByScore === playerA}
                  onChange={(v) => set({ scoreA: v })} />
                <ScoreField name={nameOf(playerB)} value={scoreB} leading={winnerByScore === playerB}
                  onChange={(v) => set({ scoreB: v })} />
              </div>
              {tie && <span className="form-error">No puede haber empate. Un jugador gana.</span>}
              {!tie && winnerByScore && (
                <span className="field__help">Gana {nameOf(winnerByScore)}.</span>
              )}
            </div>

            {/* 3 · Tipo de partido (auto, editable) */}
            <div className="field">
              <span className="field__label">Tipo de partido</span>
              <div className="toggle-row">
                {[11, 21].map((t) => (
                  <button type="button" key={t}
                    className={`toggle-opt${target === t ? ' is-active' : ''}`}
                    onClick={() => set({ target: t, targetTouched: true })}>
                    A {t} · {t === 11 ? '2' : '3'} pts
                  </button>
                ))}
              </div>
              {targetAuto && (
                <span className="field__help">Detectado por el marcador. Puedes cambiarlo.</span>
              )}
            </div>
          </>
        )}

        {/* Modo sin marcador */}
        {bothPicked && noScore && (
          <>
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
            <div className="field">
              <span className="field__label">Tipo de partido</span>
              <div className="toggle-row">
                {[11, 21].map((t) => (
                  <button type="button" key={t}
                    className={`toggle-opt${target === t ? ' is-active' : ''}`}
                    onClick={() => set({ target: t, targetTouched: true })}>
                    A {t} · {t === 11 ? '2' : '3'} pts
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {bothPicked && (
          <>
            <div className="form-note">
              Otorga · Ganador <strong className="tnum">{preview.winner}</strong> pts
              {preview.loser > 0 && (
                <> · Perdedor <strong className="tnum">{preview.loser}</strong> pt</>
              )}
            </div>

            <button type="button" className="btn btn--ghost" style={{ width: '100%' }}
              onClick={() => set({ noScore: !noScore, winner: '', scoreA: '', scoreB: '' })}>
              {noScore ? 'Agregar marcador' : 'Registrar sin marcador'}
            </button>
          </>
        )}

        {error && <div className="form-error">{error}</div>}
        {done && (
          <div className="form-note" style={{ color: 'var(--tz-success)' }}>Partido registrado.</div>
        )}

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
      <p className="page-sub">Elige a los dos jugadores y anota el marcador.</p>
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

function ScoreField({ name, value, leading, onChange }) {
  return (
    <div className="field">
      <span className="field__label" style={{ color: leading ? 'var(--tz-success)' : undefined }}>
        {name}
      </span>
      <input
        className={`input tnum${leading ? ' input--leading' : ''}`}
        inputMode="numeric"
        placeholder="0"
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, ''))}
        style={{ textAlign: 'center', fontSize: 'var(--tz-text-xl)', fontWeight: 700 }}
      />
    </div>
  )
}
