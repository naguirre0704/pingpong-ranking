import React from 'react'
import { NavLink } from 'react-router-dom'
import { Trophy, PlusCircle, Users, History, BookOpen } from 'lucide-react'

const ITEMS = [
  { to: '/', label: 'Ranking', icon: Trophy, end: true },
  { to: '/registrar', label: 'Registrar', icon: PlusCircle },
  { to: '/jugadores', label: 'Jugadores', icon: Users },
  { to: '/historial', label: 'Historial', icon: History },
  { to: '/reglas', label: 'Reglas', icon: BookOpen },
]

export function BottomNav() {
  return (
    <nav className="bottomnav">
      {ITEMS.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) => `bottomnav__item${isActive ? ' is-active' : ''}`}
        >
          <Icon />
          {label}
        </NavLink>
      ))}
    </nav>
  )
}
