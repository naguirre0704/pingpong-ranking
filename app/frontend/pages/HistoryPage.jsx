import React from 'react'
import { Trash2 } from 'lucide-react'
import { useDeleteMatch, useMatches } from '~/api/hooks'
import { usePin } from '~/auth/PinProvider'
import { formatDate } from '~/lib/format'
import { EmptyState } from '~/components/EmptyState'
import { Pill } from '~/components/Pill'

export function HistoryPage() {
  const { data: matches = [], isLoading } = useMatches({ limit: 100 })
  const { ensurePin } = usePin()
  const deleteMatch = useDeleteMatch()

  const remove = async (match) => {
    if (!(await ensurePin())) return
    if (!confirm('¿Borrar este partido? El ranking se recalcula.')) return
    await deleteMatch.mutateAsync(match.id)
  }

  return (
    <div>
      <header className="page-head">
        <p className="eyebrow">Historial</p>
        <h1 className="page-title">Partidos<span className="dot">.</span></h1>
        <p className="page-sub">Los registros más recientes primero.</p>
      </header>

      {isLoading && <div className="loading">Cargando partidos</div>}
      {!isLoading && matches.length === 0 && <EmptyState line="Aún no hay partidos registrados." />}

      <div className="stack">
        {matches.map((m) => (
          <div className="card match-card" key={m.id}>
            <div className="match-card__top">
              <div className="match-card__names">
                {m.winner.name}
                <span className="match-card__vs">vs</span>
                <span className="loser">{m.loser.name}</span>
              </div>
              <Pill variant="violet">A {m.target}</Pill>
            </div>
            <div className="match-card__sub">
              {m.result_recorded && (
                <span className="match-card__score">{m.winner_score}–{m.loser_score}</span>
              )}
              <span className="tnum">
                +{m.winner_points}
                {m.loser_points > 0 && ` / +${m.loser_points}`} pts
              </span>
              <span>·</span>
              <span>{formatDate(m.played_at)}</span>
              <span style={{ marginLeft: 'auto' }}>
                <button className="icon-btn" aria-label="Borrar" onClick={() => remove(m)}>
                  <Trash2 />
                </button>
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
