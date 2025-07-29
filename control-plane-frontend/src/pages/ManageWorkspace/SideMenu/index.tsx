import {
  IconCircleDashedCheck,
  IconCloud,
  IconSitemap,
  IconUsers,
} from "@tabler/icons-react"
import styles from "./SideMenu.module.scss"

type ManageWorkspaceItem = {
  id: string
  name: string
  type: "workspace" | "compute" | "user" | "role"
}

const initialData: ManageWorkspaceItem[] = [
  { id: "1", name: "Workspace", type: "workspace" },
  { id: "2", name: "Compute", type: "compute" },
  { id: "3", name: "User Management", type: "user" },
  { id: "4", name: "Role", type: "role" },
]

type SideMenuProps = {
  activeTab: "workspace" | "compute" | "user" | "role"
  setActiveTab: (tab: "workspace" | "compute" | "user" | "role") => void
}

export default function SideMenu({ activeTab, setActiveTab }: SideMenuProps) {
  const getIcon = (type: ManageWorkspaceItem["type"]) => {
    switch (type) {
      case "workspace":
        return <IconSitemap size={18} className="text-black" />
      case "compute":
        return <IconCloud size={18} className="text-black" />
      case "user":
        return <IconUsers size={18} className="text-black" />
      case "role":
        return <IconCircleDashedCheck size={18} className="text-black" />
      default:
        return null
    }
  }

  return (
    <div className="flex">
      <aside className={styles.panel}>
        <div className={styles.treeContainer}>
          {initialData.map((item) => {
            const isActive = activeTab === item.type
            return (
              <div
                key={item.id}
                className={`${styles.itemWrapper} ${
                  isActive ? styles.itemActive : ""
                }`}
                onClick={() => setActiveTab(item.type)}
              >
                {getIcon(item.type)}
                <div className={styles.itemTextContainer}>
                  <span className={styles.itemText} title={item.name}>
                    {item.name}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </aside>
    </div>
  )
}
