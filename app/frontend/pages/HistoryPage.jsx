import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useDeleteMatch, useMatches } from '~/api/hooks'
import { usePin } from '~/auth/PinProvider'
import { EmptyState } from '~/components/EmptyState'
import { MatchCard } from '~/components/MatchCard'

export function HistoryPage() {
  const { data: matches = [], isLoading } = useMatches({ limit: 100 })
  const { ensurePin } = usePin()
  const deleteMatch = useDeleteMatch()
  const navigate = useNavigate()

  const remove = async (match) => {
    if (!(await ensurePin())) return
    if (!confirm('¿Borrar este partido? El ranking se recalcula.')) return
    await deleteMatch.mutateAsync(match.id)
  }

  const openHeadToHead = (m) => navigate(`/historial/entre/${m.winner.id}/${m.loser.id}`)

  return (
    <div>
      <header className="page-head">
        <p className="eyebrow">Historial</p>
        <h1 className="page-title">Partidos<span className="dot">.</span></h1>
        <p className="page-sub">Toca un partido para ver el historial entre esos dos.</p>
      </header>

      {isLoading && <div className="loading">Cargando partidos</div>}
      {!isLoading && matches.length === 0 && <EmptyState line="Aún no hay partidos registrados." />}

      <div className="stack">
        {matches.map((m) => (
          <MatchCard key={m.id} match={m} onOpen={openHeadToHead} onDelete={remove} />
        ))}
      </div>
    </div>
  )
}
