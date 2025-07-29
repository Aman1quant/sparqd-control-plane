import React, { useState } from "react"
import clsx from "clsx"
import styles from "./Toggle.module.scss"

export type ToggleProps = {
  label?: string
  size?: "sm" | "md" | "lg"
  color?: "primary" | "green" | "red" | "orange" | "yellow"
  checked?: boolean
  disabled?: boolean
  onChange?: (checked: boolean) => void
  className?: string
}

const Toggle: React.FC<ToggleProps> = ({
  label,
  size = "md",
  color = "primary",
  checked,
  disabled = false,
  onChange,
  className,
}) => {
  const isControlled = typeof checked === "boolean"
  const [internalChecked, setInternalChecked] = useState(false)

  const isChecked = isControlled ? checked : internalChecked

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = e.target.checked
    if (!isControlled) setInternalChecked(next)
    onChange?.(next)
  }

  return (
    <label
      className={clsx(
        styles.toggle,
        styles[size],
        styles[color],
        {
          [styles.checked]: isChecked,
          [styles.disabled]: disabled,
        },
        className,
      )}
    >
      <input
        type="checkbox"
        className={styles.input}
        checked={isChecked}
        disabled={disabled}
        onChange={handleChange}
      />
      <span className={styles.slider} />
      {label && <span className={styles.label}>{label}</span>}
    </label>
  )
}

export default Toggle
