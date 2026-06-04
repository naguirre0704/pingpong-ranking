import React, { useMemo, useState } from 'react'
import { useRanking } from '~/api/hooks'
import { formatInt, formatPercent } from '~/lib/format'
import { EmptyState } from '~/components/EmptyState'
import { Pill } from '~/components/Pill'

const MIN_GAMES = 3

export function RankingPage() {
  const { data: ranking, isLoading, isError } = useRanking()
  const [view, setView] = useState('points') // 'points' | 'winrate'

  const rows = useMemo(() => {
    if (!ranking) return []
    if (view === 'points') return ranking
    return [...ranking]
      .sort(
        (a, b) =>
          b.win_rate - a.win_rate ||
          b.played - a.played ||
          a.player.name.localeCompare(b.player.name),
      )
      .map((r, i) => ({ ...r, position: i + 1 }))
  }, [ranking, view])

  return (
    <div>
      <header className="page-head">
        <p className="eyebrow">Ranking</p>
        <h1 className="page-title">
          Tabla de posiciones<span className="dot">.</span>
        </h1>
        <p className="page-sub">Quién lidera la oficina. Suma puntos ganando partidos.</p>
      </header>

      <div className="segmented" role="tablist" style={{ marginBottom: 'var(--tz-space-5)' }}>
        <button
          className={`segmented__btn${view === 'points' ? ' is-active' : ''}`}
          onClick={() => setView('points')}
        >
          Puntos
        </button>
        <button
          className={`segmented__btn${view === 'winrate' ? ' is-active' : ''}`}
          onClick={() => setView('winrate')}
        >
          % Victorias
        </button>
      </div>

      {isLoading && <div className="loading">Cargando ranking</div>}
      {isError && <div className="form-error">No se pudo cargar el ranking. Reintenta.</div>}

      {!isLoading && !isError && rows.length === 0 && (
        <EmptyState line="Aún no hay jugadores ni partidos." />
      )}

      <div className="stack">
        {rows.map((row) => (
          <RankRow key={row.player.id} row={row} view={view} />
        ))}
      </div>
    </div>
  )
}

function RankRow({ row, view }) {
  const leader = row.position === 1 && row.played > 0
  const fewGames = view === 'winrate' && row.played < MIN_GAMES

  return (
    <div className={`rank-row${leader ? ' rank-row--leader' : ''}`}>
      <span className="rank-pos tnum">{row.position}</span>
      <div className="rank-main">
        <div className="rank-name">{row.player.name}</div>
        <div className="rank-meta">
          <span className="tnum">{formatInt(row.played)} PJ</span>
          <span>·</span>
          <span className="tnum">{formatInt(row.wins)} G</span>
          {fewGames && <Pill variant="warning">Pocos partidos</Pill>}
        </div>
      </div>
      <div className="rank-metric">
        <div className="rank-metric__value tnum">
          {view === 'points' ? formatInt(row.points) : formatPercent(row.win_rate)}
        </div>
        <div className="rank-metric__label">{view === 'points' ? 'Puntos' : 'Victorias'}</div>
      </div>
    </div>
  )
}
