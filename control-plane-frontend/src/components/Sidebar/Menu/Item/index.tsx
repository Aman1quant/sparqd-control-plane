import React from "react"
import { Link } from "react-router-dom"
import clsx from "clsx"

import { type RouteItem } from "@/routes"

import styles from "../../sidebar.module.scss"

interface Props {
  menu: RouteItem
  open: boolean
  currentPath: string
}

const SidebarMenuItem: React.FC<Props> = ({ menu, open, currentPath }) => {
  const fullPath = `${menu.layout || ""}/${menu.path}`
  const isButton = menu.type === "button"

  const classNames = clsx(
    styles.section_item,
    menu.gap ? "mt-1" : "mt-2",
    currentPath.startsWith(fullPath) ? styles.active : styles.inactive,
    menu.type === "button" ? styles.button : "",
  )

  const content = (
    <>
      {menu.icon &&
        React.createElement(menu.icon, {
          size: isButton ? 24 : 20,
          className: styles.section_item__icon,
        })}

      <span
        className={clsx(
          styles.section_item__title,
          open ? styles.open : styles.close,
          isButton ? styles.button_title : "",
        )}
      >
        {menu.title}
      </span>
    </>
  )

  return menu.path && menu.component ? (
    <Link to={fullPath} className={classNames}>
      {content}
    </Link>
  ) : (
    <li className={classNames}>{content}</li>
  )
}

export default SidebarMenuItem
