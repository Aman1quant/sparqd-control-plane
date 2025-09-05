import type { TabType } from "../../types/tabs"
import ObjectFile from "./Content/ObjectFile"
import FileBrowser from "./Content/FileBrowser"
import { IconX } from "@tabler/icons-react"

interface SideCatalogProps {
  activeTab: TabType
  onClose: () => void
}

export const SideCatalog = ({ activeTab, onClose }: SideCatalogProps) => {
  const getTitle = () => {
    switch (activeTab) {
      case "object_file":
        return "Object Storage Browser"
      case "file_browser":
        return "File Browser"
      case "run":
        return "Running Terminals and Kernels"
      case "git":
        return "Git"
      case "table_contents":
        return "Table of Contents"
      case "extension":
        return "Extension Manager"
      default:
        return ""
    }
  }

  const renderContent = () => {
    switch (activeTab) {
      case "object_file":
        return <FileBrowser type="object_file" />
      case "file_browser":
        return <FileBrowser type="browser" />
      case "run":
      case "git":
      case "table_contents":
      case "extension":
        return <ObjectFile />
      default:
        return null
    }
  }

  return (
    <div className="h-full w-full p-3 overflow-auto relative border-r boder-black-100">
      <div className="flex items-center justify-between mb-4">
        <label className="text-body-large">{getTitle()}</label>
        <button
          className="text-black p-1 rounded hover:bg-black-50"
          onClick={onClose}
          aria-label="Close"
        >
          <IconX size={16} />
        </button>
      </div>
      {renderContent()}
    </div>
  )
}
