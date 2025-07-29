import React from "react"
import clsx from "clsx"
import { BsChevronDown } from "react-icons/bs"

import styles from "./Select.module.scss"

interface Option {
  value: string | number
  label: string
}

interface SelectProps {
  options: Option[]
  value: string | number
  onChange: (value: string | number) => void
  placeholder?: string
  className?: string
  label?: string
  showLabel?: boolean
  disabled?: boolean
}

const Select: React.FC<SelectProps> = ({
  options,
  value,
  onChange,
  placeholder = "Select an option",
  className,
  label,
  showLabel = false,
  disabled = false,
}) => {
  return (
    <div className={clsx(styles.selectContainer, className)}>
      {showLabel && label && (
        <label className={styles.selectLabel}>{label}</label>
      )}
      <div className={styles.selectWrapper}>
        <select
          className={styles.select}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div className={styles.iconWrapper}>
          <BsChevronDown aria-hidden="true" />
        </div>
      </div>
    </div>
  )
}

export default Select
