import React, { useState, useEffect } from "react"
import styles from "./Tabs.module.scss"
import { MdArrowDropDown, MdClose } from "react-icons/md"
import clsx from "clsx"

type TabItem = {
  id?: string
  label: string
  count?: number
  active?: boolean
  onClose?: (id: string) => void
  iconLeft?: React.ReactNode
  onIconLeftClick?: (e: React.MouseEvent) => void
  disabled?: boolean
}

type TabDropdownOption = {
  label: string
  onClick: () => void
  divider?: boolean
  disabled?: boolean
}

type TabsProps = {
  items: TabItem[]
  initialTab?: string
  showCount?: boolean
  renderContent?: (activeTab: string) => React.ReactNode
  onAddClick?: () => void
  addButtonLabel?: string
  onClick?: (tab: TabItem) => void
  dropdownOptions?: TabDropdownOption[]
  showDropdown?: boolean
  className?: string
  headerClassName?: string
  variant?: "with-background" | "no-background"
  size?: "default" | "small"
  addButtonClassName?: string
}

export default function Tabs({
  items,
  initialTab,
  showCount = true,
  renderContent,
  onAddClick,
  variant = "with-background",
  size = "default",
  addButtonLabel = "+",
  onClick,
  dropdownOptions = [],
  showDropdown = false,
  className,
  headerClassName,
  addButtonClassName,
}: TabsProps) {
  const [activeTab, setActiveTab] = useState("")
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab)
    }
  }, [initialTab])

  useEffect(() => {
    const defaultTab =
      initialTab ||
      items.find((tab) => tab.active && !tab.disabled)?.label ||
      items.find((tab) => !tab.disabled)?.label ||
      ""
    setActiveTab(defaultTab)
  }, [items, initialTab])

  return (
    <div className={clsx(styles["tabs-group"], className)}>
      <div className={clsx(styles["tabs-header"], headerClassName)}>
        {items.map((tab) => {
          const isActive = activeTab === tab.label

          return (
            <button
              key={tab.id || tab.label}
              disabled={tab.disabled}
              onClick={() => {
                setActiveTab(tab.label)
                if (onClick) onClick(tab)
              }}
              className={clsx(
                styles["tab-button"],
                styles[`variant-${variant}`],
                styles[`size-${size}`],
                {
                  [styles.active]: isActive,
                },
              )}
            >
              {tab.iconLeft && (
                <span
                  className={styles["icon-left"]}
                  onClick={(e) => {
                    e.stopPropagation()
                    if (tab.onIconLeftClick) {
                      tab.onIconLeftClick(e)
                    }
                  }}
                >
                  {tab.iconLeft}
                </span>
              )}
              <span>{tab.label}</span>
              {showCount && tab.count !== undefined && (
                <span
                  className={`${styles["tab-count"]} ${
                    isActive ? styles.active : ""
                  }`}
                >
                  {String(tab.count).padStart(2, "0")}
                </span>
              )}
              {tab.onClose && (
                <span
                  className={styles["close-icon"]}
                  onClick={(e) => {
                    e.stopPropagation()
                    if (tab.id) tab.onClose!(tab.id)
                  }}
                >
                  <MdClose size={16} />
                </span>
              )}
              {showDropdown && isActive && (
                <MdArrowDropDown
                  className={styles["tab-dropdown-icon"]}
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsDropdownOpen((prev) => !prev)
                  }}
                />
              )}
            </button>
          )
        })}
        {showDropdown && isDropdownOpen && (
          <div className={styles["tab-dropdown-menu"]}>
            {dropdownOptions.map((option, index) =>
              option.divider ? (
                <div
                  key={`divider-${index}`}
                  className={styles["dropdown-divider"]}
                />
              ) : (
                <button
                  key={option.label}
                  className={clsx(
                    styles["dropdown-item"],
                    option.disabled && "opacity-50 cursor-not-allowed",
                  )}
                  onClick={() => {
                    if (option.disabled) return
                    option.onClick()
                    setIsDropdownOpen(false)
                  }}
                  disabled={option.disabled}
                >
                  {option.label}
                </button>
              ),
            )}
          </div>
        )}
        {onAddClick && (
          <button
            type="button"
            className={clsx(styles["tab-add-button"], addButtonClassName)}
            onClick={onAddClick}
          >
            {addButtonLabel}
          </button>
        )}
      </div>
      <div className={`${styles["tab-content"]}`}>
        {renderContent ? renderContent(activeTab) : `Content for ${activeTab}`}
      </div>
    </div>
  )
}
