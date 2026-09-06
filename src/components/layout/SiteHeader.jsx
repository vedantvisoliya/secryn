import { useEffect, useState } from 'react'
import { ArrowUpRight, Menu, Star } from 'lucide-react'

import { cn } from '@/lib/utils'
import { NAV_LINKS } from '@/lib/content'
import { Logo } from '@/components/shared/Logo'
import { Frame } from '@/components/shared/Frame'
import { Button } from '@/components/ui/button'
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from '@/components/ui/navigation-menu'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'

/** Adds the header's bottom rule and blur only once the page has moved. */
function useScrolled(threshold = 8) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [threshold])

  return scrolled
}

export function SiteHeader() {
  const scrolled = useScrolled()

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-colors duration-300',
        scrolled
          ? 'border-b border-border bg-ink-950/80 backdrop-blur-xl'
          : 'border-b border-transparent',
      )}
    >
      <Frame className={cn('transition-colors', scrolled ? '' : 'border-transparent')}>
        <div className="flex h-16 items-center justify-between gap-6 px-(--gutter)">
          <a
            href="#top"
            className="rounded-sm transition-opacity hover:opacity-80"
            aria-label="Secryn — home"
          >
            <Logo />
          </a>

          <NavigationMenu className="hidden md:flex" viewport={false}>
            <NavigationMenuList className="gap-1">
              {NAV_LINKS.map((link) => (
                <NavigationMenuItem key={link.href}>
                  <NavigationMenuLink
                    href={link.href}
                    className="rounded-md px-3 py-1.5 text-sm text-ink-300 transition-colors hover:bg-ink-850 hover:text-ink-50 focus:bg-ink-850 focus:text-ink-50"
                  >
                    {link.label}
                  </NavigationMenuLink>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>

          <div className="flex items-center gap-2">
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer noopener"
              className="hidden items-center gap-2 rounded-md border border-border px-2.5 py-1.5 font-mono text-xs text-ink-300 transition-colors hover:border-border-strong hover:text-ink-100 lg:inline-flex"
            >
              <Star className="size-3.5" aria-hidden="true" />
              <span className="tabular">4.2k</span>
              <span className="sr-only">stars on GitHub</span>
            </a>

            <Button
              asChild
              variant="ghost"
              size="sm"
              className="hidden text-ink-300 hover:bg-ink-850 hover:text-ink-50 sm:inline-flex"
            >
              <a href="#cta">Sign in</a>
            </Button>

            <Button
              asChild
              size="sm"
              className="hidden font-medium sm:inline-flex"
            >
              <a href="#cta">
                Start free
                <ArrowUpRight className="size-3.5" aria-hidden="true" />
              </a>
            </Button>

            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="text-ink-200 md:hidden"
                  aria-label="Open navigation menu"
                >
                  <Menu />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[min(20rem,88vw)] bg-ink-925">
                <SheetHeader className="border-b border-border">
                  <SheetTitle className="text-left">
                    <Logo />
                  </SheetTitle>
                </SheetHeader>

                <nav className="flex flex-col gap-1 p-4">
                  {NAV_LINKS.map((link) => (
                    <SheetClose asChild key={link.href}>
                      <a
                        href={link.href}
                        className="rounded-md px-3 py-2.5 text-sm text-ink-200 transition-colors hover:bg-ink-850 hover:text-ink-50"
                      >
                        {link.label}
                      </a>
                    </SheetClose>
                  ))}
                </nav>

                <Separator />

                <div className="flex flex-col gap-2 p-4">
                  <Button asChild size="lg">
                    <a href="#cta">Start free</a>
                  </Button>
                  <Button asChild variant="outline" size="lg">
                    <a href="#cta">Sign in</a>
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </Frame>
    </header>
  )
}
