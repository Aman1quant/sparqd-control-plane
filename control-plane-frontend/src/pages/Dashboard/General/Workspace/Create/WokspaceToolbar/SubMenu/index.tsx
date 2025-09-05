import { IconCaretRightFilled } from "@tabler/icons-react"
import styles from "../WorkspaceToolbar.module.scss"
import { useState, useRef, useEffect } from "react"

interface SubMenuProps {
  label: string
  children?: React.ReactNode
}

export function SubMenu({ label, children }: SubMenuProps) {
  const [hover, setHover] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setHover(true)
  }

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setHover(false)
    }, 300)
  }

  return (
    <div
      className={styles.item}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="flex justify-between items-center w-full">
        <span>{label}</span>
        <span className="text-xs ms-8">
          <IconCaretRightFilled size={16} />
        </span>
      </div>
      <div
        className={`${styles.subDropdown} ${hover ? styles.subDropdownOpen : ""}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {children}
      </div>
    </div>
  )
}
