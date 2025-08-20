import {
  IconBox,
  IconDatabase,
  IconTable,
  IconChevronDown,
  IconChevronRight,
  IconColumns
} from "@tabler/icons-react"
import { useNavigate } from "react-router-dom"
import {
  useCatalog,
  type CatalogTreeItem as TItem,
} from "@context/catalog/CatalogContext"

const icons = {
  catalog: IconBox,
  schema: IconDatabase,
  table: IconTable,
  column: IconColumns
}

interface TreeItemProps {
  item: TItem
  level: number
  parentPath: string
}

const TreeItem = ({ item, level, parentPath }: TreeItemProps) => {
  const { expandedNodes, toggleNode } = useCatalog()
  const navigate = useNavigate()

  const isExpanded = expandedNodes.has(item.id)
  const hasChildren = item.children && item.children.length > 0
  const Icon = icons[item.type] || IconTable
  const currentPath = `${parentPath}/${item.name}`

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (hasChildren) {
      toggleNode(item.id)
    }
  }

  const handleNavigate = () => {
    navigate(currentPath)
  }

  return (
    <div>
      <div
        className="flex items-center p-1 text-sm hover:bg-gray-50 cursor-pointer rounded"
        style={{ paddingLeft: `${level * 16 + 8}px` }}
      >
        <button
          onClick={handleToggle}
          className="flex items-center justify-center w-6 h-6 rounded hover:bg-gray-200"
        >
          {hasChildren ? (
            isExpanded ? (
              <IconChevronDown size={16} className="text-gray-600" />
            ) : (
              <IconChevronRight size={16} className="text-gray-600" />
            )
          ) : (
            <div className="w-4" />
          )}
        </button>

        <div className="flex items-center flex-1" onClick={handleNavigate}>
          <Icon size={16} className="mx-1 text-gray-500" />
          <span className="text-gray-700">{item.name}</span>
        </div>
      </div>
      {isExpanded &&
        hasChildren && (
          <div>
            {item.children?.map((child) => (
              <TreeItem
                key={child.id}
                item={child}
                level={level + 1}
                parentPath={currentPath}
              />
            ))}
          </div>
        )}
    </div>
  )
}

export default TreeItem