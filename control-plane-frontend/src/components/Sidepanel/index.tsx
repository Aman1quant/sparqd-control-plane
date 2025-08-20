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
import { httpJupyter } from "@http/axios"
import endpoint from "@http/endpoint"
import { useCreateWorkspace } from "@context/workspace/CreateWorkspace"
import { toast } from "react-toastify"

export type WorkspaceItem = {
  id: string
  name: string
  type: "home" | "folder" | "notebook" | "favorites" | "trash" | "file"
  default?: boolean
  active?: boolean
  favorites?: boolean
  fullPath?: string
  children?: WorkspaceItem[]
}

const initialData: WorkspaceItem[] = [
  { id: "1", name: "Home", type: "home" },
  {
    id: "2",
    name: "Shared",
    type: "folder",
  },
  {
    id: "3",
    name: "Users",
    type: "folder",
    children: [
      {
        id: "3-1",
        name: "farhan@gmail.com",
        type: "folder",
        default: true,
        active: true,
      },
    ],
  },
  { id: "4", name: "Favorites", type: "favorites" },
  { id: "5", name: "Trash", type: "trash" },
]

type SidepanelProps = {
  activeTab: "home" | "favorites" | "trash"
  setActiveTab: (tab: "home" | "favorites" | "trash") => void
  selectedPath: string
  setSelectedPath: (path: string) => void
}

