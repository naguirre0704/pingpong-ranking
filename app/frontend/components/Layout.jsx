import React from 'react'
import { Outlet } from 'react-router-dom'
import { BottomNav } from './BottomNav'

export function Layout() {
  return (
    <div className="app">
      <header className="appbar">
        <span className="appbar__mark">T</span>
        <span className="appbar__title">Pingpong</span>
        <span className="appbar__spacer" />
        <span className="eyebrow" style={{ color: 'rgba(255,255,255,.55)' }}>OFICINA</span>
      </header>

      <main className="app__main">
        <Outlet />
      </main>

      <BottomNav />
    </div>
  )
}
