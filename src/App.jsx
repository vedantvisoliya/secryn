import { TooltipProvider } from "@/components/ui/tooltip"
import LandingPage from "@/pages/LandingPage"

export default function App() {
  return (
    <TooltipProvider delayDuration={200} skipDelayDuration={400}>
      <LandingPage />
    </TooltipProvider>
  )
}
