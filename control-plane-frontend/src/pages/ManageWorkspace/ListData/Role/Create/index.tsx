import { useState } from "react"
import ReactDOM from "react-dom"
import { Button } from "@components/commons"
import styles from "./RoleCreate.module.scss"
import TextInput from "@components/commons/TextInput"
import { useRoleManagement } from "@context/role/RoleContext"

const RoleCreate = () => {
  const { closeAddRoleModal, addRole } = useRoleManagement()
  const [roleName, setRoleName] = useState("")
  const [description, setDescription] = useState("")

  const handleSubmit = () => {
    if (!roleName) {
      alert("Role name is required")
      return
    }
    addRole(roleName, description)
  }

  return ReactDOM.createPortal(
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>Add role</h2>
          <button onClick={closeAddRoleModal} className={styles.closeButton}>
            &times;
          </button>
        </div>
        <div className={styles.content}>
          <div className="space-y-4">
            <TextInput
              label="Role name"
              value={roleName}
              onChange={setRoleName}
              placeholder="Enter a role name"
            />
            <textarea
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={styles.textarea}
              rows={3}
            />
          </div>
        </div>
        <div className={styles.footer}>
          <Button
            label="Cancel"
            variant="outline"
            onClick={closeAddRoleModal}
          />
          <Button label="Add role" variant="solid" onClick={handleSubmit} />
        </div>
      </div>
    </div>,
    document.body,
  )
}

export default RoleCreate
