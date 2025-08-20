import clsx from "clsx"
import styles from "./Switch.module.scss"

interface SwitchProps {
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
}

const Switch = ({ checked, onChange, disabled }: SwitchProps) => {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => !disabled && onChange(!checked)}
      className={clsx(
        styles.switch,
        checked ? styles.checked : styles.unchecked,
        disabled && styles.disabled
      )}
    >
      <span className={clsx(styles.handle, checked ? styles.handleOn : styles.handleOff)} />
    </button>
  )
}

export default Switch