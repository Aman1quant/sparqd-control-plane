import React from "react"
import clsx from "clsx"
import { useNavigate } from "react-router-dom"

import Logo from "@/images/SparQLogo.svg"
import styles from "../sidebar.module.scss"

interface Props {
  open: boolean
  isMd: boolean
}

const LogoSection: React.FC<Props> = ({ open, isMd }) => {
  const navigate = useNavigate()

  const handleClick = () => {
    navigate("/admin/default")
  }

  return (
    <div
      className={clsx(
        styles.logo_container,
        isMd && open ? styles.logo__open : styles.logo__close,
      )}
      onClick={handleClick}
    >
      <img
        src={Logo}
        alt="Logo"
        className={clsx(styles.logo_image, open ? styles.open : styles.close)}
      />
      <h1
        className={clsx(styles.logo_title, open ? styles.open : styles.close)}
      >
        Quant Data
      </h1>
    </div>
  )
}

export default LogoSection
