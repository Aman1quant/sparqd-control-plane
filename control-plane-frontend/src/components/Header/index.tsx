import { useState, useRef, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { BsBell, BsBoxArrowRight, BsPerson } from "react-icons/bs"

import ImgAvatar from "@/images/_avatar.png"
import styles from "./header.module.scss"
import { Search } from "@components/commons/Search"
import { useHeader } from "@context/layout/header/HeaderContext"
import { useKeycloak } from "@react-keycloak/web"


const Header: React.FC = () => {
  const { keycloak } = useKeycloak()
  const navigate = useNavigate()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const { header } = useHeader()

  const noTitle = !header.title && !header.description
  const titleOnlyNoSearch =
    !!header.title && !header.description && !header.search

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false)
      }
    }

    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [dropdownOpen])

  const extraClass = noTitle
    ? styles["header--noTitle"]
    : titleOnlyNoSearch
      ? styles["header--titleOnlyNoSearch"]
      : ""

  const handleLogout = async () => {
    keycloak.logout({
      redirectUri: `${window.location.origin}/auth/login`,
    })
  }


  return (
    <div className={`${styles.header} ${extraClass}`}>
      <div className={styles.header__flexContainer}>
        <div className={styles.header__topRow}>
          {!noTitle && !titleOnlyNoSearch && (
            <div className={styles.header__welcome}>
              <h2>{header.title}</h2>
              <p>{header.description}</p>
            </div>
          )}

          {noTitle && header.search && (
            <div className={styles.header__searchWrapper}>
              <Search
                sizes="md"
                type="direct"
                placeholder="Search data, notebooks, recents and more"
                classNameInput="lg:min-w-[400px]"
              />
            </div>
          )}

          {titleOnlyNoSearch && (
            <div className={styles.header__welcome}>
              <h2>{header.title}</h2>
            </div>
          )}

          <div className={styles.header__rightControls} ref={dropdownRef}>
            {!noTitle && !titleOnlyNoSearch && header.search && (
              <div className={styles.header__searchWrapper}>
                <Search
                  sizes="md"
                  type="direct"
                  placeholder="Search data, notebooks, recents and more"
                  classNameInput="lg:min-w-[400px]"
                />
              </div>
            )}

            <BsBell className={styles.header__icon} />

            {/* <div
              className={styles.header__avatarRing}
              onClick={() => setDropdownOpen(!dropdownOpen)}
            > */}
            <img
              src={ImgAvatar}
              alt="User"
              className={styles.header__avatarImg}
              onClick={() => setDropdownOpen(!dropdownOpen)}
            />
            {/* </div> */}

            {dropdownOpen && (
              <div className={styles.header__dropdown}>
                <Link to="/my-profile" className={styles.header__dropdownItem}>
                  <BsPerson className={styles.header__dropdownIcon} />
                  My Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className={styles.header__dropdownItem}
                >
                  <BsBoxArrowRight className={styles.header__dropdownIcon} />
                  Log Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Header
