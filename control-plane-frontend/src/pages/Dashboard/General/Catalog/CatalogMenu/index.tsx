import { useState, useEffect, useRef } from "react"
import { useLocation } from "react-router-dom"
import {
  BiChevronDown,
  BiChevronRight,
  BiPlus,
  BiLoaderAlt,
} from "react-icons/bi"
import { IoSettingsOutline } from "react-icons/io5"
import { useCatalog } from "@context/catalog/CatalogContext"
import Dropdown from "@components/commons/Dropdown"
import TreeItem from "./TreeItem"
import type { CatalogTreeItem as TItem } from "@context/catalog/CatalogContext"
import { IconRefresh } from "@tabler/icons-react"
import { Search } from "@components/commons/Search"

const CatalogMenu = () => {
  const {
    isLoading,
    filteredSectionedTreeData,
    openSection,
    toggleSection,
    searchQuery,
    setSearchQuery,
    openCreateModal,
    handleRenameItem,
    handleAddItem,
    handleDeleteItem,
    refreshCatalogs,
    sectionedTreeData,
    expandNodes,
  } = useCatalog()

  const location = useLocation()
  const { pathname } = location
  const [panelWidth, setPanelWidth] = useState(225)
  const panelRef = useRef<HTMLDivElement>(null)

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    const startWidth = panelRef.current?.offsetWidth || panelWidth
    const startX = e.clientX

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const newWidth = startWidth + (moveEvent.clientX - startX)

      const clampedWidth = Math.min(500, Math.max(200, newWidth))
      setPanelWidth(clampedWidth)
    }

    const handleMouseUp = () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseup", handleMouseUp)
    }

    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("mouseup", handleMouseUp)
  }

  const [editingId, setEditingId] = useState<string | null>(null)
  const [contextMenu, setContextMenu] = useState<{
    id: string
    top: number
    left: number
    type: TItem["type"]
  } | null>(null)

  const handleRightClick = (e: React.MouseEvent, item: TItem) => {
    e.preventDefault()
    setContextMenu({
      id: item.id,
      top: e.clientY,
      left: e.clientX,
      type: item.type,
    })
  }

  useEffect(() => {
    const handleClickOutside = () => setContextMenu(null)
    if (contextMenu) {
      window.addEventListener("click", handleClickOutside)
    }
    return () => window.removeEventListener("click", handleClickOutside)
  }, [contextMenu])

  useEffect(() => {
    if (!sectionedTreeData || sectionedTreeData.length === 0) {
      return
    }

    const pathParts = location.pathname.split("/").filter(Boolean)

    if (pathParts.length < 3 || pathParts[1] !== "catalog") {
      return
    }

    const catalogName = pathParts[2]
    const schemaName = pathParts[3]
    const idsToExpand: string[] = []

    for (const section of sectionedTreeData) {
      const catalogItem = section.items.find(
        (item: TItem) => item.name === catalogName,
      )

      if (catalogItem) {
        idsToExpand.push(catalogItem.id)

        if (schemaName && catalogItem.children) {
          const schemaItem = catalogItem.children.find(
            (child: TItem) => child.name === schemaName,
          )
          if (schemaItem) {
            idsToExpand.push(schemaItem.id)
          }
        }
        break
      }
    }
    if (idsToExpand.length > 0) {
      expandNodes(idsToExpand)
    }
  }, [location.pathname, sectionedTreeData, expandNodes])

  const settingsMenuItems = [
    { label: "Clean Rooms", onClick: () => {} },
    { label: "External Locations", onClick: () => {} },
    { label: "Credentials", onClick: () => {} },
    { label: "Connections", onClick: () => {} },
    { label: "External Metadata", onClick: () => {} },
    { divider: true },
    {
      onClick: () => {},
      label: (
        <div className="flex flex-col items-start pe-2">
          <span className="text-xs text-gray-500">Metastore</span>
          <span className="mt-1 bg-gray-100 text-gray-800 px-2 py-1 rounded-md text-sm">
            metastore_aws_ap_southeast_2
          </span>
        </div>
      ),
    },
  ]

  const addMenuItems = [
    { label: "Add Data", onClick: () => {} },
    { label: "Ingest via partner", onClick: () => {} },
    { label: "Upload to volume", onClick: () => {} },
    { divider: true },
    { label: "Create a catalog", onClick: openCreateModal },
    { label: "Create an external location", onClick: () => {} },
    { label: "Create a credential", onClick: () => {} },
    { label: "Create a connection", onClick: () => {} },
  ]

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  const renderContextMenu = () => {
    if (!contextMenu) return null

    const menuItems = []

    menuItems.push(
      <div
        key="rename"
        className="px-3 py-1.5 text-sm hover:bg-gray-100 cursor-pointer rounded"
        onClick={() => {
          setEditingId(contextMenu.id)
          setContextMenu(null)
        }}
      >
        Rename
      </div>,
    )

    if (contextMenu.type === "catalog") {
      menuItems.push(
        <div
          key="add-schema"
          className="px-3 py-1.5 text-sm hover:bg-gray-100 cursor-pointer rounded"
          onClick={() => {
            handleAddItem(contextMenu.id, "schema")
            setContextMenu(null)
          }}
        >
          Add Schema
        </div>,
      )
    }
    menuItems.push(
      <div
        key="delete"
        className="px-3 py-1.5 text-sm hover:bg-gray-100 cursor-pointer rounded"
        onClick={() => {
          handleDeleteItem(contextMenu.id)
          setContextMenu(null)
        }}
      >
        Delete
      </div>,
    )

    return (
      <div
        className="absolute z-50 w-40 bg-white shadow-lg rounded-md border border-gray-200 p-1"
        style={{ top: contextMenu.top, left: contextMenu.left }}
        onClick={(e) => e.stopPropagation()}
      >
        {menuItems}
      </div>
    )
  }

  return (
    <div className="flex">
      <aside
        ref={panelRef}
        style={{ width: panelWidth }}
        className="flex flex-col flex-shrink-0 bg-white border-r"
      >
        <div className="flex-grow overflow-auto ">
          <div className="flex items-center justify-between px-4 py-3 border-b flex-shrink-0">
            <h2 className="font-bold text-lg">Catalog</h2>
            <div className="flex items-center gap-1">
              <Dropdown
                items={settingsMenuItems}
                theme="link"
                size="sm"
                showArrow={false}
                label={<IoSettingsOutline className="text-gray-600 text-lg" />}
              />
              <button
                className="hover:bg-gray-100 p-1 rounded"
                onClick={() => refreshCatalogs()}
                disabled={isLoading}
              >
                {isLoading ? (
                  <BiLoaderAlt className="text-gray-600 text-lg animate-spin" />
                ) : (
                  <IconRefresh size={16} className="text-gray-600 text-lg" />
                )}
              </button>
              <Dropdown
                items={addMenuItems}
                theme="link"
                size="sm"
                showArrow={false}
                label={<BiPlus className="text-gray-600 text-lg" />}
              />
            </div>
          </div>

          <div className="p-2 flex-shrink-0">
            <Search
              placeholder="Search catalog..."
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>

          <div className="p-2 overflow-auto flex-grow h-[75vh] overflow-y-auto">
            <div>
              {isLoading && filteredSectionedTreeData.length === 0 ? (
                <div className="text-center text-gray-500 text-sm p-4">
                  Loading...
                </div>
              ) : (
                filteredSectionedTreeData.map((section) => (
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
                      <span className="text-sm font-semibold text-gray-700 truncate flex-1 max-w-[180px]">
                        {section.title}
                      </span>
                    </div>
                    {(openSection === section.title || searchQuery) && (
                      <div className="pl-2">
                        {section.items.map((item) => (
                          <TreeItem
                            key={item.id}
                            item={item}
                            level={0}
                            parentPath="/admin/catalog"
                            editingId={editingId}
                            onStartRename={setEditingId}
                            onCancelRename={() => setEditingId(null)}
                            onSaveRename={handleRenameItem}
                            onRightClick={handleRightClick}
                            activePath={pathname}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
          {renderContextMenu()}
        </div>
      </aside>
      <div
        className="w-1 cursor-col-resize bg-white"
        onMouseDown={handleMouseDown}
      />
    </div>
  )
}

export default CatalogMenu
