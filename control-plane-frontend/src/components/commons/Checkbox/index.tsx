import { useId } from "react"
import { BsCheck } from "react-icons/bs"
import clsx from "clsx"
import styles from "./Checkbox.module.scss"

interface CheckboxProps {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
  className?: string
}

const Checkbox = ({
  label,
  checked,
  onChange,
  disabled = false,
  className,
}: CheckboxProps) => {
  const id = useId()

  return (
    <label
      htmlFor={id}
      className={clsx(styles.wrapper, disabled && styles.disabled, className)}
    >
      <input
        id={id}
        type="checkbox"
        className={styles.checkbox}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
      />
      <div
        className={clsx(styles.customCheckbox, checked && styles.checked)}
      >
        {checked && <BsCheck className={styles.checkIcon} />}
      </div>
      <span className={styles.label}>{label}</span>
    </label>
  )
}

export default Checkbox