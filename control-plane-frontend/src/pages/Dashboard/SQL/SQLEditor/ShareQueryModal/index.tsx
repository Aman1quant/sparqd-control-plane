import { useState } from "react"
import ReactDOM from "react-dom"
import { useQuery } from "@context/query/QueryContext"
import { Select } from "@components/commons"
import {
  IconSettings,
  IconCopy,
  IconAlertTriangle,
  IconUser,
  IconUsers,
  IconX,
} from "@tabler/icons-react"
import styles from "./ShareQueryModal.module.scss"

const ShareQueryModal = () => {
  const { closeShareModal, activeTab } = useQuery()
  const [permission, setPermission] = useState("Run as owner")

  if (!activeTab) return null

  const credentialOptions = [
    { label: "Run as owner (owner's credential)", value: "Run as owner" },
    { label: "Run as viewer (viewer's credential)", value: "Run as viewer" },
  ]

  return ReactDOM.createPortal(
    <div className={styles.overlay} onClick={closeShareModal}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Sharing: {activeTab.name}</h2>
          <button onClick={closeShareModal} className={styles.closeButton}>
            <IconX size={20} />
          </button>
        </div>
        <div className={styles.content}>
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm">
              Do you want information about permission levels?{" "}
              <a href="#" className="text-primary hover:underline">
                Learn more
              </a>
            </p>
            <IconSettings size={20} className="cursor-pointer text-gray-500" />
          </div>

          <Select
            options={[]}
            placeholder="Type to add multiple users or groups"
            onChange={() => {}}
            value=""
          />

          <div className="mt-6 space-y-3">
            <h3 className="font-semibold text-sm text-gray-500">
              People with access
            </h3>
            <div className="flex justify-between items-center text-sm py-2">
              <div className="flex items-center gap-3">
                <IconUser size={20} />
                <span>farhan@gmail.com</span>
              </div>
              <span>Can Manage (inherited)</span>
            </div>
            <div className="flex justify-between items-center text-sm py-2">
              <div className="flex items-center gap-3">
                <IconUsers size={20} />
                <span>Admins</span>
              </div>
              <span className="flex items-center gap-1 text-yellow-900">
                <IconAlertTriangle size={16} /> Can Run (inherited)
              </span>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="font-semibold text-sm mb-2">Sharing settings</h3>
            <Select
              label="Credentials"
              options={credentialOptions}
              value={permission}
              onChange={(val) => setPermission(String(val))}
            />
          </div>

          <div className="mt-4 bg-yellow-50 border border-yellow-300 text-yellow-900 text-sm rounded-md p-3 flex gap-3">
            <IconAlertTriangle size={20} className="flex-shrink-0 mt-0.5" />
            <span>
              When Run as owner is selected, then all viewers will see the
              results from the latest scheduled or manual refresh. Additional
              editors and managers are not allowed so any users or groups with
              Can Manage or Can Edit will be downgraded to Can Run.
            </span>
          </div>
        </div>
        <div className={styles.footer}>
          <button className="flex items-center gap-2 text-primary font-semibold text-sm hover:underline">
            <IconCopy size={18} />
            <span>Copy link</span>
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}

export default ShareQueryModal
