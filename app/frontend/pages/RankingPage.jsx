import React, { useMemo, useState } from 'react'
import { useRanking } from '~/api/hooks'
import { formatInt, formatPercent } from '~/lib/format'
import { EmptyState } from '~/components/EmptyState'
import { Pill } from '~/components/Pill'

const MIN_GAMES = 3

export function RankingPage() {
  const { data: ranking, isLoading, isError } = useRanking()
  const [view, setView] = useState('points') // 'points' | 'winrate' | 'teams'

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

  // Team standings: sum each member's points (skip players without a team).
  const teamRows = useMemo(() => {
    if (!ranking) return []
    const byTeam = new Map()
    for (const r of ranking) {
      const team = r.player.team
      if (!team) continue
      const acc = byTeam.get(team) || { team, points: 0, wins: 0, played: 0, players: 0 }
      acc.points += r.points
      acc.wins += r.wins
      acc.played += r.played
      acc.players += 1
      byTeam.set(team, acc)
    }
    return [...byTeam.values()]
      .sort((a, b) => b.points - a.points || b.wins - a.wins || a.team.localeCompare(b.team))
      .map((t, i) => ({ ...t, position: i + 1 }))
  }, [ranking])

  const isTeams = view === 'teams'

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
        <button
          className={`segmented__btn${isTeams ? ' is-active' : ''}`}
          onClick={() => setView('teams')}
        >
          Equipos
        </button>
      </div>

      {isLoading && <div className="loading">Cargando ranking</div>}
      {isError && <div className="form-error">No se pudo cargar el ranking. Reintenta.</div>}

      {!isLoading && !isError && isTeams && teamRows.length === 0 && (
        <EmptyState line="Aún no hay equipos con jugadores." />
      )}
      {!isLoading && !isError && !isTeams && rows.length === 0 && (
        <EmptyState line="Aún no hay jugadores ni partidos." />
      )}

      <div className="stack">
        {isTeams
          ? teamRows.map((row) => <TeamRow key={row.team} row={row} />)
          : rows.map((row) => <RankRow key={row.player.id} row={row} view={view} />)}
      </div>
    </div>
  )
}

function TeamRow({ row }) {
  const leader = row.position === 1 && row.played > 0

  return (
    <div className={`rank-row${leader ? ' rank-row--leader' : ''}`}>
      <span className="rank-pos tnum">{row.position}</span>
      <div className="rank-main">
        <div className="rank-name">{row.team}</div>
        <div className="rank-meta">
          <span className="tnum">{formatInt(row.players)} jugadores</span>
          <span>·</span>
          <span className="tnum">{formatInt(row.played)} PJ</span>
          <span>·</span>
          <span className="tnum">{formatInt(row.wins)} G</span>
        </div>
      </div>
      <div className="rank-metric">
        <div className="rank-metric__value tnum">{formatInt(row.points)}</div>
        <div className="rank-metric__label">Puntos</div>
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
