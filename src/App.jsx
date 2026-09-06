import { Suspense, lazy } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import { AuthProvider } from '@/hooks/useAuth'
import { STAGE, useAuth } from '@/hooks/auth-context'
import { TooltipProvider } from '@/components/ui/tooltip'
import LandingPage from '@/pages/LandingPage'

// Firebase and the QR encoder only matter once someone signs in — keep them
// out of the marketing bundle.
const AuthPage = lazy(() => import('@/pages/AuthPage'))
const AppPage = lazy(() => import('@/pages/AppPage'))

function RouteFallback() {
  return <div className="min-h-dvh bg-background" aria-busy="true" />
}

function RequireAuth({ children }) {
  const { stage } = useAuth()
  if (stage === STAGE.BOOTING) return <RouteFallback />
  if (stage !== STAGE.AUTHENTICATED) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <TooltipProvider delayDuration={200} skipDelayDuration={400}>
          <Suspense fallback={<RouteFallback />}>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<AuthPage />} />
              <Route
                path="/app"
                element={
                  <RequireAuth>
                    <AppPage />
                  </RequireAuth>
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </TooltipProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
