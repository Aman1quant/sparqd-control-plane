import React from "react"
import { BsChevronRight } from "react-icons/bs"
import styles from "./Breadcrumb.module.scss"

export interface BreadcrumbItem {
  label: React.ReactNode
  href?: string
  isActive?: boolean
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ items }) => {
  return (
    <nav className={styles.breadcrumb} aria-label="Breadcrumb">
      <ol className={styles.list}>
        {items.map((item, index) => (
          <li key={index} className={styles.itemWrapper}>
            {index > 0 && <BsChevronRight className={styles.separator} />}
            {item.href && !item.isActive ? (
              <a href={item.href} className={styles.link}>
                {item.label}
              </a>
            ) : (
              <span className={styles.current}>{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}

export default Breadcrumb
