import { useState, useEffect } from "react"
import ReactDOM from "react-dom"
import { useCatalog } from "@context/catalog/CatalogContext"
import { Button, Select } from "@components/commons"
import styles from "./SetOwnerModal.module.scss"

const SetOwnerModal = () => {
  const {
    closeSetOwnerModal,
    itemToChangeOwner,
    handleSetOwner,
    availableOwners,
  } = useCatalog()

  const [newOwner, setNewOwner] = useState("")

  useEffect(() => {
    if (itemToChangeOwner) {
      setNewOwner(itemToChangeOwner.owner || "")
    }
  }, [itemToChangeOwner])

  if (!itemToChangeOwner) return null

  const handleSave = () => {
    handleSetOwner(itemToChangeOwner.id, newOwner)
  }

  const ownerOptions = availableOwners.map((owner) => ({
    label: owner,
    value: owner,
  }))

  return ReactDOM.createPortal(
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>
            Set owner for {itemToChangeOwner.name}
          </h2>
          <button onClick={closeSetOwnerModal} className={styles.closeButton}>
            &times;
          </button>
        </div>
        <div className={styles.content}>
          <Select
            label="Select a new owner"
            options={ownerOptions}
            value={newOwner}
            onChange={(val) => setNewOwner(String(val))}
          />
        </div>
        <div className={styles.footer}>
          <Button
            label="Cancel"
            variant="outline"
            onClick={closeSetOwnerModal}
          />
          <Button label="Save" variant="solid" onClick={handleSave} />
        </div>
      </div>
    </div>,
    document.body
  )
}

export default SetOwnerModal