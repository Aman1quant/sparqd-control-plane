import { useState, useRef, useEffect } from "react"
import { BiChevronDown, BiChevronRight } from "react-icons/bi"
import {
  useCatalog,
  type CatalogTreeItem,
} from "@context/catalog/CatalogContext"
import {
  IconBox,
  IconDatabase,
  IconTable,
  IconFileText,
  IconColumns,
  IconDotsVertical,
  IconArrowRight,
  IconRefresh,
} from "@tabler/icons-react"
import { useQuery } from "@context/query/QueryContext"
import styles from "./SQLMenu.module.scss"

const SQLMenu = () => {
  const {
    filteredSectionedTreeData,
    expandedNodes,
    toggleNode,
    openSection,
    toggleSection,
    searchQuery,
    setSearchQuery,
    refreshCatalogs,
  } = useCatalog()

  const { updateTabSql, activeTabId, activeTab } = useQuery()

  const [editingId, setEditingId] = useState<string | null>(null)
  const [contextMenu, setContextMenu] = useState<{
    id: string
    top: number
    left: number
  } | null>(null)
  const [panelWidth, setPanelWidth] = useState(225)
  const [actionMenuId, setActionMenuId] = useState<string | null>(null)

  const panelRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    const startWidth = panelRef.current?.offsetWidth || panelWidth
    const startX = e.clientX

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const newWidth = startWidth + (moveEvent.clientX - startX)
      const clampedWidth = Math.min(700, Math.max(200, newWidth))
      setPanelWidth(clampedWidth)
    }

    const handleMouseUp = () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseup", handleMouseUp)
    }

    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("mouseup", handleMouseUp)
  }

  useEffect(() => {
    const handleClickOutside = () => setContextMenu(null)
    if (contextMenu) {
      window.addEventListener("click", handleClickOutside)
    }
    return () => window.removeEventListener("click", handleClickOutside)
  }, [contextMenu])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActionMenuId(null)
      }
    }
    if (actionMenuId) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [actionMenuId])

  const handleRightClick = (e: React.MouseEvent, id: string) => {
    e.preventDefault()
    setContextMenu({ id, top: e.clientY, left: e.clientX })
  }

  const handleAction = (action: string, id: string) => {
    alert(
      `Fungsi "${action}" dipanggil untuk item ${id}. Logika untuk mengubah data harus ditambahkan di CatalogContext.`,
    )
    setContextMenu(null)
  }

  const getIcon = (type: CatalogTreeItem["type"]) => {
    switch (type) {
      case "catalog":
        return <IconBox size={18} />
      case "schema":
        return <IconDatabase size={18} />
      case "table":
        return <IconTable size={18} />
      case "column":
        return <IconColumns size={18} />
      default:
        return <IconFileText size={18} />
    }
  }

  const renderItems = (
    items: CatalogTreeItem[],
    level = 0,
    parentPath = "",
  ) => {
    return items.map((item) => {
      const currentPath = parentPath ? `${parentPath}.${item.name}` : item.name

      const handleCopyPath = (e: React.MouseEvent) => {
        e.stopPropagation()
        navigator.clipboard.writeText(currentPath)
        setActionMenuId(null)
      }

      const handleInsertToEditor = (e: React.MouseEvent) => {
        e.stopPropagation()

        if (activeTab && activeTabId) {
          const sqlToInsert = `${currentPath}`
          const existingSql = activeTab.sql
          const newSql = existingSql.trim()
            ? `${existingSql} ${sqlToInsert}`
            : sqlToInsert
          updateTabSql(activeTabId, newSql)
        }
      }

      return (
        <div
          key={item.id}
          style={{ paddingLeft: level * 16 }}
          className="relative"
        >
          <div
            className={`${styles.itemWrapper} group`}
            onContextMenu={(e) => handleRightClick(e, item.id)}
          >
            <span className="w-5 inline-block text-center shrink-0">
              {item.type !== "column" && (
                <button
                  onClick={() => toggleNode(item.id)}
                  className="align-middle"
                >
                  {expandedNodes.has(item.id) ? (
                    <BiChevronDown size={16} />
                  ) : (
                    <BiChevronRight size={16} />
                  )}
                </button>
              )}
            </span>
            <span className="mr-1 shrink-0">{getIcon(item.type)}</span>
            {editingId === item.id ? (
              <input
                autoFocus
                className={styles.inputRename}
                defaultValue={item.name}
                onBlur={() => setEditingId(null)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleAction(
                      `Rename to "${(e.target as HTMLInputElement).value}"`,
                      item.id,
                    )
                    setEditingId(null)
                  } else if (e.key === "Escape") {
                    setEditingId(null)
                  }
                }}
              />
            ) : (
              <div className="truncate flex-1">
                <span
                  className={styles.itemText}
                  onDoubleClick={() => setEditingId(item.id)}
                >
                  {item.name}
                </span>
              </div>
            )}
            {
              <div className="ml-auto flex items-center invisible group-hover:visible">
                <button
                  className="p-1 rounded hover:bg-gray-200"
                  title="Insert into editor"
                  onClick={handleInsertToEditor}
                >
                  <IconArrowRight size={16} />
                </button>
                <button
                  className="p-1 rounded hover:bg-gray-200"
                  onClick={(e) => {
                    e.stopPropagation()
                    setActionMenuId(item.id === actionMenuId ? null : item.id)
                  }}
                >
                  <IconDotsVertical size={16} />
                </button>
              </div>
            }
          </div>
          {actionMenuId === item.id && (
            <div
              ref={menuRef}
              className="absolute right-2 top-8 z-20 w-48 bg-white shadow-lg rounded-md border border-gray-200 p-1"
            >
              <div className={styles.contextMenuItem} onClick={handleCopyPath}>
                Copy table path
              </div>
            </div>
          )}
          {item.children &&
            expandedNodes.has(item.id) &&
            renderItems(item.children, level + 1, currentPath)}
        </div>
      )
    })
  }

  return (
    <div className="flex h-full">
      <aside
        ref={panelRef}
        className={styles.panel}
        style={{ width: panelWidth }}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h2 className="font-bold text-lg">SQL</h2>
          <div className="flex items-center gap-1">
            <button
              className="mr-2 hover:bg-gray-100 p-1 rounded"
              onClick={refreshCatalogs}
            >
              <IconRefresh size={16} className="text-gray-600 text-lg" />
            </button>
            {/* <button
              className="hover:bg-gray-100 p-1 rounded"
              onClick={() => console.log("close")}
            >
              <IoClose className="text-gray-600 text-lg" />
            </button> */}
          </div>
        </div>

        <div className="p-2">
          <input
            type="text"
            placeholder="Type to search..."
            className="w-full px-2 py-1.5 border rounded-md text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex gap-2 px-2 mb-2">
          <button className="px-3 py-1 text-sm rounded-full bg-blue-50 text-blue-600">
            For you
          </button>
          <button className="px-3 py-1 text-sm rounded-full text-gray-600">
            All
          </button>
        </div>

        <div className={styles.treeContainer}>
          {filteredSectionedTreeData.map((section) => (
            <div key={section.title}>
              <div
                className="flex items-center px-2 py-1 cursor-pointer"
                onClick={() => toggleSection(section.title)}
              >
                {openSection === section.title || searchQuery ? (
                  <BiChevronDown className="mr-1" />
                ) : (
                  <BiChevronRight className="mr-1" />
                )}
                <span className="text-sm font-semibold text-gray-700">
                  {section.title}
                </span>
              </div>
              {(openSection === section.title || searchQuery) && (
                <div className="pl-2">{renderItems(section.items)}</div>
              )}
            </div>
          ))}
        </div>

        {contextMenu && (
          <div
            className={styles.contextMenu}
            style={{ top: contextMenu.top, left: contextMenu.left }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className={styles.contextMenuItem}
              onClick={() => {
                setEditingId(contextMenu.id)
                setContextMenu(null)
              }}
            >
              Rename
            </div>
            <div
              className={styles.contextMenuItem}
              onClick={() => handleAction("Add Schema", contextMenu.id)}
            >
              Add Schema
            </div>
            <div
              className={styles.contextMenuItem}
              onClick={() => handleAction("Delete", contextMenu.id)}
            >
              Delete
            </div>
          </div>
        )}
      </aside>
      <div className={styles.resizer} onMouseDown={handleMouseDown} />
    </div>
  )
}

export default SQLMenu
