import React from 'react'

export function RulesPage() {
  return (
    <div>
      <header className="page-head">
        <p className="eyebrow">Reglas</p>
        <h1 className="page-title">Cómo se puntúa<span className="dot">.</span></h1>
        <p className="page-sub">La definición oficial de puntajes del torneo de oficina.</p>
      </header>

      <p className="section-label">Puntos por partido ganado</p>
      <div className="card" style={{ padding: 'var(--tz-space-2) var(--tz-space-4)' }}>
        <table className="points-table">
          <thead>
            <tr><th>Tipo de partido</th><th style={{ textAlign: 'right' }}>Puntos al ganador</th></tr>
          </thead>
          <tbody>
            <tr><td>Partido a 11</td><td className="num">2</td></tr>
            <tr><td>Partido a 21</td><td className="num">3</td></tr>
          </tbody>
        </table>
      </div>

      <p className="section-label">Punto de consuelo al perdedor</p>
      <div className="card" style={{ padding: 'var(--tz-space-2) var(--tz-space-4)' }}>
        <table className="points-table">
          <thead>
            <tr><th>Si el perdedor anota…</th><th style={{ textAlign: 'right' }}>Suma</th></tr>
          </thead>
          <tbody>
            <tr><td>En partido a 11: más de 8 (9 o más)</td><td className="num">1</td></tr>
            <tr><td>En partido a 21: más de 15 (16 o más)</td><td className="num">1</td></tr>
          </tbody>
        </table>
      </div>
      <p className="form-note" style={{ marginTop: 'var(--tz-space-3)' }}>
        El punto de consuelo solo aplica si registras el marcador. En deuce cuenta el marcador real (ej. 32–30 también suma).
      </p>

      <p className="section-label">Cómo se juega</p>
      <ul className="stack" style={{ fontSize: 'var(--tz-text-md)', color: 'var(--tz-fg-3)' }}>
        <li>Partidos 1 contra 1. Marcas quién ganó; el otro pierde.</li>
        <li>El partido es hasta 11 o hasta 21, según se elija al registrar.</li>
        <li>En deuce, el ganador debe ganar por 2.</li>
        <li>El resultado es opcional, pero registrarlo habilita el punto de consuelo.</li>
      </ul>

      <p className="section-label">Ranking</p>
      <ul className="stack" style={{ fontSize: 'var(--tz-text-md)', color: 'var(--tz-fg-3)' }}>
        <li><strong>Puntos:</strong> suma de todos los puntos acumulados.</li>
        <li><strong>% Victorias:</strong> partidos ganados sobre partidos jugados.</li>
      </ul>

      <p className="section-label">Por definir</p>
      <p className="rule-tbd">
        Desempates, temporadas y reglas especiales aún no se definen. Esta sección se
        completará cuando el equipo cierre las reglas finales.
      </p>

      <div style={{ height: 'var(--tz-space-8)' }} />
    </div>
  )
}
