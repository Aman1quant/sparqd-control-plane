import { IconCaretRightFilled } from "@tabler/icons-react"
import styles from "../WorkspaceToolbar.module.scss"
import { useState } from "react"

interface SubMenuProps {
  label: string
  children?: React.ReactNode
}

export function SubMenu({ label, children }: SubMenuProps) {
  const [hover, setHover] = useState(false)

  return (
    <div
      className={styles.item}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div className="flex justify-between items-center w-full">
        <span>{label}</span>
        <span className="text-xs ms-8">
          <IconCaretRightFilled size={16} />
        </span>
      </div>
      <div
        className={`${styles.subDropdown} ${hover ? styles.subDropdownOpen : ""}`}
      >
        {children}
      </div>
    </div>
  )
}
