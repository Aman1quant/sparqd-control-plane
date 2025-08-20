import clsx from "clsx"
import type { ReactNode } from "react"
import styles from "./TextInput.module.scss"

interface TextInputProps<T extends string | number> {
  type?: "text" | "number" | "password"
  label?: string
  showLabel?: boolean
  value: T
  onChange?: (value: T) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  autoFocus?: boolean
  size?: "sm" | "md" | "lg"
  iconLeft?: ReactNode
  iconRight?: ReactNode
  helperText?: string
  readOnly?: boolean
}

function TextInput<T extends string | number>({
  type = "text",
  label,
  showLabel = true,
  disabled = false,
  autoFocus = false,
  value,
  onChange,
  placeholder = "Enter a value",
  className,
  size = "md",
  iconLeft,
  iconRight,
  helperText,
  readOnly = false,
}: TextInputProps<T>) {
  return (
    <div className={clsx(styles.inputContainer, className)}>
      {showLabel && label && <label className={styles.label}>{label}</label>}
      <div
        className={clsx(styles.inputWrapper, styles[size], {
          [styles.disabled]: disabled,
        })}
      >
        {iconLeft && <span className={styles.iconLeft}>{iconLeft}</span>}
        <input
          type={type}
          className={clsx(
            styles.input,
            iconLeft && "pl-10",
            iconRight && "pr-10"
          )}
          value={value}
          disabled={disabled}
          autoFocus={autoFocus}
          readOnly={readOnly}
          onChange={(e) => {
            if (onChange) {
              const val =
                type === "number"
                  ? (Number(e.target.value) as T)
                  : (e.target.value as T)
              onChange(val)
            }
          }}
          placeholder={placeholder}
        />
        {iconRight && <span className={styles.iconRight}>{iconRight}</span>}
      </div>
      {helperText && <p className={styles.helperText}>{helperText}</p>}
    </div>
  )
}

export default TextInput