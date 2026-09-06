import { FAQ } from '@/lib/content'
import { Section } from '@/components/shared/Section'
import { Reveal } from '@/components/shared/Reveal'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

export function Faq() {
  return (
    <Section id="faq" index={FAQ.index} label={FAQ.label} heading={FAQ.heading}>
      <Reveal>
        <Accordion type="single" collapsible className="border-t border-border">
          {FAQ.items.map((item) => (
            <AccordionItem
              key={item.id}
              value={item.id}
              className="border-b border-border"
            >
              <AccordionTrigger className="group gap-6 py-6 text-left text-h3 text-ink-200 hover:text-ink-50 hover:no-underline data-[state=open]:text-ink-50 [&>svg]:size-4 [&>svg]:text-ink-500">
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="pb-7">
                <p className="max-w-[68ch] text-[0.9375rem] leading-relaxed text-ink-400">
                  {item.a}
                </p>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Reveal>
    </Section>
  )
}
