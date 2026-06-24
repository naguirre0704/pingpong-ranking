import React from 'react'
import { Trash2 } from 'lucide-react'
import { formatDate } from '~/lib/format'
import { Pill } from '~/components/Pill'

// Tarjeta de un partido. Opcionalmente clickeable (abre el H2H) y/o borrable.
export function MatchCard({ match: m, onOpen, onDelete }) {
  const clickable = typeof onOpen === 'function'

  return (
    <div
      className={`card match-card${clickable ? ' is-clickable' : ''}`}
      onClick={clickable ? () => onOpen(m) : undefined}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      onKeyDown={
        clickable
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onOpen(m)
              }
            }
          : undefined
      }
    >
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
        {onDelete && (
          <span style={{ marginLeft: 'auto' }}>
            <button
              className="icon-btn"
              aria-label="Borrar"
              onClick={(e) => {
                e.stopPropagation()
                onDelete(m)
              }}
            >
              <Trash2 />
            </button>
          </span>
        )}
      </div>
    </div>
  )
}
