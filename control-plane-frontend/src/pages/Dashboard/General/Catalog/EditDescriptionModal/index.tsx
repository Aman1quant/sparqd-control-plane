import { useState, useEffect } from "react"
import ReactDOM from "react-dom"
import { useCatalog } from "@context/catalog/CatalogContext"
import { Button } from "@components/commons"
import styles from "./EditDescriptionModal.module.scss"

const EditDescriptionModal = () => {
  const { closeEditModal, editingItem, handleUpdateDescription } = useCatalog()
  const [description, setDescription] = useState("")

  useEffect(() => {
    if (editingItem) {
      setDescription(editingItem.description || "")
    }
  }, [editingItem])

  if (!editingItem) return null

  const handleSave = () => {
    handleUpdateDescription(editingItem.id, description)
  }

  return ReactDOM.createPortal(
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>
            Edit the description for {editingItem.name}
          </h2>
          <button onClick={closeEditModal} className={styles.closeButton}>
            &times;
          </button>
        </div>
        <div className={styles.content}>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={styles.textarea}
            rows={4}
          />
          <p className={styles.supportText}>Supports basic Markdown.</p>
        </div>
        <div className={styles.footer}>
          <Button
            label="Cancel"
            variant="outline"
            color="primary"
            onClick={closeEditModal}
          />
          <Button
            label="Save"
            variant="solid"
            color="primary"
            onClick={handleSave}
          />
        </div>
      </div>
    </div>,
    document.body
  )
}

export default EditDescriptionModal