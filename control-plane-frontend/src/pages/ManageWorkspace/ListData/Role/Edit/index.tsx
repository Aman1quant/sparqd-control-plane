import { useState, useEffect } from "react"
import ReactDOM from "react-dom"
import { Button } from "@components/commons"
import styles from "./RoleEdit.module.scss"
import TextInput from "@components/commons/TextInput"
import { useRoleManagement } from "@context/role/RoleContext"

const RoleEdit = () => {
  const { closeEditModal, editingRole, updateRole } = useRoleManagement()
  const [roleData, setRoleData] = useState(editingRole)

  useEffect(() => {
    setRoleData(editingRole)
  }, [editingRole])

  if (!roleData) return null

  const handleInputChange = (field: string, value: string) => {
    setRoleData((prev) => (prev ? { ...prev, [field]: value } : null))
  }

  const handleSave = () => {
    updateRole(roleData.id, roleData)
  }

  return ReactDOM.createPortal(
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>Edit role: {editingRole?.name}</h2>
          <button onClick={closeEditModal} className={styles.closeButton}>
            &times;
          </button>
        </div>
        <div className={styles.content}>
          <div className="space-y-4 mt-4">
            <TextInput
              label="Role name*"
              value={roleData.name}
              onChange={(val) => handleInputChange("name", val)}
            />
            <textarea
              placeholder="Description"
              value={roleData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              className={styles.textarea}
              rows={3}
            />
          </div>
        </div>
        <div className={styles.footer}>
          <Button label="Cancel" variant="outline" onClick={closeEditModal} />
          <Button label="Save" variant="solid" onClick={handleSave} />
        </div>
      </div>
    </div>,
    document.body,
  )
}

export default RoleEdit
