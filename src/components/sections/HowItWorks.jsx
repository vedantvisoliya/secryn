import { HOW_IT_WORKS } from '@/lib/content'
import { Section } from '@/components/shared/Section'
import { Reveal } from '@/components/shared/Reveal'
import { StepVisual } from '@/components/sections/StepVisuals'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export function HowItWorks() {
  return (
    <Section
      id="how"
      index={HOW_IT_WORKS.index}
      label={HOW_IT_WORKS.label}
      heading={HOW_IT_WORKS.heading}
      body={HOW_IT_WORKS.body}
    >
      <Reveal>
        <Tabs
          defaultValue={HOW_IT_WORKS.steps[0].id}
          orientation="vertical"
          className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12 lg:gap-12"
        >
          <TabsList
            variant="line"
            className="h-auto w-full flex-col gap-0 rounded-none border-y border-border p-0 lg:col-span-5"
          >
            {HOW_IT_WORKS.steps.map((step) => (
              <TabsTrigger
                key={step.id}
                value={step.id}
                className="group/step relative h-auto w-full flex-none flex-col items-start gap-1.5 rounded-none border-0 border-border px-4 py-5 text-left whitespace-normal not-first:border-t after:hidden data-[state=active]:bg-ink-900/60 sm:px-5"
              >
                {/* Active marker replaces the default underline. */}
                <span
                  aria-hidden="true"
                  className="absolute inset-y-0 left-0 w-0.5 bg-signal opacity-0 transition-opacity group-data-[state=active]/step:opacity-100"
                />
                <span className="flex items-center gap-3">
                  <span className="label-mono text-ink-500 tabular group-data-[state=active]/step:text-signal">
                    {step.step}
                  </span>
                  <span className="text-h3 text-ink-300 group-data-[state=active]/step:text-ink-50">
                    {step.title}
                  </span>
                </span>
                <span className="text-sm leading-relaxed font-normal text-ink-500 group-data-[state=active]/step:text-ink-300">
                  {step.summary}
                </span>
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="lg:col-span-7">
            {HOW_IT_WORKS.steps.map((step) => (
              <TabsContent
                key={step.id}
                value={step.id}
                className="mt-0 focus-visible:outline-none data-[state=active]:animate-in data-[state=active]:fade-in-0 data-[state=active]:duration-300"
              >
                <p className="max-w-[62ch] text-[0.9375rem] leading-relaxed text-ink-300">
                  {step.detail}
                </p>
                <div className="mt-6">
                  <StepVisual name={step.visual} />
                </div>
              </TabsContent>
            ))}
          </div>
        </Tabs>
      </Reveal>
    </Section>
  )
}