export default function Sidepanel({
  activeTab,
  setActiveTab,
  selectedPath,
  setSelectedPath,
}: SidepanelProps) {
  const {
    addApiData,
    createFolder,
    handleNewTab,
    renameFile,
    deleteItemLocal,
  } = useCreateWorkspace()
  const [workspaceData, setWorkspaceData] =
    useState<WorkspaceItem[]>(initialData)
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const [editingId, setEditingId] = useState<string | null>(null)
  const [contextMenu, setContextMenu] = useState<{
    id: string
    top: number
    left: number
    path?: string
  } | null>(null)
  const [panelWidth, setPanelWidth] = useState(200)

  const panelRef = useRef<HTMLDivElement>(null)
  const isDraggingRef = useRef(false)

  const MAX_PANEL_WIDTH = 300
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
    path?: string,
  ) => {
    e.preventDefault()
    if (panelRef.current) {
      const rect = panelRef.current.getBoundingClientRect()
      const offsetX = Math.min(e.clientX - rect.left, panelWidth - 160)
      const offsetY = e.clientY - rect.top

      setContextMenu({
        id,
        path: path || "",
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
      if (item.id === id) {
        return { ...item, name: newName }
      }
      if (item.children) {
        return { ...item, children: handleRename(id, newName, item.children) }
      }
      return item
    })
  }

  const handleRenameWithAPI = async (id: string, newName: string) => {
    const findItem = (items: WorkspaceItem[]): WorkspaceItem | null => {
      for (const item of items) {
        if (item.id === id) return item
        if (item.children) {
          const found = findItem(item.children)
          if (found) return found
        }
      }
      return null
    }

    const itemToRename = findItem(workspaceData)

    if (itemToRename && itemToRename.fullPath) {
      try {
        const newPath =
          itemToRename.type !== "folder"
            ? `${itemToRename.fullPath}/${newName}`
            : itemToRename.fullPath.replace(/[^/]+$/, newName)

        await renameFile(itemToRename.fullPath, newPath)

        // Update selectedPath if current path or its parent was renamed
        if (selectedPath && selectedPath.startsWith(itemToRename.fullPath)) {
          const newSelectedPath = selectedPath.replace(
            itemToRename.fullPath,
            newPath,
          )
          setSelectedPath(newSelectedPath)
        }

        await getWorkspace()

        toast.success("File renamed successfully!")
      } catch (error) {
        console.error("Rename failed:", error)
        toast.error("Failed to rename file")
        setWorkspaceData(handleRename(id, newName))
      }
    } else {
      // Jika tidak ada fullPath (item lokal), update state saja
      setWorkspaceData(handleRename(id, newName))
    }
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

  const handleDeleteWithAPI = async (id: string) => {
    const findItem = (items: WorkspaceItem[]): WorkspaceItem | null => {
      for (const item of items) {
        if (item.id === id) return item
        if (item.children) {
          const found = findItem(item.children)
          if (found) return found
        }
      }
      return null
    }

    const itemToDelete = findItem(workspaceData)

    if (itemToDelete && itemToDelete.fullPath) {
      const confirmDelete = window.confirm(
        `Are you sure you want to delete "${itemToDelete.name}"?`,
      )

      if (confirmDelete) {
        try {
          await deleteItemLocal(itemToDelete.fullPath)

          // Update selectedPath if current path or its parent was deleted
          if (selectedPath && selectedPath.startsWith(itemToDelete.fullPath)) {
            // If the deleted item is in the current path, navigate to parent
            const parentPath = itemToDelete.fullPath.substring(
              0,
              itemToDelete.fullPath.lastIndexOf("/"),
            )
            setSelectedPath(parentPath)
          }

          await getWorkspace()

          toast.success("File deleted successfully!")
        } catch (error) {
          console.error("Delete failed:", error)
          toast.error("Failed to delete file")
          setWorkspaceData((prev) => deleteItem(prev, id))
        }
      }
    } else {
      const confirmDelete = window.confirm(
        `Are you sure you want to delete "${itemToDelete?.name || "this item"}"?`,
      )

      if (confirmDelete) {
        setWorkspaceData((prev) => deleteItem(prev, id))
      }
    }
  }

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
      const isTabItem = ["home", "favorites", "trash"].includes(item.type)
      const folderDefault = ["3", "3-1"].includes(item.id)

      const isActive =
        activeTab === item.type ||
        (activeTab === "home" && item.id === "3-1") ||
        (item.type === "folder" && item.fullPath === selectedPath)

      if (item.type !== "file")
        return (
          <div
            key={item.id}
            style={{ paddingLeft: level * 16 }}
            onClick={(e) => {
              e.stopPropagation()
              if (isTabItem) {
                setActiveTab(item.type as "home" | "favorites" | "trash")
                setSelectedPath("")
              } else if (folderDefault) {
                setSelectedPath("")
                setActiveTab("home")
              } else if (item.type === "folder") {
                const folderPath = item.fullPath || item.name

                setSelectedPath(folderPath)
                setActiveTab("home")
              }
            }}
          >
            <div
              className={`${styles.itemWrapper} ${
                isActive ? styles.itemActive : ""
              }`}
              onContextMenu={(e) =>
                handleRightClick(e, item.id, item.fullPath || "")
              }
            >
              {canExpand && item.children ? (
                isOpen ? (
                  <BsChevronDown
                    size={14}
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleExpand(item.id)
                    }}
                  />
                ) : (
                  <BsChevronRight
                    size={14}
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleExpand(item.id)
                    }}
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
                    handleRenameWithAPI(item.id, e.target.value)
                    setEditingId(null)
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleRenameWithAPI(
                        item.id,
                        (e.target as HTMLInputElement).value,
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

  useEffect(() => {
    getWorkspace()
  }, [])

  function buildTreeFromPaths(paths: string[]): WorkspaceItem[] {
    let idCounter = 1

    type InternalNode = {
      __meta__: {
        id: string
        name: string
        path: string
        type: "folder" | "file"
        fullPath: string
        children: Record<string, InternalNode>
      }
    }

    const root: Record<string, InternalNode> = {}

    for (const path of paths) {
      const parts = path.replace(/\/$/, "").split("/")
      let current = root
      let currentPath = ""

      for (let i = 0; i < parts.length; i++) {
        const part = parts[i]
        const isFile = i === parts.length - 1 && !path.endsWith("/")
        currentPath += (currentPath ? "/" : "") + part

        if (!current[part]) {
          current[part] = {
            __meta__: {
              id: `${idCounter++}xyz`,
              path: currentPath,
              name: part,
              type: isFile ? "file" : "folder",
              fullPath: currentPath,
              children: {},
            },
          }
        }

        current = current[part].__meta__.children
      }
    }

    function transform(obj: Record<string, InternalNode>): WorkspaceItem[] {
      return Object.values(obj).map((entry) => {
        const { id, name, type, fullPath, children } = entry.__meta__
        const node: WorkspaceItem = { id, name, type, fullPath }
        if (type === "folder") {
          node.children = transform(children)
        }
        return node
      })
    }

    return transform(root)
  }

  const getWorkspace = async () => {
    try {
      const workspaces = await httpJupyter.get(
        endpoint.jupyter.list_workspace_local,
        {
          params: {
            bucket: "qd-sparq",
          },
        },
      )

      const foldering = buildTreeFromPaths(workspaces.data.files)

      let newData = initialData

      if (newData[2]?.children?.[0]) {
        newData[2].children[0].children = foldering
      }

      setWorkspaceData(newData)

      addApiData(workspaces.data.files)
    } catch (err) {
      console.log("Error fetching workspace:", err)
    }
  }

  const handleNewFolder = async (path: string) => {
    const folderName = prompt("Enter folder name:")

    if (folderName) {
      await createFolder(folderName, path)

      await getWorkspace()
    }
  }

  useEffect(() => {
    getWorkspace()
  }, [])

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
                // handleAddItem(contextMenu.id, "folder")
                handleNewFolder(contextMenu.path || "")
                setContextMenu(null)
              }}
            >
              Add Folder
            </div>
            <div
              className={styles.contextMenuItem}
              onClick={() => {
                handleNewTab({ type: "code", path: contextMenu.path || "" })
                getWorkspace()
                setContextMenu(null)
              }}
            >
              Add Notebook
            </div>
            <div
              className={styles.contextMenuItem}
              onClick={() => {
                handleDeleteWithAPI(contextMenu.id)
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
