import { useEffect, useState } from "react"
import { useHeader } from "@context/layout/header/HeaderContext"
import styles from "./Workspace.module.scss"
import Sidepanel from "@components/Sidepanel"
import ListData from "./TabsContent"
import { useQuery } from "@context/query/QueryContext"
import ShareQueryModal from "@pages/Dashboard/SQL/SQLEditor/ShareQueryModal"

const Workspace = () => {
  const { dispatch } = useHeader()
  const { isShareModalOpen } = useQuery()

  const [activeTab, setActiveTab] = useState<"home" | "favorites" | "trash">(
    "home",
  )
  const [selectedPath, setSelectedPath] = useState<string>("")

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
    <>
      <div className={styles.workspaceContentWrapper}>
        <div className={styles.wholeContent}>
          <Sidepanel
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            selectedPath={selectedPath}
            setSelectedPath={setSelectedPath}
          />
          <main className={styles.mainContent}>
            <ListData activeTab={activeTab} selectedPath={selectedPath} setSelectedPath={setSelectedPath} />
          </main>
        </div>
      </div>
      {isShareModalOpen && <ShareQueryModal />}
    </>
  )
}

export default Workspace
