import React, { useState, useEffect } from "react"

import styles from "./Tabs.module.scss"
import { MdArrowDropDown } from "react-icons/md"

type TabItem = {
  id?: string
  label: string
  count?: number
  active?: boolean
}

type TabDropdownOption = {
  label: string
  onClick: () => void
  divider?: boolean
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
}

export default function Tabs({
  items,
  initialTab,
  showCount = true,
  renderContent,
  onAddClick,
  addButtonLabel = "+",
  onClick,
  dropdownOptions = [],
  showDropdown = false,
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
      items.find((tab) => tab.active)?.label ||
      items[0]?.label ||
      ""

    setActiveTab(defaultTab)
  }, [items])

  return (
    <div className={styles["tabs-group"]}>
      <div className={styles["tabs-header"]}>
        {items.map((tab) => {
          const isActive = activeTab === tab.label

          return (
            <button
              key={tab.label}
              onClick={() => {
                setActiveTab(tab.label), onClick && onClick(tab)
              }}
              className={`${styles["tab-button"]} ${isActive ? styles.active : ""}`}
            >
              <span>{tab.label}</span>
              {showCount && tab.count !== undefined && (
                <span
                  className={`${styles["tab-count"]} ${isActive ? styles.active : ""}`}
                >
                  {String(tab.count).padStart(2, "0")}
                </span>
              )}

              {showDropdown && isActive && (
                <MdArrowDropDown
                  className={styles["tab-dropdown-icon"]}
                  onClick={() => setIsDropdownOpen((prev) => !prev)}
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
                  className={styles["dropdown-item"]}
                  onClick={() => {
                    option.onClick()

                    setIsDropdownOpen(false)
                  }}
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
            className={styles["tab-add-button"]}
            onClick={onAddClick}
          >
            {addButtonLabel}
          </button>
        )}
      </div>

      <div className={styles["tab-content"]}>
        {renderContent ? renderContent(activeTab) : `Content for ${activeTab}`}
      </div>
    </div>
  )
}
