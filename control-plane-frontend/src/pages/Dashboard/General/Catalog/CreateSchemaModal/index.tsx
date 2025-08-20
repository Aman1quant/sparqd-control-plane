import { useState } from "react"
import ReactDOM from "react-dom"
import { useCatalog } from "@context/catalog/CatalogContext"
import { Button, TextInput, Select } from "@components/commons"
import { IconExternalLink } from "@tabler/icons-react"
import styles from "./CreateSchemaModal.module.scss"

const CreateSchemaModal = () => {
  const { closeCreateSchemaModal, handleCreateSchema, itemToChangeOwner } =
    useCatalog()
  const [schemaName, setSchemaName] = useState("")
  const [comment, setComment] = useState("")
  const [location, setLocation] = useState("")
  const [subPath, setSubPath] = useState("")

  const locationOptions = [
    { label: "Select external location", value: "" },
    { label: "s3://my-bucket/location1", value: "loc1" },
  ]

  const handleSubmit = () => {
    if (!schemaName) {
      alert("Schema name is required")
      return
    }
    handleCreateSchema(itemToChangeOwner!.id, { name: schemaName, comment })
  }

  return ReactDOM.createPortal(
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>Create a new schema</h2>
          <button
            onClick={closeCreateSchemaModal}
            className={styles.closeButton}
          >
            &times;
          </button>
        </div>
        <div className={styles.content}>
          <p className={styles.description}>
            A schema is the second layer of Unity Catalog's three-level
            namespace and organizes tables and views.
          </p>
          <div className="space-y-4 mt-6">
            <TextInput
              label="Schema name*"
              value={schemaName}
              onChange={setSchemaName}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Storage location
              </label>
              <div className="grid grid-cols-2 gap-2">
                <Select
                  options={locationOptions}
                  value={location}
                  onChange={(val) => setLocation(String(val))}
                />
                <TextInput
                  placeholder="sub/path"
                  value={subPath}
                  onChange={setSubPath}
                />
              </div>
              <button className="flex items-center gap-2 text-sm text-primary hover:underline mt-2">
                <span>Create a new external location</span>
                <IconExternalLink size={16} />
              </button>
            </div>
            <div>
              <label
                htmlFor="comment"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Comment
              </label>
              <textarea
                id="comment"
                rows={4}
                className={styles.textarea}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </div>
          </div>
        </div>
        <div className={styles.footer}>
          <Button
            label="Cancel"
            variant="outline"
            onClick={closeCreateSchemaModal}
          />
          <Button label="Create" variant="solid" onClick={handleSubmit} />
        </div>
      </div>
    </div>,
    document.body
  )
}

export default CreateSchemaModal