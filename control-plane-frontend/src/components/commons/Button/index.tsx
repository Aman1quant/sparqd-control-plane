import React from "react"
import clsx from "clsx"
import styles from "./Button.module.scss"

type ButtonProps = {
  label?: string
  iconLeft?: React.ReactNode
  iconRight?: React.ReactNode
  showLabel?: boolean
  block?: boolean
  responsive?: boolean
  shape?: "default" | "rounded"
  variant?: "solid" | "outline" | "link"
  color?:
    | "primary"
    | "secondary"
    | "danger"
    | "success"
    | "info"
    | "warning"
    | "default"
  size?: "sm" | "md" | "lg"
  active?: boolean
  className?: string
} & React.ButtonHTMLAttributes<HTMLButtonElement>

const Button: React.FC<ButtonProps> = ({
  label,
  iconLeft,
  iconRight,
  showLabel = true,
  block = false,
  responsive = false,
  shape = "default",
  variant = "solid",
  color = "primary",
  size = "sm",
  active = false,
  className,
  children,
  ...rest
}) => {
  const combinedClass = clsx(
    styles.button,
    styles[variant],
    styles[color],
    styles[size],
    styles[`shape__${shape}`],
    {
      [styles.block]: block,
      [styles.responsive]: responsive,
      [styles.active]: active,
    },
    className,
  )

  return (
    <button className={combinedClass} {...rest}>
      {iconLeft && <span className={styles.iconLeft}>{iconLeft}</span>}
      {showLabel && <span className={styles.label}>{children || label}</span>}
      {iconRight && <span className={styles.iconRight}>{iconRight}</span>}
    </button>
  )
}

export default Button
