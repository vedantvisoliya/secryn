import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Copy text to the clipboard and expose a short-lived "copied" flag for UI
 * feedback. Falls back to a hidden textarea where the async API is blocked
 * (non-secure origins, older Safari).
 *
 * @param {number} [resetAfter] milliseconds before `copied` flips back to false
 */
export function useCopyToClipboard(resetAfter = 2000) {
  const [copied, setCopied] = useState(false)
  const timeoutRef = useRef(null)

  useEffect(() => () => clearTimeout(timeoutRef.current), [])

  const copy = useCallback(
    async (text) => {
      let ok = false

      try {
        if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(text)
          ok = true
        }
      } catch {
        ok = false
      }

      if (!ok) {
        const node = document.createElement('textarea')
        node.value = text
        node.setAttribute('readonly', '')
        node.style.position = 'fixed'
        node.style.opacity = '0'
        document.body.appendChild(node)
        node.select()
        try {
          ok = document.execCommand('copy')
        } catch {
          ok = false
        }
        document.body.removeChild(node)
      }

      if (ok) {
        setCopied(true)
        clearTimeout(timeoutRef.current)
        timeoutRef.current = setTimeout(() => setCopied(false), resetAfter)
      }

      return ok
    },
    [resetAfter],
  )

  return { copied, copy }
}
