import { createContext, useContext, useState, useMemo } from "react"
import type { ReactNode, MouseEvent } from "react"
import { v4 as uuid } from "uuid"
import { httpJupyter } from "@http/axios"
import { data as fileBrowserData } from "@components/SideNav/Content/FileBrowser/data"
// import type QueryString from "qs"
import endpoint from "@http/endpoint"
import { toast } from "react-toastify"

export interface FileItem {
  name: string
  path: string
  last_modified: string
  created: string
  content: any | null
  format: string | null
  mimetype: string | null
  size: number | null
  writable: boolean
  hash: string | null
  hash_algorithm: string | null
  type:
    | "file"
    | "notebook"
    | "directory"
    | "markdown"
    | "py"
    | "ipynb"
    | "text"
    | "sql"
  tab?: TabType
}

export type DirectoryContent = Partial<{
  name: string
  path: string
  last_modified: string
  created: string
  content: FileItem[]
  format: "json" | string
  mimetype: string | null
  size: number | null
  writable: boolean
  hash: string | null
  hash_algorithm: string | null
  type: "directory"
}>

export type Cell = {
  id: string
  content: string
  type: "code" | "markdown" | "sql"
  output?: string
  runningNumber?: number
  outputs?: any[]
  data?: any
}

export type TabType = {
  id: string
  name: string
  content: Cell[]
  runningCount?: number
}

export interface WorkspaceItem {
  id: string
  name: string
  type: "notebook" | "folder" | "file"
  owner: string
  path: string
  createdAt: string
  isFavorite?: boolean
  isDeleted?: boolean
  content: Cell[]
}

interface Filters {
  search: string
  type: string
  owner: string
  lastModified: string
}

interface kernelActive {
  id: string
  name: string
  last_activity: string
  execution_state: string
  connections: number
}

interface ICreateWorkspaceContext {
  directoryContent: DirectoryContent
  updateDirectoryContent: (content: DirectoryContent) => void
  addFileItem: (item: FileItem) => void
  updateFileItem: (path: string, newName: string) => void
  tabs: TabType[]
  addTab: (tab: TabType, file?: FileItem) => void
  closeTab: (id: string) => void
  activeTabId: string
  setActiveTabId: (id: string) => void
  activeCellId: string
  setActiveCellId: (id: string) => void
  anchorCellId: string | null
  setAnchorCellId: (id: string | null) => void
  selectedCellId: string[]
  handleRunCell: (tabId: string, cellId: string) => Promise<void>
  handleRunAllCells: (tabId: string) => Promise<void>
  handleRunAllBelow: (tabId: string, cellId: string) => void
  handleRunAllAbove: (tabId: string, cellId: string) => void
  handleChangeCellContent: (
    tabId: string,
    cellId: string,
    value: string | undefined,
    type_change?: "value" | "type",
    type?: "code" | "markdown" | "sql",
  ) => void
  handleInsertAbove: (tabId: string, cellId: string) => void
  handleInsertBelow: (tabId: string, cellId: string) => void
  handleInsertCell: (tabId: string) => void
  handleDuplicateCell: (tabId: string, cellId: string) => void
  handleDeleteCell: (tabId: string, cellId: string) => void
  handleSelectAllCells: (tabId: string) => void
  handleMoveCell: (
    tabId: string,
    cellId: string,
    direction: "up" | "down",
  ) => void
  handleShiftArrowSelection: (direction: "up" | "down") => void
  handleSelectCell: (e: MouseEvent, cellId: string) => void
  handleClearAllCellOutputs: (tabId: string) => void
  handleNewTab: (params: {
    type?: "code" | "markdown" | "sql"
    path?: string
  }) => void
  clipboardCells: Cell[]
  handleCopyCells: () => void
  handleCutCells: () => void
  handlePasteCells: (tabId: string, targetCellId?: string) => void
  // Running cells tracking
  runningCells: Set<string>
  cancelCellExecution: (cellId: string) => void
  directory: WorkspaceItem[]
  filteredDirectory: WorkspaceItem[]
  filters: Filters
  setFilters: React.Dispatch<React.SetStateAction<Filters>>
  addItem: (item: Omit<WorkspaceItem, "id" | "type">) => void
  updateItem: (itemId: string, newName: string) => void
  deleteItem: (itemId: string) => void
  restoreItem: (itemId: string) => void
  toggleFavorite: (itemId: string) => void
  kernelActive: kernelActive | null
  setKernelActive: (kernel: kernelActive | null) => void
  addApiData: (apiData: any[]) => void
  currentPage: number
  setCurrentPage: (page: number) => void
  pageSize: number
  selectedPath: string
  setSelectedPath: (path: string) => void
  getWorkspace: (type: "browser" | "object_file") => Promise<void>
  createFolder: (name: string, path: string) => Promise<void>
  createFile: (name: string, path: string, type: string) => Promise<void>
  saveFile: () => Promise<void>

