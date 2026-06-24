import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from './client'

const keys = {
  ranking: ['ranking'],
  players: (all) => ['players', { all: !!all }],
  matches: (params) => ['matches', params],
}

// ---- Queries ----
export function useRanking() {
  return useQuery({
    queryKey: keys.ranking,
    queryFn: () => api('/ranking').then((d) => d.ranking),
  })
}

export function usePlayers({ all = false } = {}) {
  return useQuery({
    queryKey: keys.players(all),
    queryFn: () => api(`/players${all ? '?all=1' : ''}`).then((d) => d.players),
  })
}

export function useMatches({ limit = 100, playerA, playerB } = {}) {
  const params = new URLSearchParams({ limit })
  // Solo filtramos por pareja cuando tenemos a los dos jugadores.
  const h2h = playerA != null && playerB != null
  if (h2h) {
    params.set('player_a', playerA)
    params.set('player_b', playerB)
  }
  return useQuery({
    queryKey: keys.matches({ limit, playerA: h2h ? String(playerA) : null, playerB: h2h ? String(playerB) : null }),
    queryFn: () => api(`/matches?${params.toString()}`).then((d) => d.matches),
  })
}

// ---- Mutations ----
function useInvalidateAll() {
  const qc = useQueryClient()
  return () => {
    qc.invalidateQueries({ queryKey: ['ranking'] })
    qc.invalidateQueries({ queryKey: ['players'] })
    qc.invalidateQueries({ queryKey: ['matches'] })
  }
}

export function useCreatePlayer() {
  const invalidate = useInvalidateAll()
  return useMutation({
    mutationFn: (player) => api('/players', { method: 'POST', body: { player } }),
    onSuccess: invalidate,
  })
}

export function useUpdatePlayer() {
  const invalidate = useInvalidateAll()
  return useMutation({
    mutationFn: ({ id, ...player }) => api(`/players/${id}`, { method: 'PATCH', body: { player } }),
    onSuccess: invalidate,
  })
}

export function useDeletePlayer() {
  const invalidate = useInvalidateAll()
  return useMutation({
    mutationFn: (id) => api(`/players/${id}`, { method: 'DELETE' }),
    onSuccess: invalidate,
  })
}

export function useCreateMatch() {
  const invalidate = useInvalidateAll()
  return useMutation({
    mutationFn: (match) => api('/matches', { method: 'POST', body: { match } }),
    onSuccess: invalidate,
  })
}

export function useDeleteMatch() {
  const invalidate = useInvalidateAll()
  return useMutation({
    mutationFn: (id) => api(`/matches/${id}`, { method: 'DELETE' }),
    onSuccess: invalidate,
  })
}
