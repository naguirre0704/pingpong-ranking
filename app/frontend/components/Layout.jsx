import React from 'react'
import { Outlet } from 'react-router-dom'
import { BottomNav } from './BottomNav'
import { SeasonBanner } from './SeasonBanner'
import logoUrl from '~/images/tazki-logo.png'

export function Layout() {
  return (
    <div className="app">
      <header className="appbar">
        <img className="appbar__logo" src={logoUrl} alt="Tazki" />
        <span className="appbar__divider" />
        <span className="appbar__app">Pingpong</span>
        <span className="appbar__spacer" />
      </header>

      <main className="app__main">
        <SeasonBanner />
        <Outlet />
      </main>

      <BottomNav />
    </div>
  )
}
