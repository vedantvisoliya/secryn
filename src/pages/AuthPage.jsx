import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'

import { STAGE, useAuth } from '@/hooks/auth-context'
import { Logo } from '@/components/shared/Logo'
import { SignInStep } from '@/components/auth/SignInStep'
import { EnrollStep } from '@/components/auth/EnrollStep'
import { VerifyStep } from '@/components/auth/VerifyStep'

function BootScreen() {
  return (
    <div className="grid min-h-dvh place-items-center">
      <div className="flex flex-col items-center gap-4">
        <Logo showWordmark={false} markClassName="size-7" />
        <p className="flex items-center gap-2 label-mono text-ink-500">
          <Loader2 aria-hidden="true" className="size-3.5 animate-spin" />
          restoring session
        </p>
      </div>
    </div>
  )
}

/**
 * One route drives the whole sequence. Which screen shows is derived from the
 * auth stage, so a reload mid-enrollment lands the user back where they were
 * instead of at the start.
 */
export default function AuthPage() {
  const { stage } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (stage === STAGE.AUTHENTICATED) navigate('/app', { replace: true })
  }, [stage, navigate])

  if (stage === STAGE.BOOTING || stage === STAGE.AUTHENTICATED) return <BootScreen />
  if (stage === STAGE.ENROLL) return <EnrollStep />
  if (stage === STAGE.VERIFY) return <VerifyStep />
  return <SignInStep />
}
