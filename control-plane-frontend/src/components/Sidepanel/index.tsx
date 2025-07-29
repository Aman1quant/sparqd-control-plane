import { useState, useRef, useEffect } from "react"
import { BsChevronDown, BsChevronRight } from "react-icons/bs"
import styles from "./Sidepanel.module.scss"
import {
  IconFileText,
  IconFolderFilled,
  IconHome2,
  IconStar,
  IconTrash,
} from "@tabler/icons-react"

type WorkspaceItem = {
  id: string
  name: string
  type: "home" | "folder" | "notebook" | "favorites" | "trash"
  children?: WorkspaceItem[]
}

const initialData: WorkspaceItem[] = [
  { id: "1", name: "Home", type: "home" },
  {
    id: "2",
    name: "Shared",
    type: "folder",
    children: [
      {
        id: "2-1",
        name: "Project A",
        type: "folder",
        children: [
          { id: "2-1-1", name: "Data Cleaning", type: "notebook" },
          { id: "2-1-2", name: "EDA", type: "notebook" },
        ],
      },
    ],
  },
  {
    id: "3",
    name: "Users",
    type: "folder",
    children: [
      {
        id: "3-1",
        name: "you@databricks.com",
        type: "folder",
        children: [{ id: "3-1-1", name: "My Notebook", type: "notebook" }],
      },
    ],
  },
  { id: "4", name: "Favorites", type: "favorites" },
  { id: "5", name: "Trash", type: "trash" },
]

type SidepanelProps = {
  activeTab: "home" | "favorites" | "trash"
  setActiveTab: (tab: "home" | "favorites" | "trash") => void
}

