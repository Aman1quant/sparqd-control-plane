import { useEffect, useState } from "react"
import { useHeader } from "@context/layout/header/HeaderContext"
import styles from "./ManageWorkspace.module.scss"
// import SideMenu from "./SideMenu"
import MenuListData from "./ListData"

const ManageWorkspace = () => {
  const { dispatch } = useHeader()
  const [activeTab] = useState<
    "workspace" | "compute" | "user" | "role"
  >("workspace")

  useEffect(() => {
    dispatch({
      type: "SET_HEADER",
      payload: {
        title: "",
        description: "",
        search: true,
      },
    })
  }, [dispatch])

  return (
    <div className={styles.workspaceContentWrapper}>
      <div className={styles.wholeContent}>
        {/* <SideMenu activeTab={activeTab} setActiveTab={setActiveTab} /> */}
        <main className={styles.mainContent}>
          <MenuListData activeTab={activeTab} />
        </main>
      </div>
    </div>
  )
}

export default ManageWorkspace
