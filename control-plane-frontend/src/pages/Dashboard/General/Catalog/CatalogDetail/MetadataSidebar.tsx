import {
  useCatalog,
  type CatalogTreeItem,
} from "@context/catalog/CatalogContext"
import { IconPencil, IconCheckbox } from "@tabler/icons-react"
import { Button } from "@components/commons"

interface MetadataSidebarProps {
  item: CatalogTreeItem
}

const MetadataSidebar = ({ item }: MetadataSidebarProps) => {
  const { openSetOwnerModal } = useCatalog()

  return (
    <aside className="w-72 flex-shrink-0 xl:p-6 xl:border-l lg:mb-5 border-gray-200 h-full">
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-500 mb-2">
          About this {item.type}
        </h3>
        <div className="flex items-center justify-between text-sm mt-2">
          <span className="text-gray-600">State</span>
          <div className="flex items-center gap-2p-1 rounded-md">
            <IconCheckbox
              size={16}
              className="text-green hover:text-black mr-1"
            />
            <span>Active</span>
          </div>
        </div>
        <div className="flex items-center justify-between text-sm mt-2">
          <span className="text-gray-600">Owner</span>
          <div className="flex items-center gap-2">
            <span className="text-gray-800">{item.owner || "-"}</span>
            <button onClick={() => openSetOwnerModal(item)}>
              <IconPencil
                size={16}
                className="text-gray-500 hover:text-black"
              />
            </button>
          </div>
        </div>
        <div className="flex items-center justify-between text-sm mt-2">
          <span className="text-gray-600">Type</span>
          <div className="flex items-center gap-2">
            <span className="text-gray-800">-</span>
          </div>
        </div>
        <div className="flex items-center justify-between text-sm mt-2">
          <span className="text-gray-600">Data Source</span>
          <div className="flex items-center gap-2">
            <span className="text-gray-800">-</span>
          </div>
        </div>
        <div className="flex items-center justify-between text-sm mt-2">
          <span className="text-gray-600">Popularity</span>
          <div className="flex items-center gap-2">
            <span className="text-gray-800">...</span>
          </div>
        </div>
      </div>
      <div>
        <h3 className="text-sm font-semibold text-gray-500 mb-2">Tags</h3>
        <Button label="Add tags" disabled size="sm" variant="outline" />
      </div>
    </aside>
  )
}

export default MetadataSidebar
