"use client"

import React from "react"
import clsx from "clsx"

import styles from "./Table.module.scss"

interface TableProps {
  children: React.ReactNode
  className?: string
  theme?: "query" | "default" | "secondary"
}

const themeStyle = {
  query: styles.query,
  default: styles.default,
  secondary: styles.secondary,
}

const Table: React.FC<TableProps> = ({
  children,
  theme = "default",
  className,
}) => {
  return (
    <div className={clsx(styles.wrapper, themeStyle[theme])}>
      <table className={clsx(styles.table, className)}>{children}</table>
    </div>
  )
}

export default Table
