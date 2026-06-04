import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from './client'

const keys = {
  ranking: ['ranking'],
  players: (all) => ['players', { all: !!all }],
  matches: (limit) => ['matches', { limit }],
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

export function useMatches({ limit = 100 } = {}) {
  return useQuery({
    queryKey: keys.matches(limit),
    queryFn: () => api(`/matches?limit=${limit}`).then((d) => d.matches),
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
