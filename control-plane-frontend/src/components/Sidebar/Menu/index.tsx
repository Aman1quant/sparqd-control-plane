import React from "react"
import { useLocation } from "react-router-dom"

import routes, { type RouteItem, type RouteSection } from "@/routes"
import SidebarMenuItem from "./Item"
import styles from "../sidebar.module.scss"
import { useAuth } from "@context/AuthContext"

interface Props {
  open: boolean
}

const SidebarMenu: React.FC<Props> = ({ open }) => {
  const location = useLocation()
  const { user } = useAuth()

  return (
    <ul className={styles.menu}>
      <div className={`${styles.menu__container} custom-scrollbar`}>
        {routes.map((section: RouteSection, sectionIdx: number) => (
          <React.Fragment key={sectionIdx}>
            {section.section && open && (
              <li className={styles.section_title}>{section.section.title}</li>
            )}
            {section.items
              .filter((menu: RouteItem) => !menu.hidden)
              .filter((menu: RouteItem) => {
                if (menu.roleAccess && user) {
                  return menu.roleAccess.includes(user.role)
                }
                return true
              })
              .map((menu: RouteItem, index: number) => (
                <SidebarMenuItem
                  key={menu.title + index}
                  menu={menu}
                  open={open}
                  currentPath={location.pathname}
                />
              ))}
          </React.Fragment>
        ))}
      </div>
    </ul>
  )
}

export default SidebarMenu
