import React from "react"
import styles from "./Search.module.scss"
import clsx from "clsx"
import { IconCommand, IconSearch } from "@tabler/icons-react"

type SearchProps = {
  sizes?: "lg" | "md" | "sm"
  type?: "direct" | "default"
  placeholder?: string
  className?: string
  classNameInput?: string
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
} & React.InputHTMLAttributes<HTMLInputElement>

export const Search: React.FC<SearchProps> = ({
  sizes = "md",
  type = "default",
  placeholder = "Search here",
  className,
  classNameInput,
  value,
  onChange,
  ...props
}) => {
  const isDefault = type === "default"

  return (
    <div
      className={clsx(
        styles.searchContainer,
        styles[sizes],
        { [styles.default]: isDefault },
        className,
      )}
    >
      <div className={styles.iconWrapper}>
        <IconSearch size={16} />
      </div>
      <input
        type="text"
        className={clsx(styles.input, classNameInput)}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        {...props}
      />
      {!isDefault && (
        <div className={styles.shortcutHint}>
          <span className="flex items-center align-middle">
            <IconCommand size={14} /> + K
          </span>
        </div>
      )}
    </div>
  )
}
