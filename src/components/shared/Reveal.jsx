import { createElement } from 'react'
import { motion, useReducedMotion } from 'motion/react'

import { cn } from '@/lib/utils'

/**
 * Motion components are created once at module scope — building them during
 * render would hand React a new component type each pass and remount children.
 */
const MOTION_TAGS = {
  div: motion.div,
  span: motion.span,
  p: motion.p,
  li: motion.li,
  ul: motion.ul,
  h2: motion.h2,
  h3: motion.h3,
  figure: motion.figure,
}

/**
 * Scroll-triggered entrance. Deliberately small: ~10px of travel and a single
 * opacity ramp. Motion here exists to sequence reading order, not to perform.
 *
 * Collapses to a plain element when the user prefers reduced motion.
 *
 * @param {object} props
 * @param {keyof typeof MOTION_TAGS} [props.as]
 * @param {number} [props.delay] seconds
 * @param {number} [props.y] px of upward travel
 */
export function Reveal({ as = 'div', delay = 0, y = 10, className, children, ...props }) {
  const reduceMotion = useReducedMotion()
  const Component = MOTION_TAGS[as] ?? MOTION_TAGS.div

  if (reduceMotion) {
    return createElement(as, { className: cn(className), ...props }, children)
  }

  return (
    <Component
      className={cn(className)}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-64px' }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
      {...props}
    >
      {children}
    </Component>
  )
}
