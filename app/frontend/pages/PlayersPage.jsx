import React, { useState } from 'react'
import { Pencil, Archive, Plus } from 'lucide-react'
import { useCreatePlayer, useDeletePlayer, usePlayers, useUpdatePlayer } from '~/api/hooks'
import { usePin } from '~/auth/PinProvider'
import { HAND_LABEL } from '~/lib/format'
import { EmptyState } from '~/components/EmptyState'

const HANDS = [
  { value: 'right', label: 'Diestro' },
  { value: 'left', label: 'Zurdo' },
  { value: 'ambidextrous', label: 'Ambidiestro' },
]

export function PlayersPage() {
  const { data: players = [], isLoading } = usePlayers()
  const { ensurePin } = usePin()
  const createPlayer = useCreatePlayer()
  const updatePlayer = useUpdatePlayer()
  const deletePlayer = useDeletePlayer()

  const [editing, setEditing] = useState(null) // null | {} (new) | player (edit)

  const openNew = async () => {
    if (!(await ensurePin())) return
    setEditing({ name: '', age: '', dominant_hand: 'right' })
  }

  const openEdit = async (player) => {
    if (!(await ensurePin())) return
    setEditing(player)
  }

  const archive = async (player) => {
    if (!(await ensurePin())) return
    if (!confirm(`¿Archivar a ${player.name}? Su historial se conserva.`)) return
    await deletePlayer.mutateAsync(player.id)
  }

  const save = async (values) => {
    if (editing?.id) {
      await updatePlayer.mutateAsync({ id: editing.id, ...values })
    } else {
      await createPlayer.mutateAsync(values)
    }
    setEditing(null)
  }

  return (
    <div>
      <header className="page-head">
        <p className="eyebrow">Jugadores</p>
        <h1 className="page-title">Quiénes juegan<span className="dot">.</span></h1>
        <p className="page-sub">Crea y administra a los jugadores de la oficina.</p>
      </header>

      <button className="btn btn--primary btn--block" onClick={openNew} style={{ marginBottom: 'var(--tz-space-5)' }}>
        <Plus size={18} /> Agregar Jugador
      </button>

      {isLoading && <div className="loading">Cargando jugadores</div>}
      {!isLoading && players.length === 0 && <EmptyState line="Aún no hay jugadores." />}

      <div className="stack">
        {players.map((p) => (
          <div className="player-row" key={p.id}>
            <div className="player-row__info">
              <div className="player-row__name">{p.name}</div>
              <div className="player-row__meta tnum">
                {p.age} años · {HAND_LABEL[p.dominant_hand]}
              </div>
            </div>
            <button className="icon-btn" aria-label="Editar" onClick={() => openEdit(p)}>
              <Pencil />
            </button>
            <button className="icon-btn" aria-label="Archivar" onClick={() => archive(p)}>
              <Archive />
            </button>
          </div>
        ))}
      </div>

      {editing && (
        <PlayerForm
          initial={editing}
          busy={createPlayer.isPending || updatePlayer.isPending}
          onCancel={() => setEditing(null)}
          onSave={save}
        />
      )}
    </div>
  )
}

function PlayerForm({ initial, onSave, onCancel, busy }) {
  const [name, setName] = useState(initial.name || '')
  const [age, setAge] = useState(initial.age || '')
  const [hand, setHand] = useState(initial.dominant_hand || 'right')
  const [error, setError] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await onSave({ name: name.trim(), age: Number(age), dominant_hand: hand })
    } catch (err) {
      setError(err.message)
    }
  }

  const valid = name.trim() && age

  return (
    <div className="sheet" role="dialog" aria-modal="true">
      <div className="sheet__backdrop" onClick={onCancel} />
      <form className="sheet__panel stack" onSubmit={submit}>
        <h2 className="sheet__title">{initial.id ? 'Editar jugador' : 'Nuevo jugador'}</h2>

        <div className="field">
          <span className="field__label">Nombre</span>
          <input className="input" value={name} autoFocus onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="field">
          <span className="field__label">Edad</span>
          <input className="input tnum" inputMode="numeric" value={age}
            onChange={(e) => setAge(e.target.value.replace(/\D/g, ''))} />
        </div>
        <div className="field">
          <span className="field__label">Mano hábil</span>
          <div className="toggle-row" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
            {HANDS.map((h) => (
              <button type="button" key={h.value}
                className={`toggle-opt${hand === h.value ? ' is-active' : ''}`}
                onClick={() => setHand(h.value)} style={{ fontSize: 'var(--tz-text-sm)' }}>
                {h.label}
              </button>
            ))}
          </div>
        </div>

        {error && <div className="form-error">{error}</div>}

        <div className="sheet__actions">
          <button type="button" className="btn btn--ghost" onClick={onCancel}>Cancelar</button>
          <button type="submit" className="btn btn--primary" disabled={!valid || busy}>
            {busy ? 'Guardando' : 'Guardar'}
          </button>
        </div>
      </form>
    </div>
  )
}
