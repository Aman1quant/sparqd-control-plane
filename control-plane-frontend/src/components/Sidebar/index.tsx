import React, { useEffect } from "react"
import clsx from "clsx"

import useScreenSize from "@hooks/useScreenSize"

import ToggleButton from "./ToggleButton"
import LogoSection from "./LogoSection"
import SidebarMenu from "./Menu"

import styles from "./sidebar.module.scss"

interface SidebarProps {
  open: boolean
  setOpen: (open: boolean) => void
}

const Sidebar: React.FC<SidebarProps> = ({ open, setOpen }) => {
  const { isSmall } = useScreenSize()

  useEffect(() => {
    if (isSmall) {
      setOpen(false)
    } else {
      setOpen(true)
    }
  }, [isSmall, setOpen])

  return (
    <div className={styles.sidebar}>
      <div
        className={clsx(styles.toggle, open && styles.toggle__open)}
        onClick={() => setOpen(!open)}
      >
        <ToggleButton open={open} toggle={() => setOpen(!open)} />
      </div>

      <div
        className={clsx(
          styles.content,
          open ? styles.content__open : styles.content__close,
          isSmall && open ? "absolute" : "relative",
        )}
      >
        <LogoSection open={open} isMd={false} />
        <div className={styles.divider}></div>
        <SidebarMenu open={open} />
      </div>
    </div>
  )
}

export default Sidebar
