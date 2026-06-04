import React from 'react'

// Honest empty state per Tazki §7: factual one-liner, no emoji.
// The dashed frame is a placeholder for the octopus mascot asset
// (brand forbids inventing the mascot SVG — drop the real asset here later).
export function EmptyState({ line, children }) {
  return (
    <div className="empty">
      <div className="empty__mascot" aria-hidden="true">pulpo.svg</div>
      <p className="empty__line">{line}</p>
      {children}
    </div>
  )
}
