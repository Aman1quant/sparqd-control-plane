import ReactDOM from "react-dom"
import { Button } from "@components/commons"
import { IconAlertTriangle } from "@tabler/icons-react"
import styles from "./RoleDelete.module.scss"
import { useRoleManagement } from "@context/role/RoleContext"

const RoleDelete = () => {
  const { closeDeleteModal, deletingRole, deleteRole } = useRoleManagement()

  if (!deletingRole) return null

  const onConfirmDelete = () => {
    deleteRole(deletingRole.id)
  }

  return ReactDOM.createPortal(
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <IconAlertTriangle size={24} className="text-red-500" />
          <h2 className={styles.title}>Confirm delete</h2>
        </div>
        <div className={styles.content}>
          <p className="text-sm text-gray-600">
            Are you sure you want to delete the role "{deletingRole.name}"?
          </p>
          <p className="text-sm text-gray-600 mt-4">
            This action cannot be undone.
          </p>
        </div>
        <div className={styles.footer}>
          <Button label="Cancel" variant="outline" onClick={closeDeleteModal} />
          <Button
            label="Confirm delete"
            variant="solid"
            color="danger"
            onClick={onConfirmDelete}
          />
        </div>
      </div>
    </div>,
    document.body,
  )
}

export default RoleDelete