export default function Sidepanel({ activeTab, setActiveTab }: SidepanelProps) {
  const [workspaceData, setWorkspaceData] = useState(initialData)
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const [editingId, setEditingId] = useState<string | null>(null)
  const [contextMenu, setContextMenu] = useState<{
    id: string
    top: number
    left: number
  } | null>(null)
  const [panelWidth, setPanelWidth] = useState(200)

  const panelRef = useRef<HTMLDivElement>(null)
  const isDraggingRef = useRef(false)

  const MAX_PANEL_WIDTH = 380
  const MIN_PANEL_WIDTH = 150

  const startResize = () => {
    isDraggingRef.current = true
    document.body.style.cursor = "col-resize"
  }

  const stopResize = () => {
    isDraggingRef.current = false
    document.body.style.cursor = "default"
  }

  const resize = (e: MouseEvent) => {
    if (isDraggingRef.current && panelRef.current) {
      const panelLeft = panelRef.current.getBoundingClientRect().left
      const newWidth = Math.min(
        MAX_PANEL_WIDTH,
        Math.max(MIN_PANEL_WIDTH, e.clientX - panelLeft),
      )
      setPanelWidth(newWidth)
    }
  }

  useEffect(() => {
    window.addEventListener("mousemove", resize)
    window.addEventListener("mouseup", stopResize)
    return () => {
      window.removeEventListener("mousemove", resize)
      window.removeEventListener("mouseup", stopResize)
    }
  }, [])

  useEffect(() => {
    const handleClickOutside = () => setContextMenu(null)
    if (contextMenu) {
      window.addEventListener("click", handleClickOutside)
    }
    return () => window.removeEventListener("click", handleClickOutside)
  }, [contextMenu])

  const toggleExpand = (id: string) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const handleRightClick = (
    e: React.MouseEvent<Element, MouseEvent>,
    id: string,
  ) => {
    e.preventDefault()
    if (panelRef.current) {
      const rect = panelRef.current.getBoundingClientRect()
      const offsetX = Math.min(e.clientX - rect.left, panelWidth - 160)
      const offsetY = e.clientY - rect.top

      setContextMenu({
        id,
        top: offsetY,
        left: offsetX,
      })
    }
  }

  const handleRename = (
    id: string,
    newName: string,
    items = workspaceData,
  ): WorkspaceItem[] => {
    return items.map((item) => {
      if (item.id === id) return { ...item, name: newName }
      if (item.children)
        return { ...item, children: handleRename(id, newName, item.children) }
      return item
    })
  }

  const handleAddItem = (parentId: string, type: "folder" | "notebook") => {
    const newItem: WorkspaceItem = {
      id: Math.random().toString(),
      name: type === "folder" ? "New Folder" : "New Notebook",
      type,
    }

    const addToParent = (items: WorkspaceItem[]): WorkspaceItem[] =>
      items.map((item) => {
        if (item.id === parentId && item.type === "folder") {
          const children = item.children
            ? [...item.children, newItem]
            : [newItem]
          return { ...item, children }
        } else if (item.children) {
          return { ...item, children: addToParent(item.children) }
        }
        return item
      })

    setWorkspaceData((prev) => addToParent(prev))
    setExpanded((prev) => ({ ...prev, [parentId]: true }))
  }

  const deleteItem = (
    items: WorkspaceItem[],
    idToDelete: string,
  ): WorkspaceItem[] =>
    items
      .filter((item) => item.id !== idToDelete)
      .map((item) =>
        item.children
          ? { ...item, children: deleteItem(item.children, idToDelete) }
          : item,
      )

  const getIcon = (type: WorkspaceItem["type"]) => {
    switch (type) {
      case "home":
        return <IconHome2 size={18} className="text-black" />
      case "favorites":
        return <IconStar size={18} className="text-black" />
      case "trash":
        return <IconTrash size={18} className="text-black" />
      case "folder":
        return <IconFolderFilled size={18} className="text-primary-800" />
      case "notebook":
        return <IconFileText size={18} className="text-black" />
      default:
        return null
    }
  }

  const renderItems = (items: WorkspaceItem[], level = 0) =>
    items.map((item) => {
      const canExpand = item.type === "folder"
      const isOpen = expanded[item.id]
      const icon = getIcon(item.type)

      const isTabItem =
        item.type === "home" ||
        item.type === "favorites" ||
        item.type === "trash"

      const isActive = activeTab === item.type

      return (
        <div
          key={item.id}
          style={{ paddingLeft: level * 16 }}
          onContextMenu={(e) => handleRightClick(e, item.id)}
          onClick={() => {
            if (isTabItem)
              setActiveTab(item.type as "home" | "favorites" | "trash")
          }}
        >
          <div
            className={`${styles.itemWrapper} ${
              isActive ? styles.itemActive : ""
            }`}
          >
            {canExpand && item.children ? (
              isOpen ? (
                <BsChevronDown
                  size={14}
                  onClick={() => toggleExpand(item.id)}
                />
              ) : (
                <BsChevronRight
                  size={14}
                  onClick={() => toggleExpand(item.id)}
                />
              )
            ) : (
              <span className="w-[14px]" />
            )}
            {icon}
            {editingId === item.id ? (
              <input
                autoFocus
                className={styles.inputRename}
                defaultValue={item.name}
                onBlur={(e) => {
                  setWorkspaceData(handleRename(item.id, e.target.value))
                  setEditingId(null)
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    setWorkspaceData(
                      handleRename(
                        item.id,
                        (e.target as HTMLInputElement).value,
                      ),
                    )
                    setEditingId(null)
                  } else if (e.key === "Escape") {
                    setEditingId(null)
                  }
                }}
              />
            ) : (
              <div className={styles.itemTextContainer}>
                <span
                  className={styles.itemText}
                  title={item.name}
                  onDoubleClick={() => {
                    if (!isTabItem) setEditingId(item.id)
                  }}
                >
                  {item.name}
                </span>
              </div>
            )}
          </div>
          {canExpand &&
            isOpen &&
            item.children &&
            renderItems(item.children, level + 1)}
        </div>
      )
    })

  return (
    <div className="flex">
      <aside
        ref={panelRef}
        className={styles.panel}
        style={{ width: panelWidth }}
      >
        <div className={styles.treeContainer}>{renderItems(workspaceData)}</div>

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
              onClick={() => {
                handleAddItem(contextMenu.id, "folder")
                setContextMenu(null)
              }}
            >
              Add Folder
            </div>
            <div
              className={styles.contextMenuItem}
              onClick={() => {
                handleAddItem(contextMenu.id, "notebook")
                setContextMenu(null)
              }}
            >
              Add Notebook
            </div>
            <div
              className={styles.contextMenuItem}
              onClick={() => {
                setWorkspaceData((prev) => deleteItem(prev, contextMenu.id))
                setContextMenu(null)
              }}
            >
              Delete
            </div>
          </div>
        )}
      </aside>
      <div className={styles.resizer} onMouseDown={startResize} />
    </div>
  )
}
