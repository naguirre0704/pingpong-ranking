// Mirror of the server-side MatchScoring rules, used only for a live preview
// while registering a match. The server remains the source of truth.
const BASE = { 11: 2, 21: 3 }
const THRESHOLD = { 11: 8, 21: 15 }

export function previewPoints({ target, loserScore }) {
  const winner = BASE[target] ?? 0
  const hasScore = loserScore !== null && loserScore !== undefined && loserScore !== ''
  const loser = hasScore && Number(loserScore) > THRESHOLD[target] ? 1 : 0
  return { winner, loser }
}
