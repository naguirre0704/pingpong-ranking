import React from 'react'

// One-word status pill, functional color, no decorative icons (Tazki §8).
export function Pill({ children, variant = 'neutral' }) {
  return <span className={`pill pill--${variant}`}>{children}</span>
}
