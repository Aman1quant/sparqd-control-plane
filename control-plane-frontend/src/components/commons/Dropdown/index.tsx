import ReactDOM from "react-dom"

import { useState, useRef, useEffect } from "react"
import clsx from "clsx"
import { BsChevronDown } from "react-icons/bs"

import styles from "./Dropdown.module.scss"

type TDropdownItem = {
  label?: React.ReactNode
  onClick?: () => void
  className?: string
  divider?: boolean
}

type TDropdownProps = {
  theme?: "primary" | "default" | "outline" | "link"
  size?: "sm" | "md" | "lg"
  items: TDropdownItem[]
  label?: React.ReactNode
  showArrow?: boolean
  className?: string
  disabled?: boolean
  placeholder?: string
}

export default function Dropdown({
  theme = "primary",
  size = "sm",
  items,
  label = "Dropdown button",
  showArrow = true,
  className,
  disabled = false,
  placeholder = "No items available",
}: TDropdownProps) {
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [dropdownPosition, setDropdownPosition] = useState<React.CSSProperties>(
    {},
  )

  useEffect(() => {
    if (open && dropdownRef.current) {
      const rect = dropdownRef.current.getBoundingClientRect()
      setDropdownPosition({
        position: "absolute",
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        // width: rect.width, // Add this line
        zIndex: 999999,
      })
    }
  }, [open])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener("click", handleClickOutside)
    return () => document.removeEventListener("click", handleClickOutside)
  }, [])

  const themeStyles = {
    primary: styles.dropdown__button_primary,
    default: styles.dropdown__button_default,
    outline: styles.dropdown__button_outline,
    link: styles.dropdown__button_link,
  }

  const sizeStyles = {
    sm: styles.dropdown__button_sm,
    md: styles.dropdown__button_md,
    lg: styles.dropdown__button_lg,
  }

  const handleItemClick = (item: TDropdownItem) => {
    if (item.onClick) {
      item.onClick()
    }
    setOpen(false)
  }

  return (
    <div
      className={clsx(styles.dropdown, className, {
        [styles.disabled]: disabled,
      })}
      ref={dropdownRef}
    >
      <button
        className={clsx(
          styles.dropdown__button,
          themeStyles[theme],
          sizeStyles[size],
          { [styles.disabled]: disabled },
        )}
        onClick={() => !disabled && setOpen(!open)}
        aria-expanded={open}
        aria-haspopup="listbox"
        disabled={disabled}
      >
        {label}
        {showArrow && (
          <BsChevronDown
            className={clsx(styles.icon, { [styles.icon_open]: open })}
          />
        )}
      </button>

      {open &&
        ReactDOM.createPortal(
          <ul
            className={styles.dropdown__menu}
            style={dropdownPosition}
            role="listbox"
            aria-labelledby="dropdown-label"
          >
            {items.length > 0 ? (
              items.map((item, i) =>
                item.divider ? (
                  <li
                    key={i}
                    className={styles.dropdown__divider}
                    role="separator"
                  />
                ) : (
                  <li
                    key={i}
                    className={clsx(styles.dropdown__item, item.className)}
                    role="option"
                    tabIndex={0}
                    onClick={() => handleItemClick(item)}
                  >
                    {item.label}
                  </li>
                ),
              )
            ) : (
              <li className={styles.dropdown__placeholder} role="option">
                {placeholder}
              </li>
            )}
          </ul>,
          document.body,
        )}
    </div>
  )
}
