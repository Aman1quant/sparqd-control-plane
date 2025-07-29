import { createContext, useContext, useState, useMemo, useEffect } from "react"
import { httpControlPlaneAPI, httpJupyter } from "@http/axios"
import endpoint from "@http/endpoint"

export interface ICompute {
  id: string
  uid: string
  name: string
  size: string
  status: string
  workspaceName: string
  createdBy: string
  createdAt: string
}

interface ICreateWorkspaceContext {
  directoryContent: DirectoryContent
  tabs: TabType[]
  updateDirectoryContent: (content: DirectoryContent) => void
  addTab: (tab: TabType) => void
  closeTab: (id: string) => void
  activeTabId: string
  activeCellId: string
  anchorCellId: string | null
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
  handleSelectCell: (e: React.MouseEvent, cellId: string) => void
  handleClearAllCellOutputs: (tabId: string) => void
  handleNewTab: (params: { type?: "code" | "markdown" | "sql" }) => void
  setActiveTabId: (id: string) => void
  setActiveCellId: (id: string) => void
  setAnchorCellId: (id: string | null) => void
  workspace: IWorkspace[]
  setWorkspace: (ws: IWorkspace[]) => void
  filteredWorkspace: IWorkspace[]
  searchQuery: string
  setSearchQuery: (query: string) => void
  isCreateModalOpen: boolean
  openCreateModal: () => void
  closeCreateModal: () => void
  addWorkspace: (ws: IWorkspace) => void
  editingWorkspace: IWorkspace | null
  openEditModal: (ws: IWorkspace) => void
  closeEditModal: () => void
  updateWorkspace: (updatedWs: IWorkspace) => void
  deleteWorkspace: (id: string) => void
  deletingWorkspace: IWorkspace | null
  openDeleteModal: (ws: IWorkspace) => void
  closeDeleteModal: () => void
  computes: ICompute[]
  filteredComputes: ICompute[]
  computeSearchQuery: string
  setComputeSearchQuery: (query: string) => void
  isAddComputeModalOpen: boolean
  openAddComputeModal: () => void
  closeAddComputeModal: () => void
  addCompute: (compute: Omit<ICompute, "id">) => void
  editingCompute: ICompute | null
  openEditComputeModal: (compute: ICompute) => void
  closeEditComputeModal: () => void
  updateCompute: (updatedCompute: ICompute) => void
  deletingCompute: ICompute | null
  openDeleteComputeModal: (compute: ICompute) => void
  closeDeleteComputeModal: () => void
  deleteCompute: (id: string) => void
  menuItem: MenuItem[]
  setMenuItem: (items: MenuItem[]) => void
  handleGetWorkspace: () => Promise<void>
  fetchComputes: () => Promise<void>
}

interface FileItem {
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
  type: "file" | "notebook" | "directory" | "markdown" | "py" | "text"
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
  outputs?: any[]
  data?: any
}

export type TabType = {
  id: string
  name: string
  content: Cell[]
}

export interface IWorkspace {
  id: string
  uuid: string
  name: string
  workspace_url: string
  credential: string
  cloud: string
  region: string
  awsAccountId: string
  vpc: string
  publicSubnetId: string
  privateSubnetId: string
  status: string
  created: string
}

export interface MenuItem {
  id?: string
  uuid?: string
  label?: string
  onClick?: () => void
  divider?: boolean
  active?: boolean
}

// const [computes, setComputes] = useState<ICompute[]>([])

const CreateWorkspaceContext = createContext<
  ICreateWorkspaceContext | undefined
>(undefined)

