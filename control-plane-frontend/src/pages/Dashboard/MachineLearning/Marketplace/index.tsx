import { useEffect, useState } from "react"

import { useHeader } from "@context/layout/header/HeaderContext"
import styles from "./Marketplace.module.scss"
// import Breadcrumb from "@components/commons/Breadcrumb"
// import { BsStar } from "react-icons/bs"
import { Button, Tabs } from "@components/commons"
import { PiClockCounterClockwiseFill } from "react-icons/pi"
import Section from "./Section"
import {
  IconDotsVertical,
  IconExternalLink,
  IconPower,
} from "@tabler/icons-react"

const Marketplace = () => {
  // const breadcrumbItems = [
  //   { label: "Compute", href: "/admin/workflow", isActive: false },
  //   // { label: "ripple_assistant", isActive: true },
  // ]

  const items = [
    {
      label: "Details",
      active: false,
      disabled: true,
    },
    { label: "Connections", active: true, content: <Section /> },
    { label: "Logs", active: false, disabled: true },
    { label: "Kubernetes events", active: false, disabled: true },
    { label: "Activity", active: false, disabled: true },
    { label: "Configuration", active: false, disabled: true },
  ]

  const [datatabs, setDataTabs] = useState(items)

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
    <div className={styles.marketplaceContentWrapper}>
      <div className={styles.topSection}>
        {/* <Breadcrumb items={breadcrumbItems} /> */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
          <label className="flex items-center text-black text-heading-6 font-medium">
            Connectors
          </label>
          {/* <label className="flex items-center text-black text-heading-6 font-medium">
            ripple_assistant <BsStar className="text-body-medium ms-2" />
          </label> */}
          <div className="flex items-center justify-end gap-2">
            <Button
              label="Metrics"
              iconRight={<IconExternalLink size={16} />}
              variant="link"
              color="primary"
              size="md"
              onClick={() => console.log("metrics")}
            />
            <Button
              label="Configure"
              variant="solid"
              color="default"
              size="md"
              disabled
              onClick={() => console.log("configure")}
            />
            <Button
              label="Restart"
              iconLeft={<PiClockCounterClockwiseFill size={16} />}
              variant="outline"
              color="primary"
              size="md"
              onClick={() => console.log("restart")}
            />

            <Button
              label="Terminate"
              iconLeft={<IconPower size={16} />}
              variant="outline"
              color="danger"
              size="md"
              onClick={() => console.log("terminate")}
            />

            <Button
              iconLeft={<IconDotsVertical size={20} />}
              variant="link"
              color="default"
              size="md"
              onClick={() => console.log("options")}
            />
          </div>
        </div>
        <div className={styles.marketplaceTabs}>
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
      </div>
    </div>
  )
}

export default Marketplace
