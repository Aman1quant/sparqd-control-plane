import { useEffect, useState } from "react"
import { useHeader } from "@context/layout/header/HeaderContext"
import { Button, Tabs } from "@components/commons"
import styles from "./Dashboard.module.scss"
import Template from "./Template"
import DashboardTable from "./DashboardTable"

const Dashboard = () => {
  const items = [
    {
      label: "Dashboard",
      active: true,
      content: <Template />,
    },
    { label: "Legacy dashboard", active: false, disabled: true },
  ]

  const [datatabs, setDataTabs] = useState(items)

  const itemsTabsTable = [
    {
      label: "All",
      active: true,
      content: <DashboardTable />,
    },
    { label: "Favorites", active: false, disabled: true },
    { label: "Popular", active: false, disabled: true },
  ]

  const [datatabstable, setDataTabsTable] = useState(itemsTabsTable)

  const { dispatch } = useHeader()
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
    <div className={styles.dashboardContentWrapper}>
      <div className={styles.topSection}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
          <label className="flex items-center text-black text-heading-6 font-medium">
            Dashboard
          </label>
          <div className="flex items-center justify-end gap-2">
            <Button
              disabled
              variant="outline"
              color="primary"
              size="md"
              label="View samples gallery"
              onClick={() => console.log("view")}
            />

            <Button
              disabled
              variant="outline"
              color="primary"
              size="md"
              label="Create dashboard"
              onClick={() => console.log("create")}
            />
          </div>
        </div>
      </div>
      <div className={styles.dashboardTabsTemplate}>
        <Tabs
          items={datatabs}
          renderContent={() => (
            <div>{datatabs.find((tab) => tab.active)?.content}</div>
          )}
          onClick={(tab) => {
            const updatedTabs = datatabs.map((item) => ({
              ...item,
              active: item.label === tab.label,
            }))
            setDataTabs(updatedTabs)
          }}
        />
      </div>

      <div className={styles.dashboardTabsTable}>
        <Tabs
          items={datatabstable}
          renderContent={() => (
            <div>{datatabstable.find((tab) => tab.active)?.content}</div>
          )}
          onClick={(tab) => {
            const updatedTabs = datatabstable.map((item) => ({
              ...item,
              active: item.label === tab.label,
            }))
            setDataTabsTable(updatedTabs)
          }}
        />
      </div>
    </div>
  )
}

export default Dashboard
