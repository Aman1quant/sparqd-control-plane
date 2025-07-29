import styles from "../WorkspaceToolbar.module.scss"
import { useState, useRef, useEffect } from "react"

interface MenuProps {
  label: string
  children?: React.ReactNode
}

export function Menu({ label, children }: MenuProps) {
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const hoverTimeout = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleMouseEnter = () => {
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current)
    setOpen(true)
  }

  const handleMouseLeave = () => {
    hoverTimeout.current = setTimeout(() => setOpen(false), 200)
  }

  const handleClick = () => setOpen((prev) => !prev)

  return (
    <div
      ref={menuRef}
      className={styles.menu}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button onClick={handleClick} className={styles.trigger}>
        {label}
      </button>
      <div className={`${styles.dropdown} ${open ? styles.dropdownOpen : ""}`}>
        {children}
      </div>
    </div>
  )
}
