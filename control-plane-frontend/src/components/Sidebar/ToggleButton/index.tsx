import React from "react"
import clsx from "clsx"

import Arrow from "@/images/arrow.png"

import styles from "../sidebar.module.scss"

interface Props {
  open: boolean
  toggle: () => void
}

const ToggleButton: React.FC<Props> = ({ open, toggle }) => (
  <img
    src={Arrow}
    className={clsx(styles.toggle, !open && "rotate-180")}
    onClick={toggle}
    alt="Toggle sidebar"
  />
)

export default ToggleButton
