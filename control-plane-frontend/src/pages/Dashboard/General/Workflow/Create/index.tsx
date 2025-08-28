import React, { useState } from "react"
import styles from "./Create.module.scss"
import { IoClose } from "react-icons/io5"
import { Tabs } from "@components/commons"
import SingleTask from "./Section/SingleTask"
import MultipleTask from "./Section/MultipleTask"
import ImportTask from "./Section/ImportTask"

interface Props {
  onClose: () => void
}

const CreateWorkflow: React.FC<Props> = ({ onClose }) => {
  const items = [
    {
      label: "Single Task",
      active: true,
      content: <SingleTask />,
    },
    {
      label: "Multiple Task",
      active: false,
      content: <MultipleTask />,
    },
    {
      label: "Import",
      active: false,
      content: <ImportTask />,
    },
  ]

  const [datatabs, setDataTabs] = useState(items)

  return (
    <div className={`${styles.overlay} ${styles.open}`}>
      <div className={styles.modal}>
        <button className={styles.closeButton} onClick={onClose}>
          <IoClose size={24} />
        </button>
        <h2 className="font-medium text-heading-6 mb-8">Create Workflow</h2>
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
  )
}

export default CreateWorkflow
