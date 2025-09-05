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
import styles from "./WorkspaceShareModal.module.scss"

interface WorkspaceShareModalProps {
  onClose: () => void
  title: string
}

const WorkspaceShareModal: React.FC<WorkspaceShareModalProps> = ({ onClose, title  }) => {
  const { activeTab } = useQuery()

  if (!activeTab) return null

  return ReactDOM.createPortal(
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Sharing: {title}</h2>
          <button onClick={onClose} className={styles.closeButton}>
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

export default WorkspaceShareModal
