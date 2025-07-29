import { useEffect } from "react"

type ShortcutHandler = (event: KeyboardEvent) => void

interface ShortcutOptions {
  mac?: string
  windows?: string
  handler: ShortcutHandler
  preventDefault?: boolean
}

const parseKeyCombo = (combo: string): ((e: KeyboardEvent) => boolean) => {
  const keys = combo
    .toLowerCase()
    .split("+")
    .map((k) => k.trim())

  const hasCtrl = keys.includes("ctrl")
  const hasCmd = keys.includes("cmd") || keys.includes("meta")
  const hasAlt = keys.includes("alt")
  const hasShift = keys.includes("shift")
  const mainKey = keys.find(
    (k) => !["ctrl", "cmd", "alt", "shift", "meta"].includes(k),
  )

  return (e: KeyboardEvent) => {
    const isMainKeyMatch = mainKey ? e.key.toLowerCase() === mainKey : true
    return (
      isMainKeyMatch &&
      e.ctrlKey === hasCtrl &&
      e.metaKey === hasCmd &&
      e.altKey === hasAlt &&
      e.shiftKey === hasShift
    )
  }
}

export const useGlobalShortcut = (shortcuts: ShortcutOptions[]) => {
  useEffect(() => {
    const isMac = navigator.platform.toUpperCase().includes("MAC")

    const handler = (e: KeyboardEvent) => {
      const activeTag = document.activeElement?.tagName.toLowerCase()
      const isInput =
        activeTag === "input" ||
        activeTag === "textarea" ||
        document.activeElement?.getAttribute("contenteditable") === "true"

      if (isInput) return

      for (const shortcut of shortcuts) {
        const combo = isMac ? shortcut.mac : shortcut.windows
        if (!combo) continue

        const matches = parseKeyCombo(combo)
        if (matches(e)) {
          if (shortcut.preventDefault) e.preventDefault()
          shortcut.handler(e)
        }
      }
    }

    window.addEventListener("keydown", handler, true)
    return () => {
      window.removeEventListener("keydown", handler, true)
    }
  }, [shortcuts])
}
