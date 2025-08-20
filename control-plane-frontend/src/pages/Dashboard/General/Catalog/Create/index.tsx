import { useState } from "react"
import ReactDOM from "react-dom"
import { useCatalog } from "@context/catalog/CatalogContext"
import { Button, Checkbox, TextInput, Select } from "@components/commons"
import { IconInfoCircle, IconExternalLink } from "@tabler/icons-react"
import styles from "./Create.module.scss"

const Create = () => {
  const { closeCreateModal, handleCreateCatalog } = useCatalog()
  const [catalogName, setCatalogName] = useState("")
  const [catalogType, setCatalogType] = useState("Standard")
  const [useDefaultStorage, setUseDefaultStorage] = useState(true)
  const [externalLocation, setExternalLocation] = useState("")
  const [subPath, setSubPath] = useState("")
  const [nameError, setNameError] = useState("")

  const typeOptions = [{ label: "Standard", value: "Standard" }]
  const locationOptions = [
    { label: "Select external location", value: "" },
    { label: "s3://my-bucket/location1", value: "loc1" },
  ]

  const validateName = (name: string) => {
    if (/[.\s/]/.test(name)) {
      setNameError("Name cannot include period, space, or forward-slash")
      return false
    }
    setNameError("")
    return true
  }

  const handleNameChange = (name: string) => {
    setCatalogName(name)
    validateName(name)
  }

  const handleSubmit = () => {
    if (!validateName(catalogName) || !catalogName) {
      alert("Please fix the errors before creating.")
      return
    }
    handleCreateCatalog({ name: catalogName, type: catalogType })
  }

  return ReactDOM.createPortal(
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>Create a new catalog</h2>
          <button onClick={closeCreateModal} className={styles.closeButton}>
            &times;
          </button>
        </div>
        <div className={styles.content}>
          <p className={styles.description}>
            A catalog is the first layer of Unity Catalog's three-level
            namespace and is used to organize your data assets.
          </p>

          <div className="space-y-4 mt-4">
            <TextInput
              label="Catalog name*"
              value={catalogName}
              onChange={handleNameChange}
              placeholder="Enter catalog name"
              helperText={nameError}
            />
            <Select
              label="Type*"
              options={typeOptions}
              value={catalogType}
              onChange={(value) => setCatalogType(String(value))}
            />
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Storage location
              </label>
              <Checkbox
                label="Use default storage"
                checked={useDefaultStorage}
                onChange={setUseDefaultStorage}
              />

              {useDefaultStorage ? (
                <div className="bg-blue-50 border border-blue-200 text-blue-800 text-sm rounded-md p-3 flex gap-3">
                  <IconInfoCircle size={20} className="flex-shrink-0 mt-0.5" />
                  <span>
                    Catalogs that use default storage are only accessible from
                    this workspace by default. You can grant other workspaces
                    access, but they must use serverless compute to access
                    data in the catalog.
                  </span>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    <Select
                      options={locationOptions}
                      value={externalLocation}
                      onChange={(value) => setExternalLocation(String(value))}
                      className="flex-grow min-w-[200px]"
                    />
                    <TextInput
                      placeholder="sub/path"
                      value={subPath}
                      onChange={setSubPath}
                      className="flex-grow min-w-[150px]"
                    />
                  </div>
                  <button className="flex items-center gap-2 text-sm text-primary hover:underline">
                    <span>Create a new external location</span>
                    <IconExternalLink size={16} />
                  </button>
                  <p className="text-xs text-gray-500">
                    Location in cloud storage where data for managed tables
                    will be stored.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className={styles.footer}>
          <Button
            label="Cancel"
            variant="outline"
            color="primary"
            onClick={closeCreateModal}
          />
          <Button
            label="Create"
            variant="solid"
            color="primary"
            onClick={handleSubmit}
            disabled={!!nameError}
          />
        </div>
      </div>
    </div>,
    document.body
  )
}

export default Create