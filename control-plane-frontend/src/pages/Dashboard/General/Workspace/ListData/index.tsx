import { useEffect, useState } from "react"
import { useHeader } from "@context/layout/header/HeaderContext"
import styles from "./Workspace.module.scss"
import Sidepanel from "@components/Sidepanel"
import ListData from "./TabsContent"

const Workspace = () => {
  const { dispatch } = useHeader()
  const [activeTab, setActiveTab] = useState<"home" | "favorites" | "trash">(
    "home",
  )

  useEffect(() => {
    dispatch({
      type: "SET_HEADER",
      payload: {
        title: "Workspace",
        description: "A Short description will be placed right over here",
        search: true,
      },
    })
  }, [dispatch])

  return (
    <div className={styles.workspaceContentWrapper}>
      <div className={styles.wholeContent}>
        <Sidepanel activeTab={activeTab} setActiveTab={setActiveTab} />
        <main className={styles.mainContent}>
          <ListData activeTab={activeTab} />
        </main>
      </div>
    </div>
  )
}

export default Workspace
