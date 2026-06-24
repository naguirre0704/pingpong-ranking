import React from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useDeleteMatch, useMatches, usePlayers } from '~/api/hooks'
import { usePin } from '~/auth/PinProvider'
import { EmptyState } from '~/components/EmptyState'
import { MatchCard } from '~/components/MatchCard'

export function HeadToHeadPage() {
  const { aId, bId } = useParams()
  const navigate = useNavigate()
  // all: true para poder revisar también a jugadores archivados con historial.
  const { data: players = [] } = usePlayers({ all: true })
  const { data: matches = [], isLoading } = useMatches({ playerA: aId, playerB: bId, limit: 200 })
  const { ensurePin } = usePin()
  const deleteMatch = useDeleteMatch()

  const nameOf = (id) =>
    players.find((p) => String(p.id) === String(id))?.name ||
    matches.find((m) => String(m.winner.id) === String(id))?.winner.name ||
    matches.find((m) => String(m.loser.id) === String(id))?.loser.name ||
    'Jugador'

  const winsA = matches.filter((m) => String(m.winner.id) === String(aId)).length
  const winsB = matches.filter((m) => String(m.winner.id) === String(bId)).length

  const go = (a, b) => navigate(`/historial/entre/${a}/${b}`, { replace: true })

  const remove = async (match) => {
    if (!(await ensurePin())) return
    if (!confirm('¿Borrar este partido? El ranking se recalcula.')) return
    await deleteMatch.mutateAsync(match.id)
  }

  return (
    <div>
      <header className="page-head">
        <Link to="/historial" className="back-link">
          <ArrowLeft size={16} /> Historial
        </Link>
        <h1 className="page-title">Mano a mano<span className="dot">.</span></h1>
        <p className="page-sub">Cambia cualquiera de los dos para ver otra pareja.</p>
      </header>

      <div className="h2h-pickers">
        <PlayerSelect label="Jugador" value={aId} players={players} exclude={bId}
          onChange={(v) => go(v, bId)} />
        <span className="h2h-pickers__vs">vs</span>
        <PlayerSelect label="Jugador" value={bId} players={players} exclude={aId}
          onChange={(v) => go(aId, v)} />
      </div>

      <div className="h2h-score card">
        <div className="h2h-score__side">
          <div className="h2h-score__num tnum">{winsA}</div>
          <div className="h2h-score__name">{nameOf(aId)}</div>
        </div>
        <div className="h2h-score__sep">–</div>
        <div className="h2h-score__side">
          <div className="h2h-score__num tnum">{winsB}</div>
          <div className="h2h-score__name">{nameOf(bId)}</div>
        </div>
      </div>
      <p className="h2h-total">
        {matches.length === 0
          ? 'Sin partidos entre estos dos.'
          : `${matches.length} ${matches.length === 1 ? 'partido' : 'partidos'} en total.`}
      </p>

      {isLoading && <div className="loading">Cargando partidos</div>}
      {!isLoading && matches.length === 0 && (
        <EmptyState line="Todavía no se enfrentan. Registra el primero." />
      )}

      <div className="stack">
        {matches.map((m) => (
          <MatchCard key={m.id} match={m} onDelete={remove} />
        ))}
      </div>
    </div>
  )
}

function PlayerSelect({ label, value, players, exclude, onChange }) {
  return (
    <div className="field">
      <span className="field__label">{label}</span>
      <select className="select" value={value || ''} onChange={(e) => onChange(e.target.value)}>
        {players
          .filter((p) => String(p.id) !== String(exclude))
          .map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
      </select>
    </div>
  )
}
