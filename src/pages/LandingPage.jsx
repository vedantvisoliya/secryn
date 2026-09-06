import { SiteHeader } from '@/components/layout/SiteHeader'
import { SiteFooter } from '@/components/layout/SiteFooter'
import { Hero } from '@/components/sections/Hero'
// Hidden until there are real customer logos to show.
// import { TrustedBy } from '@/components/sections/TrustedBy'
import { Problem } from '@/components/sections/Problem'
import { HowItWorks } from '@/components/sections/HowItWorks'
import { SecurityArchitecture } from '@/components/sections/SecurityArchitecture'
import { Features } from '@/components/sections/Features'
import { Lifecycle } from '@/components/sections/Lifecycle'
import { VaultWorkspace } from '@/components/sections/VaultWorkspace'
import { SecurityStats } from '@/components/sections/SecurityStats'
import { Faq } from '@/components/sections/Faq'
import { CallToAction } from '@/components/sections/CallToAction'

export default function LandingPage() {
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[60] focus:rounded-md focus:bg-ink-50 focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-ink-950"
      >
        Skip to content
      </a>

      <SiteHeader />

      <main id="main">
        <Hero />
        {/* <TrustedBy /> */}
        <Problem />
        <HowItWorks />
        <SecurityArchitecture />
        <Features />
        <Lifecycle />
        <VaultWorkspace />
        <SecurityStats />
        <Faq />
        <CallToAction />
      </main>

      <SiteFooter />
    </>
  )
}
