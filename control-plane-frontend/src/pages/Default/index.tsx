import { useEffect } from "react"

import waveIcon from "@/images/hello.png"
import { Search } from "@components/commons/Search"
import styles from "./Default.module.scss"
import Button from "@components/commons/Button"
import { useHeader } from "@context/layout/header/HeaderContext"
// import { BsBarChart, BsClock, BsGift, BsStar } from "react-icons/bs"
import { BsClock } from "react-icons/bs"

const Default = () => {
  const { dispatch } = useHeader()

  useEffect(() => {
    dispatch({
      type: "SET_HEADER",
      payload: {
        title: "Welcome to SparQ",
        description: "",
        search: false,
      },
    })
  }, [])
  return (
    <div>
      <Search
        sizes="md"
        type="direct"
        placeholder="Search data, notebooks, recents and more"
      />

      <div className="flex flex-nowrap overflow-x-auto justify-start gap-2 sm:gap-3 mt-6 mb-10">
        {[
          { icon: <BsClock size={16} />, label: "Recent", active: true },
        ].map((tab, idx) => (
          <Button
            variant="solid"
            color="default"
            key={idx}
            size="sm"
            iconLeft={tab.icon}
            label={tab.label}
            active={tab.active}
          />
        ))}
      </div>

      <div className={styles.emptyState}>
        <div className="max-w-md justify-items-center">
          <img src={waveIcon} alt="Wave" className={styles.icon} />
          <h2 className={styles.title}>Welcome to SparQ</h2>
          <p className={styles.description}>
            Start by searching for data, notebooks, or recent items{" "}
            <br className="hidden md:block" />
            to get started with your work
          </p>
        </div>
      </div>
    </div>
  )
}

export default Default
