import { BsCheck } from "react-icons/bs"
import styles from "../WorkspaceToolbar.module.scss"

interface MenuItemProps {
  label: string
  onClick?: () => void
  disabled?: boolean
  shortcut?: string
  checked?: boolean
}

export function MenuItem({
  label,
  onClick,
  disabled,
  shortcut,
  checked,
}: MenuItemProps) {
  return (
    <div
      className={`${styles.item} ${disabled ? styles.disabled : ""}`}
      onClick={() => {
        if (!disabled && onClick) onClick()
      }}
    >
      <span className="flex align-middle items-center">
        {checked && <BsCheck />}
        {label}
      </span>
      {shortcut && <span className={styles.shortcut}>{shortcut}</span>}
    </div>
  )
}