  renameFile: (oldPath: string, newName: string) => Promise<void>
  deleteItemLocal: (path: string) => Promise<void>
  updateTabName: (oldPath: string, newPath: string) => void
  renameActiveTab: () => Promise<void>
  importNotebook: () => void

  /* Server */
  startServer: (name: string) => Promise<void>
  stopServer: (name: string) => Promise<void>
  statusServer: (name: string) => Promise<any>

  /* Kernel */
  shutdownKernel: () => Promise<void>
  restartKernel: () => Promise<void>
  interruptKernel: () => Promise<void>
  restartAndRunAllCells: () => Promise<void>
}

const CreateWorkspaceContext = createContext<
  ICreateWorkspaceContext | undefined
>(undefined)

export const CreateWorkspaceProvider = ({
  children,
}: {
  children: ReactNode
}) => {
  const [directoryContent, setDirectoryContent] = useState<DirectoryContent>({})
  const [tabs, setTabs] = useState<TabType[]>([])
  const [activeTabId, setActiveTabId] = useState<string>("")
  const [activeCellId, setActiveCellId] = useState<string>("")
  const [selectedCellId, setSelectedCellId] = useState<string[]>([])
  const [anchorCellId, setAnchorCellId] = useState<string | null>(null)
  const [clipboardCells, setClipboardCells] = useState<Cell[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [kernelActive, setKernelActive] = useState<kernelActive | null>(null)
  const [runningCells, setRunningCells] = useState<Set<string>>(new Set())
  const [abortControllers, setAbortControllers] = useState<
    Map<string, AbortController>
  >(new Map())
  const pageSize = 10

  const [selectedPath, setSelectedPath] = useState<string>("")

  const addFileItem = (item: FileItem) => {
    setDirectoryContent((prev) => {
      const newContent = [...(prev.content || []), item]
      return { ...prev, content: newContent }
    })
  }

  const updateFileItem = (path: string, newName: string) => {
    setDirectoryContent((prev) => {
      const newContent = (prev.content || []).map((item) => {
        if (item.path === path) {
          return { ...item, name: newName, path: newName }
        }
        return item
      })
      return { ...prev, content: newContent }
    })
  }

  const updateDirectoryContent = (content: DirectoryContent) => {
    setDirectoryContent((prev) => ({ ...prev, ...content }))
  }

  const addTab = (tab: TabType, file?: FileItem) => {
    if (!tabs.some((t) => t.id === tab.id)) {
      setTabs((prev) => [...prev, tab])
    }

    if (file) {
      if (!directoryContent.content?.some((item) => item.path === file.path)) {
        setDirectoryContent((prev) => ({
          ...prev,
          content: [...(prev.content || []), file],
        }))
      }
    }
    setActiveTabId(tab.id)
  }

  const closeTab = (id: string) => {
    if (tabs.length === 1) return alert("You cannot close the last tab.")
    return setTabs((prev) => prev.filter((tab) => tab.id !== id))
  }

  const findCellIndex = (tab: TabType, cellId: string) =>
    tab.content.findIndex((c) => c.id === cellId)

  const handleRunCell = async (tabId: string, cellId: string) => {
    const tab = tabs.find((t) => t.id === tabId)
    if (!tab) return
    const cellIdsToRun = selectedCellId.length > 1 ? selectedCellId : [cellId]

    const countingRunning = tab.runningCount ? tab.runningCount + 1 : 1

    for (const id of cellIdsToRun) {
      const index = findCellIndex(tab, id)
      const cell = tab.content[index]
      if (!cell || !cell.content) continue

      // Mark cell as running
      setRunningCells((prev) => new Set(prev).add(id))

      // Create abort controller for this cell
      const abortController = new AbortController()
      setAbortControllers((prev) => new Map(prev).set(id, abortController))

      try {
        const response = await httpJupyter.post(
          "/run-code",
          {
            code: cell.content,
            kernelId: kernelActive?.id || null,
          },
          {
            signal: abortController.signal,
          },
        )

        setTabs((prev) =>
          prev.map((t) =>
            t.id === tabId
              ? {
                  ...t,
                  runningCount: countingRunning,
                  content: t.content.map((c) =>
                    c.id === id
                      ? {
                          ...c,
                          output: response.data.outputs || response.data.output,
                          runningNumber: countingRunning,
                        }
                      : c,
                  ),
                }
              : t,
          ),
        )
      } catch (error: any) {
        if (error.name === "AbortError") {
          setTabs((prev) =>
            prev.map((t) =>
              t.id === tabId
                ? {
                    ...t,
                    content: t.content.map((c) =>
                      c.id === id
                        ? {
                            ...c,
                            output: "Execution cancelled",
                          }
                        : c,
                    ),
                  }
                : t,
            ),
          )
        } else {
          setTabs((prev) =>
            prev.map((t) =>
              t.id === tabId
                ? {
                    ...t,
                    runningCount: countingRunning,
                    content: t.content.map((c) =>
                      c.id === id
                        ? {
                            ...c,
                            output: "Error executing cell",
                            runningNumber: countingRunning,
                          }
                        : c,
                    ),
                  }
                : t,
            ),
          )
        }
      } finally {
        // Remove cell from running state
        setRunningCells((prev) => {
          const newSet = new Set(prev)
          newSet.delete(id)
          return newSet
        })

        // Remove abort controller
        setAbortControllers((prev) => {
          const newMap = new Map(prev)
          newMap.delete(id)
          return newMap
        })
      }
    }
  }

  const cancelCellExecution = (cellId: string) => {
    const controller = abortControllers.get(cellId)
    if (controller) {
      controller.abort()
    }
  }

  const handleRunAllCells = async (tabId: string) => {
    let getTab = tabs.find((t) => t.id === tabId)
    if (!getTab) return

    const tab = { ...getTab }

    let countingRunning = tab?.runningCount ? tab.runningCount : 0

    for (const cell of tab.content) {
      if (!cell || !cell.content) continue

      countingRunning++

      const currentRunNumber = countingRunning

      try {
        const response = await httpJupyter.post("/run-code", {
          code: cell.content,
          kernelId: kernelActive?.id || null,
        })

        setTabs((prev) =>
          prev.map((t) =>
            t.id === tabId
              ? {
                  ...t,
                  runningCount: currentRunNumber,
                  content: t.content.map((c) =>
                    c.id === cell.id
                      ? {
                          ...c,
                          output: response.data.outputs || response.data.output,
                          runningNumber: currentRunNumber,
                        }
                      : c,
                  ),
                }
              : t,
          ),
        )
      } catch {
        setTabs((prev) =>
          prev.map((t) =>
            t.id === tabId
              ? {
                  ...t,
                  runningCount: currentRunNumber,
                  content: t.content.map((c) =>
                    c.id === cell.id
                      ? {
                          ...c,
                          output: "Error executing cell",
                          runningNumber: currentRunNumber,
                        }
                      : c,
                  ),
                }
              : t,
          ),
        )
      }
    }
  }

  const handleRunAllBelow = (tabId: string, cellId: string) => {
    const tab = tabs.find((t) => t.id === tabId)
    if (!tab) return
    const startIndex = findCellIndex(tab, cellId)
    if (startIndex === -1) return
    const cellsToRun = tab.content.slice(startIndex + 1)
    cellsToRun.forEach((cell) => handleRunCell(tabId, cell.id))
  }

  const handleRunAllAbove = (tabId: string, cellId: string) => {
    const tab = tabs.find((t) => t.id === tabId)
    if (!tab) return
    const endIndex = findCellIndex(tab, cellId)
    if (endIndex === -1) return
    const cellsToRun = tab.content.slice(0, endIndex)
    cellsToRun.forEach((cell) => handleRunCell(tabId, cell.id))
  }

  const handleChangeCellContent = (
    tabId: string,
    cellId: string,
    value: string | undefined,
    type_change = "value",
    type = "code",
  ) => {
    setTabs((prev) =>
      prev.map((tab) => {
        if (tab.id !== tabId) return tab
        const idx = findCellIndex(tab, cellId)
        if (idx === -1) return tab
        const updatedCell = { ...tab.content[idx] }
        if (type_change === "value") updatedCell.content = value || ""
        if (
          type_change === "type" &&
          (type === "code" || type === "markdown" || type === "sql")
        )
          updatedCell.type = type
        const content = [...tab.content]
        content[idx] = updatedCell
        return { ...tab, content }
      }),
    )
  }

  const handleInsertCell = (tabId: string) => {
    const newCell: Cell = { id: uuid(), content: "", output: "", type: "code" }
    setTabs((prev) =>
      prev.map((tab) =>
        tab.id === tabId ? { ...tab, content: [...tab.content, newCell] } : tab,
      ),
    )
  }

  const insertCell = (
    tabId: string,
    targetCellId: string,
    position: "above" | "below",
  ) => {
    setTabs((prev) =>
      prev.map((tab) => {
        if (tab.id !== tabId) return tab
        const idx = findCellIndex(tab, targetCellId)
        const newCell: Cell = {
          id: uuid(),
          content: "",
          output: "",
          type: "code",
        }
        const content = [...tab.content]
        content.splice(position === "above" ? idx : idx + 1, 0, newCell)
        return { ...tab, content }
      }),
    )
  }

  const handleInsertAbove = (tabId: string, cellId: string) =>
    insertCell(tabId, cellId, "above")
  const handleInsertBelow = (tabId: string, cellId: string) =>
    insertCell(tabId, cellId, "below")

  const handleDuplicateCell = (tabId: string, cellId: string) => {
    setTabs((prev) =>
      prev.map((tab) => {
        if (tab.id !== tabId) return tab
        const idx = findCellIndex(tab, cellId)
        const clone = { ...tab.content[idx], id: uuid() }
        const content = [...tab.content]
        content.splice(idx + 1, 0, clone)
        return { ...tab, content }
      }),
    )
  }

  const handleDeleteCell = (tabId: string, cellId: string) => {
    setTabs((prev) =>
      prev.map((tab) =>
        tab.id === tabId
          ? { ...tab, content: tab.content.filter((c) => c.id !== cellId) }
          : tab,
      ),
    )
  }

  const handleSelectAllCells = (tabId: string) => {
    const tab = tabs.find((t) => t.id === tabId)
    if (!tab) return
    const allCellIds = tab.content.map((c) => c.id)
    setSelectedCellId(allCellIds)
    setActiveCellId(allCellIds[0] || "")
    setAnchorCellId(allCellIds[0] || null)
  }

  const handleMoveCell = (
    tabId: string,
    cellId: string,
    direction: "up" | "down",
  ) => {
    setTabs((prev) =>
      prev.map((tab) => {
        if (tab.id !== tabId) return tab
        const idx = findCellIndex(tab, cellId)
        const targetIdx = direction === "up" ? idx - 1 : idx + 1
        if (targetIdx < 0 || targetIdx >= tab.content.length) return tab
        const newContent = [...tab.content]
        const [moved] = newContent.splice(idx, 1)
        newContent.splice(targetIdx, 0, moved)
        return { ...tab, content: newContent }
      }),
    )
  }

  const handleSelectCell = (e: MouseEvent, cellId: string) => {
    const isCtrlPressed = e.metaKey || e.ctrlKey
    if (isCtrlPressed) {
      setSelectedCellId((prev) =>
        prev.includes(cellId)
          ? prev.filter((id) => id !== cellId)
          : [...prev, cellId],
      )
    } else {
      setSelectedCellId([cellId])
    }
    setActiveCellId(cellId)
  }

  const handleShiftArrowSelection = (direction: "up" | "down") => {
    const tab = tabs.find((t) => t.id === activeTabId)
    if (!tab || !activeCellId) return
    const currentIndex = findCellIndex(tab, activeCellId)
    if (currentIndex === -1) return
    const nextIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1
    if (nextIndex < 0 || nextIndex >= tab.content.length) return
    const nextCellId = tab.content[nextIndex].id
    if (!anchorCellId) setAnchorCellId(activeCellId)
    setActiveCellId(nextCellId)
    const anchorIndex = findCellIndex(tab, anchorCellId ?? activeCellId)
    const [start, end] =
      anchorIndex < nextIndex
        ? [anchorIndex, nextIndex]
        : [nextIndex, anchorIndex]
    const selectedIds = tab.content.slice(start, end + 1).map((c) => c.id)
    setSelectedCellId(selectedIds)
  }

  const handleClearAllCellOutputs = (tabId: string) => {
    setTabs((prev) =>
      prev.map((tab) =>
        tab.id === tabId
          ? {
              ...tab,
              content: tab.content.map((cell) => ({
                ...cell,
                output: "",
                outputs: [],
              })),
            }
          : tab,
      ),
    )
  }

  const handleNewTab = async ({
    type = "code",
    path = "",
  }: {
    type?: "code" | "markdown" | "sql"
    path?: string
  }) => {
    // let defaultContent = ""
    // switch (type) {
    //   case "sql":
    //     defaultContent = "SELECT * FROM your_table LIMIT 100;"
    //     break
    //   case "code":
    //     defaultContent = "print('Hello, World!')"
    //     break
    //   case "markdown":
    //     defaultContent = "# New Notebook"
    //     break
    //   default:
    //     defaultContent = ""
    // }

    const fileExtension = {
      code: "ipynb",
      markdown: "md",
      sql: "sql",
    }

    if (type !== "code")
      return alert("New tab creation is only available in code mode.")

    let pathFile = path || selectedPath

    const items =
      directory?.filter((item) => {
        if (!item.path) return false

        const isInSelectedPath = pathFile
          ? item.path.substring(0, item.path.lastIndexOf("/")) === pathFile ||
            (pathFile === "" && !item.path.includes("/"))
          : !item.path.includes("/")

        return isInSelectedPath && item.type !== "folder"
      }) || []

    const newName = `Untitled-${items.length + 1}.${fileExtension[type]}`

    const newId = `api-${selectedPath ? selectedPath + "/" + newName : newName}`

    // const newTab: TabType = {
    //   id: newId,
    //   name: newName,
    //   content: [{ id: uuid(), content: defaultContent, output: "", type }],
    // }

    // const newFileItem: FileItem = {
    //   name: newName,
    //   path: newId,
    //   last_modified: new Date().toISOString(),
    //   created: new Date().toISOString(),
    //   content: null,
    //   format: "text",
    //   mimetype: null,
    //   size: 0,
    //   writable: true,
    //   hash: null,
    //   hash_algorithm: null,
    //   type: fileExtension[type] as "ipynb" | "markdown" | "sql",
    // }

    await createFile(newName, pathFile, fileExtension[type])

    fetchFile(newId, newName, pathFile, "browser")
    getWorkspace("browser")
    // addTab(newTab, newFileItem)
  }

  const handleCopyCells = () => {
    const tab = tabs.find((t) => t.id === activeTabId)
    if (!tab) return
    const copied = tab.content.filter((c) => selectedCellId.includes(c.id))
    setClipboardCells(copied.map((c) => ({ ...c })))
  }

  const handleCutCells = () => {
    const tab = tabs.find((t) => t.id === activeTabId)
    if (!tab) return
    const copied = tab.content.filter((c) => selectedCellId.includes(c.id))
    setClipboardCells(copied.map((c) => ({ ...c })))
    setTabs((prev) =>
      prev.map((t) =>
        t.id === activeTabId
          ? {
              ...t,
              content: t.content.filter((c) => !selectedCellId.includes(c.id)),
            }
          : t,
      ),
    )
    setSelectedCellId([])
  }

  const handlePasteCells = (tabId: string, targetCellId?: string) => {
    const tab = tabs.find((t) => t.id === tabId)
    if (!tab || clipboardCells.length === 0) return
    const newCells = clipboardCells.map((cell) => ({ ...cell, id: uuid() }))
    if (targetCellId) {
      const idx = findCellIndex(tab, targetCellId)
      if (idx === -1) return
      const content = [...tab.content]
      content.splice(idx + 1, 0, ...newCells)
      setTabs((prev) =>
        prev.map((t) => (t.id === tabId ? { ...t, content } : t)),
      )
    } else {
      setTabs((prev) =>
        prev.map((t) =>
          t.id === tabId ? { ...t, content: [...t.content, ...newCells] } : t,
        ),
      )
    }
  }

  const transformFileBrowserData = (
    items: DirectoryContent["content"],
  ): WorkspaceItem[] => {
    if (!items) return []
    return items.map((item) => ({
      id: item.path,
      content: item.content,
      path: item.path,
      name: item.name,
      type: "notebook",
      owner: "farhan@gmail.com",
      createdAt: item.created,
      isFavorite: false,
      isDeleted: false,
    }))
  }

  const [directory, setDirectory] = useState<WorkspaceItem[]>(
    transformFileBrowserData(fileBrowserData.content),
  )

  const [filters, setFilters] = useState<Filters>({
    search: "",
    type: "all",
    owner: "all",
    lastModified: "anytime",
  })

  const filteredDirectory = useMemo(() => {
    return directory.filter((item) => {
      const searchMatch = item.name
        .toLowerCase()
        .includes(filters.search.toLowerCase())
      const ownerMatch =
        filters.owner === "me" ? item.owner === "farhan@gmail.com" : true
      return searchMatch && ownerMatch
    })
  }, [directory, filters])

  const addItem = (item: Omit<WorkspaceItem, "id" | "type">) => {
    const newItem: WorkspaceItem = { ...item, id: uuid(), type: "notebook" }
    setDirectory((prev) => [...prev, newItem])
  }

  const updateItem = (itemId: string, newName: string) => {
    setDirectory((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, name: newName } : item,
      ),
    )
  }

  const deleteItem = (itemId: string) => {
    setDirectory((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, isDeleted: true } : item,
      ),
    )
  }

  const restoreItem = (itemId: string) => {
    setDirectory((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, isDeleted: false } : item,
      ),
    )
  }

  const toggleFavorite = (itemId: string) => {
    setDirectory((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, isFavorite: !item.isFavorite } : item,
      ),
    )
  }

  const addApiData = (apiPaths: string[]) => {
    const allItems: Record<string, WorkspaceItem> = {}

    apiPaths.forEach((path) => {
      if (!path) return

      const parts = path.replace(/\/$/, "").split("/")
      let currentPath = ""

      for (let i = 0; i < parts.length; i++) {
        const part = parts[i]
        const isLastPart = i === parts.length - 1
        const isFile = isLastPart && !path.endsWith("/")

        currentPath = currentPath ? `${currentPath}/${part}` : part

        if (allItems[currentPath]) continue

        if (isFile) {
          allItems[currentPath] = {
            id: `api-${currentPath}`,
            name: part,
            path: currentPath,
            type: "notebook",
            owner: "API",
            createdAt: new Date().toISOString(),
            content: [],
            isFavorite: false,
            isDeleted: false,
          }
        } else {
          allItems[currentPath] = {
            id: `api-${currentPath}`,
            name: part,
            path: currentPath,
            type: "folder",
            owner: "API",
            createdAt: new Date().toISOString(),
            content: [],
            isFavorite: false,
            isDeleted: false,
          }
        }
      }
    })

    setDirectory((prev) => {
      const nonApiItems = prev.filter((item) => !item.id.startsWith("api-"))
      return [...nonApiItems, ...Object.values(allItems)]
    })
  }

  const getWorkspace = async (type: "browser" | "object_file" = "browser") => {
    try {
      const endpointPath =
        type === "browser"
          ? endpoint.jupyter.list_workspace_local
          : endpoint.jupyter.list_workspace

      const workspaces = await httpJupyter.get(endpointPath, {
        params: {
          bucket: "qd-sparq",
        },
      })
      if (workspaces.data?.files) {
        addApiData(workspaces.data.files)
      }
    } catch (err) {
      console.error("Error fetching workspace:", err)
    }
  }

  const createFolder = async (name: string, path: string) => {
    try {
      await httpJupyter.post(endpoint.jupyter.folders, {
        path: `${path}/${name}`,
      })
      toast.success("Folder created successfully", {
        position: "top-right",
      })
    } catch (error) {
      toast.error("Error creating folder", {
        position: "top-right",
      })
      console.error("Error creating folder:", error)
    }
  }

  const createFile = async (name: string, path: string, type: string) => {
    try {
      const payload = {
        path: `${path}/${name}`,
        content: {
          type: type,
          cells: [
            {
              cell_type: "code",
              metadata: {
                language: "python",
                id: uuid(),
              },
              source: "print('Hello, World!')",
              execution_count: null,
              outputs: [],
            },
          ],
          metadata: {
            language: "python",
            id: uuid(),
          },
          nbformat: 4,
          nbformat_minor: 5,
        },
      }

      await httpJupyter.post(endpoint.jupyter.files, {
        path: payload.path,
        content: JSON.stringify(payload.content),
      })
    } catch (error) {
      console.error("Error creating file:", error)
    }
  }

  const fetchFile = async (
    id: string,
    name: string,
    path: string,
    type: "browser" | "object_file",
  ) => {
    try {
      const endpointPath =
        type === "object_file"
          ? endpoint.jupyter.get_file_s3
          : endpoint.jupyter.get_file_local

      const newPath = `${path}/${name}`
      const params =
        type === "object_file"
          ? { bucket: "qd-sparq", key: newPath }
          : { path: newPath }

      const response = await httpJupyter.get(endpointPath, {
        params,
      })

      const fileContent = JSON.parse(response.data.content)

      const cells = fileContent.cells.map((cell: any) => ({
        id: crypto.randomUUID(),
        content: Array.isArray(cell.source)
          ? cell.source.join("")
          : cell.source,
        output: "",
        outputs: cell.outputs || [],
      }))

      addTab({ id, name, content: cells })
    } catch (error) {
      console.error("Fetch file failed:", error)
    }
  }

  const saveFile = async () => {
    const tab = tabs.find((t) => t.id === activeTabId)
    if (!tab) return

    const fileContent = {
      cells: tab.content.map((cell) => ({
        cell_type: "code",
        metadata: { language: "python", id: cell.id },
        source: cell.content,
        execution_count: null,
        outputs: cell.outputs || [],
      })),
      metadata: { language: "python", id: uuid() },
      nbformat: 4,
      nbformat_minor: 5,
    }

    try {
      await httpJupyter.post(endpoint.jupyter.files, {
        path: `${selectedPath}/${tab.name}`,
        content: JSON.stringify(fileContent),
      })

      toast.success("File saved successfully", {
        position: "top-right",
      })
    } catch (error) {
      toast.error("Error saving file", {
        position: "top-right",
      })
      console.error("Error saving file:", error)
    }
  }

  const deleteItemLocal = async (path: string) => {
    try {
      await httpJupyter.delete(endpoint.jupyter.delete, {
        data: { path },
      })
    } catch (error) {
      console.error("Error deleting item:", error)
    }
  }

  const renameItemLocal = async (oldPath: string, newName: string) => {
    try {
      await httpJupyter.post(endpoint.jupyter.rename, {
        oldPath,
        newPath: newName,
      })

      const fileName = oldPath.split("/").pop() || ""
      const newFileName = newName.split("/").pop() || ""
      const oldTabId = `api-${oldPath}`
      const newTabId = `api-${newName}`

      setTabs((prevTabs) =>
        prevTabs.map((tab) => {
          if (tab.id === `api-${oldPath}` || tab.name === fileName) {
            return {
              ...tab,
              name: newFileName,
              id: tab.id.replace(oldPath, newName),
            }
          }
          return tab
        }),
      )

      // Update activeTabId if the renamed tab was the active one
      if (activeTabId === oldTabId) {
        setActiveTabId(newTabId)
      }

      // Update directory content to reflect the rename
      setDirectoryContent((prev) => {
        if (prev.content) {
          const updatedContent = prev.content.map((item) => {
            if (item.path === oldPath) {
              return {
                ...item,
                name: newFileName,
                path: newName,
              }
            }
            return item
          })
          return { ...prev, content: updatedContent }
        }
        return prev
      })

      if (selectedPath === oldPath) {
        setSelectedPath(newName)
      }

      await getWorkspace("browser")
    } catch (error) {
      console.error("Error renaming item:", error)
    }
  }

  const updateTabName = (oldPath: string, newName: string) => {
    const oldTabId = `api-${oldPath}`
    const newTabId = `api-${newName}`

    setTabs((prevTabs) =>
      prevTabs.map((tab) => {
        if (tab.id === `api-${oldPath}`) {
          return {
            ...tab,
            name: newName.split("/").pop() || newName,
            id: tab.id.replace(oldPath, newName),
          }
        }
        return tab
      }),
    )

    // Update activeTabId if the renamed tab was the active one
    if (activeTabId === oldTabId) {
      setActiveTabId(newTabId)
    }
  }

  // Function to rename the currently active tab
  const renameActiveTab = async () => {
    if (!activeTabId) {
      toast.error("No active tab to rename")
      return
    }

    const activeTab = tabs.find((tab) => tab.id === activeTabId)
    if (!activeTab) {
      toast.error("Active tab not found")
      return
    }

    const currentPath = activeTab.id.replace("api-", "")

    const newName = prompt(`Rename "${activeTab.name}" to:`, activeTab.name)

    if (newName && newName !== activeTab.name) {
      try {
        const pathParts = currentPath.split("/")
        pathParts[pathParts.length - 1] = newName
        const newPath = pathParts.join("/")

        await renameItemLocal(currentPath, newPath)

        toast.success(`Tab renamed to "${newName}"`)
      } catch (error) {
        console.error("Error renaming active tab:", error)
        toast.error("Failed to rename tab")
      }
    }
  }

  const importNotebook = () => {
    const fileInput = document.createElement("input")
    fileInput.type = "file"
    fileInput.accept = ".ipynb"
    fileInput.multiple = true
    fileInput.style.display = "none"

    fileInput.onchange = async (event: Event) => {
      const target = event.target as HTMLInputElement
      const files = target.files
      if (!files) return

      try {
        for (let i = 0; i < files.length; i++) {
          const file = files[i]
          const formData = new FormData()

          formData.append("file", file)
          formData.append("path", selectedPath || "")

          await httpJupyter.post(endpoint.jupyter.upload, formData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          })
        }

        await getWorkspace("browser")

        toast.success(`${files.length} notebook(s) imported successfully!`)
      } catch (error) {
        console.error("Notebook import failed:", error)
        toast.error("Failed to import notebook(s)")
      }
    }

    document.body.appendChild(fileInput)
    fileInput.click()
    document.body.removeChild(fileInput)
  }

  /* Server */
  const startServer = async (name: string) => {
    try {
      await httpJupyter.post(endpoint.jupyter.server.start, {
        username: name,
      })

      toast.success("Server started successfully", {
        position: "top-right",
      })
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        error?.message ||
        "Unknown error occurred"
      toast.error(`Error starting server: ${errorMessage}`, {
        position: "top-right",
      })
      console.error("Error starting server:", error)
    }
  }

  const stopServer = async (name: string) => {
    try {
      await httpJupyter.delete(endpoint.jupyter.server.stop, {
        data: {
          username: name,
        },
      })

      toast.success("Server stopped successfully", {
        position: "top-right",
      })
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        error?.message ||
        "Unknown error occurred"
      toast.error(`Error stopping server: ${errorMessage}`, {
        position: "top-right",
      })
      console.error("Error stopping server:", error)
    }
  }

  const statusServer = async (name: string) => {
    try {
      const response = await httpJupyter.get(endpoint.jupyter.server.status, {
        params: { username: name },
      })
      return response.data
    } catch (error: any) {
      console.error("Error checking server status:", error)
    }
  }

  /* Kernel API */

  const restartKernel = async () => {
    try {
      const kernelId = kernelActive?.id || ""

      await httpJupyter.post(endpoint.jupyter.kernels.restart(kernelId))

      toast.success("Kernel restarted successfully", {
        position: "top-right",
      })
    } catch (error) {
      console.error("Error restarting kernel:", error)
      toast.error("Failed to restart kernel", {
        position: "top-right",
      })
    }
  }

  const shutdownKernel = async () => {
    try {
      const kernelId = kernelActive?.id || ""

      await httpJupyter.delete(endpoint.jupyter.kernels.detail(kernelId))

      setKernelActive(null)
      toast.success("Kernel shut down successfully", {
        position: "top-right",
      })
    } catch (error) {
      console.error("Error shutting down kernel:", error)
      toast.error("Failed to shut down kernel", {
        position: "top-right",
      })
    }
  }

  const interruptKernel = async () => {
    try {
      const kernelId = kernelActive?.id || ""

      await httpJupyter.post(endpoint.jupyter.kernels.interrupt(kernelId))
      toast.success("Kernel interrupted successfully", {
        position: "top-right",
      })
    } catch (error) {
      console.error("Error interrupting kernel:", error)
      toast.error("Failed to interrupt kernel", {
        position: "top-right",
      })
    }
  }

  const restartAndRunAllCells = async () => {
    try {
      await restartKernel()
      await handleRunAllCells(activeTabId)
    } catch (error) {
      console.error("Error restarting and running all cells:", error)
      toast.error("Failed to restart and run all cells", {
        position: "top-right",
      })
    }
  }

  return (
    <CreateWorkspaceContext.Provider
      value={{
        directoryContent,
        updateDirectoryContent,
        addFileItem,
        updateFileItem,
        tabs,
        addTab,
        closeTab,
        activeTabId,
        setActiveTabId,
        activeCellId,
        setActiveCellId,
        anchorCellId,
        setAnchorCellId,
        selectedCellId,
        runningCells,
        cancelCellExecution,
        handleRunCell,
        handleRunAllCells,
        handleRunAllBelow,
        handleRunAllAbove,
        handleChangeCellContent,
        handleInsertAbove,
        handleInsertBelow,
        handleInsertCell,
        handleDuplicateCell,
        handleDeleteCell,
        handleSelectAllCells,
        handleMoveCell,
        handleShiftArrowSelection,
        handleSelectCell,
        handleClearAllCellOutputs,
        handleNewTab,
        clipboardCells,
        handleCopyCells,
        handleCutCells,
        handlePasteCells,
        directory,
        filteredDirectory,
        filters,
        setFilters,
        addItem,
        updateItem,
        deleteItem,
        restoreItem,
        toggleFavorite,
        kernelActive,
        setKernelActive,
        addApiData,
        currentPage,
        setCurrentPage,
        pageSize,
        selectedPath,
        setSelectedPath,
        getWorkspace,
        createFolder,
        createFile,
        saveFile,
        renameFile: renameItemLocal,
        deleteItemLocal,
        updateTabName,
        renameActiveTab,
        importNotebook,
        startServer,
        stopServer,
        statusServer,
        restartKernel,
        shutdownKernel,
        interruptKernel,
        restartAndRunAllCells,
      }}
    >
      {children}
    </CreateWorkspaceContext.Provider>
  )
}

export const useCreateWorkspace = () => {
  const context = useContext(CreateWorkspaceContext)
  if (!context)
    throw new Error(
      "useCreateWorkspace must be used within a CreateWorkspaceProvider",
    )
  return context
}
