import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { PinProvider } from '~/auth/PinProvider'
import { Layout } from '~/components/Layout'
import { RankingPage } from '~/pages/RankingPage'
import { NewMatchPage } from '~/pages/NewMatchPage'
import { PlayersPage } from '~/pages/PlayersPage'
import { HistoryPage } from '~/pages/HistoryPage'
import { RulesPage } from '~/pages/RulesPage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { refetchOnWindowFocus: false, staleTime: 15_000, retry: 1 },
  },
})

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <PinProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<RankingPage />} />
              <Route path="registrar" element={<NewMatchPage />} />
              <Route path="jugadores" element={<PlayersPage />} />
              <Route path="historial" element={<HistoryPage />} />
              <Route path="reglas" element={<RulesPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </PinProvider>
    </QueryClientProvider>
  )
}