export const CreateWorkspaceProvider = ({
  children,
}: {
  children: React.ReactNode
}) => {
  const [directoryContent, setDirectoryContent] = useState<DirectoryContent>({})
  const [tabs, setTabs] = useState<TabType[]>([])
  const [activeTabId, setActiveTabId] = useState<string>("")
  const [activeCellId, setActiveCellId] = useState<string>("")
  const [selectedCellId, setSelectedCellId] = useState<string[]>([])
  const [anchorCellId, setAnchorCellId] = useState<string | null>(null)
  const [workspace, setWorkspace] = useState<IWorkspace[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingWorkspace, setEditingWorkspace] = useState<IWorkspace | null>(
    null,
  )
  const [deletingWorkspace, setDeletingWorkspace] = useState<IWorkspace | null>(
    null,
  )

  const [computes, setComputes] = useState<ICompute[]>([])
  const [computeSearchQuery, setComputeSearchQuery] = useState("")
  const [isAddComputeModalOpen, setIsAddComputeModalOpen] = useState(false)
  const [editingCompute, setEditingCompute] = useState<ICompute | null>(null)
  const [deletingCompute, setDeletingCompute] = useState<ICompute | null>(null)

  const [menuItem, setMenuItem] = useState<MenuItem[]>([])

  const filteredWorkspace = workspace.filter((ws) =>
    ws.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const updateDirectoryContent = (content: DirectoryContent) => {
    setDirectoryContent((prev) => ({ ...prev, ...content }))
  }

  const addTab = (tab: TabType) => setTabs((prev) => [...prev, tab])
  const closeTab = (id: string) =>
    setTabs((prev) => prev.filter((tab) => tab.id !== id))

  const findCellIndex = (tab: TabType, cellId: string) =>
    tab.content.findIndex((c) => c.id === cellId)

  const handleRunCell = async (tabId: string, cellId: string) => {
    const tab = tabs.find((t) => t.id === tabId)
    if (!tab) return

    const cellIdsToRun = selectedCellId.length > 1 ? selectedCellId : [cellId]

    for (const id of cellIdsToRun) {
      const index = findCellIndex(tab, id)
      const cell = tab.content[index]
      if (!cell) continue

      try {
        const response = await httpJupyter.post("/run-code", {
          code: cell.content,
        })
        setTabs((prev) =>
          prev.map((t) =>
            t.id === tabId
              ? {
                  ...t,
                  content: t.content.map((c) =>
                    c.id === id ? { ...c, output: response.data.output } : c,
                  ),
                }
              : t,
          ),
        )
      } catch (err) {
        console.error("Error running cell:", err)
        setTabs((prev) =>
          prev.map((t) =>
            t.id === tabId
              ? {
                  ...t,
                  content: t.content.map((c) =>
                    c.id === id ? { ...c, output: "Error executing cell" } : c,
                  ),
                }
              : t,
          ),
        )
      }
    }
  }

  const handleRunAllCells = async (tabId: string) => {
    const tab = tabs.find((t) => t.id === tabId)
    if (!tab) return

    for (const cell of tab.content) {
      try {
        const response = await httpJupyter.post("/run-code", {
          code: cell.content,
        })
        setTabs((prev) =>
          prev.map((t) =>
            t.id === tabId
              ? {
                  ...t,
                  content: t.content.map((c) =>
                    c.id === cell.id
                      ? { ...c, output: response.data.output }
                      : c,
                  ),
                }
              : t,
          ),
        )
      } catch (err) {
        console.error("Error running cell:", err)
        setTabs((prev) =>
          prev.map((t) =>
            t.id === tabId
              ? {
                  ...t,
                  content: t.content.map((c) =>
                    c.id === cell.id
                      ? { ...c, output: "Error executing cell" }
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
    cellsToRun.forEach((cell) => {
      handleRunCell(tabId, cell.id)
    })
  }

  const handleRunAllAbove = (tabId: string, cellId: string) => {
    const tab = tabs.find((t) => t.id === tabId)
    if (!tab) return
    const endIndex = findCellIndex(tab, cellId)
    if (endIndex === -1) return
    const cellsToRun = tab.content.slice(0, endIndex)
    cellsToRun.forEach((cell) => {
      handleRunCell(tabId, cell.id)
    })
  }

  const handleChangeCellContent = (
    tabId: string,
    cellId: string,
    value: string | undefined,
    type_change: "value" | "type" = "value",
    type: "code" | "markdown" | "sql" = "code",
  ) => {
    setTabs((prev) =>
      prev.map((tab) => {
        if (tab.id !== tabId) return tab
        const idx = findCellIndex(tab, cellId)
        if (idx === -1) return tab

        const updatedCell = { ...tab.content[idx] }
        if (type_change === "value") {
          updatedCell.content = value || ""
        } else if (type_change === "type") {
          updatedCell.type = type
        }

        const content = [...tab.content]
        content[idx] = updatedCell

        return { ...tab, content }
      }),
    )
  }

  const handleInsertCell = (tabId: string) => {
    const newCell: Cell = {
      id: Date.now().toString(),
      content: "",
      output: "",
      type: "code",
    }
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
          id: Date.now().toString(),
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
        const clone = { ...tab.content[idx], id: Date.now().toString() }
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
          ? {
              ...tab,
              content: tab.content.filter((c) => c.id !== cellId),
            }
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

  const handleSelectCell = (e: React.MouseEvent, cellId: string) => {
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

    if (!anchorCellId) {
      setAnchorCellId(activeCellId)
    }

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

  const handleNewTab = ({
    type = "code",
  }: {
    type?: "code" | "markdown" | "sql"
  }) => {
    const newTab: TabType = {
      id: Date.now().toString(),
      name: `Untitled ${tabs.length + 1}`,
      content: [{ id: Date.now().toString(), content: "", output: "", type }],
    }
    addTab(newTab)
  }

  const openCreateModal = () => setIsCreateModalOpen(true)
  const closeCreateModal = () => setIsCreateModalOpen(false)
  const addWorkspace = (ws: IWorkspace) => {
    setWorkspace((prev) => [ws, ...prev])
  }

  const openEditModal = (ws: IWorkspace) => {
    setEditingWorkspace(ws)
  }
  const closeEditModal = () => {
    setEditingWorkspace(null)
  }
  const updateWorkspace = (updatedWs: IWorkspace) => {
    setWorkspace((prev) =>
      prev.map((ws) => (ws.id === updatedWs.id ? updatedWs : ws)),
    )
    closeEditModal()
  }
  const openDeleteModal = (ws: IWorkspace) => {
    setDeletingWorkspace(ws)
  }

  const closeDeleteModal = () => {
    setDeletingWorkspace(null)
  }

  const deleteWorkspace = (id: string) => {
    setWorkspace((prev) => prev.filter((ws) => ws.id !== id))
    closeDeleteModal()
  }

  const openAddComputeModal = () => setIsAddComputeModalOpen(true)
  const closeAddComputeModal = () => setIsAddComputeModalOpen(false)
  const addCompute = (compute: Omit<ICompute, "id">) => {
    setComputes((prev) => [{ id: crypto.randomUUID(), ...compute }, ...prev])
    closeAddComputeModal()
  }

  const openEditComputeModal = (compute: ICompute) => setEditingCompute(compute)
  const closeEditComputeModal = () => setEditingCompute(null)
  const updateCompute = (updatedCompute: ICompute) => {
    setComputes((prev) =>
      prev.map((c) => (c.id === updatedCompute.id ? updatedCompute : c)),
    )
    closeEditComputeModal()
  }

  const openDeleteComputeModal = (compute: ICompute) =>
    setDeletingCompute(compute)
  const closeDeleteComputeModal = () => setDeletingCompute(null)
  const deleteCompute = (id: string) => {
    setComputes((prev) => prev.filter((c) => c.id !== id))
    closeDeleteComputeModal()
  }

  const handleGetWorkspace = async () => {
    try {
      const response = await httpControlPlaneAPI.get(
        endpoint.new_api.workspace.main,
      )

      const workspaces = response.data?.data?.data || []

      const customizeData = workspaces.map((ws: any) => ({
        id: ws.id,
        uuid: ws.uid,
        name: ws.name,
        workspace_url: ws?.metadata?.url || "",
        cloud: ws?.metadata?.cloud || "",
        region: ws?.metadata?.region || "",
        awsAccountId: ws?.metadata?.awsAccountId || "",
        vpc: ws?.metadata?.vpc || "",
        publicSubnetId: ws?.metadata?.publicSubnetId || "",
        privateSubnetId: ws?.metadata?.privateSubnetId || "",
        created: new Date(ws.createdAt).toLocaleDateString(),
      }))

      setWorkspace(customizeData)
    } catch (err) {
      console.log("Error fetching workspaces:", err)
    }
  }

  const fetchComputes = async () => {
    try {
      const workspaceActive = menuItem.find((ws) => ws.active)

      if (workspaceActive) {
        const response = await httpControlPlaneAPI.get(
          endpoint.new_api.cluster.main,
          {
            params: { workspaceId: workspaceActive.id },
          },
        )
        const apiData = response.data?.data?.data || []

        const formattedComputes: ICompute[] = apiData.map((item: any) => ({
          id: item.id,
          uid: item.uid,
          name: item.name,
          size: item.tshirtSize,
          status: item.status,
          workspaceName: item.workspace.name,
          createdBy: item.createdBy?.fullName || "N/A",
          createdAt: new Date(item.createdAt).toLocaleDateString(),
        }))

        setComputes(formattedComputes)
      } else {
        setComputes([])
        console.warn("No active workspace found, cannot fetch computes.")
      }
    } catch (error) {
      console.error("Failed to fetch computes:", error)
      setComputes([])
    }
  }

  const filteredComputes = useMemo(
    () =>
      computes.filter((c) =>
        c.name.toLowerCase().includes(computeSearchQuery.toLowerCase()),
      ),
    [computes, computeSearchQuery],
  )

  return (
    <CreateWorkspaceContext.Provider
      value={{
        directoryContent,
        updateDirectoryContent,
        tabs,
        addTab,
        closeTab,
        handleRunCell,
        handleRunAllCells,
        handleRunAllBelow,
        handleRunAllAbove,
        handleInsertCell,
        handleChangeCellContent,
        handleInsertAbove,
        handleInsertBelow,
        handleDuplicateCell,
        handleDeleteCell,
        handleSelectAllCells,
        handleMoveCell,
        selectedCellId,
        handleShiftArrowSelection,
        handleSelectCell,
        handleClearAllCellOutputs,
        handleNewTab,
        activeTabId,
        setActiveTabId,
        activeCellId,
        setActiveCellId,
        anchorCellId,
        setAnchorCellId,
        workspace,
        setWorkspace,
        filteredWorkspace,
        searchQuery,
        setSearchQuery,
        isCreateModalOpen,
        openCreateModal,
        closeCreateModal,
        addWorkspace,
        editingWorkspace,
        openEditModal,
        closeEditModal,
        updateWorkspace,
        deleteWorkspace,
        deletingWorkspace,
        openDeleteModal,
        closeDeleteModal,
        computes,
        filteredComputes,
        computeSearchQuery,
        setComputeSearchQuery,
        isAddComputeModalOpen,
        openAddComputeModal,
        closeAddComputeModal,
        addCompute,
        editingCompute,
        openEditComputeModal,
        closeEditComputeModal,
        updateCompute,
        deletingCompute,
        openDeleteComputeModal,
        closeDeleteComputeModal,
        deleteCompute,
        menuItem,
        setMenuItem,
        handleGetWorkspace,
        fetchComputes,
      }}
    >
      {children}
    </CreateWorkspaceContext.Provider>
  )
}

export const useCreateWorkspace = () => {
  const context = useContext(CreateWorkspaceContext)
  if (!context) {
    throw new Error(
      "useCreateWorkspace must be used within a CreateWorkspaceProvider",
    )
  }
  return context
}
