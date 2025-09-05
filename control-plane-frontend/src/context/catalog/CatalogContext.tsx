import {
  createContext,
  useContext,
  useState,
  useMemo,
  useEffect,
  useCallback,
} from "react"
import { httpSuperset } from "@http/axios"
import endpoint from "@http/endpoint"

export interface CatalogTreeItem {
  id: string
  pk?: number
  name: string
  type: "catalog" | "schema" | "table" | "column"
  schemaName?: string
  children?: CatalogTreeItem[]
  childrenLoaded?: boolean
  description?: string
  owner?: string
  permissions?: IPermission[]
  workspaces?: IWorkspaceAccess[]
}

export interface IPermission {
  principal: string
  privilege: string
  object: string
}

export interface IWorkspaceAccess {
  name: string
  id: string
  accessLevel: "Read & Write" | "Read Only"
}

export interface ISectionWithTree {
  title: string
  items: CatalogTreeItem[]
}

export interface ICatalogListItem {
  name: string
  last_viewed: string
  type: "Catalog" | "Schema"
  isFavorite?: boolean
}

export interface ISchema {
  name: string
  owner: string
  created_at: string
}

export interface IColumn {
  name: string
  type: string
  comment: string
}

interface ICatalogContext {
  sectionedTreeData: ISectionWithTree[]
  filteredSectionedTreeData: ISectionWithTree[]
  expandedNodes: Set<string>
  toggleNode: (nodeId: string) => void
  openSection: string | null
  toggleSection: (title: string) => void
  searchQuery: string
  setSearchQuery: (query: string) => void
  catalogListData: ICatalogListItem[]
  getSchemasForCatalog: (catalogName: string) => ISchema[]
  getTablesForSchema: (
    catalogName: string,
    schemaName: string,
  ) => CatalogTreeItem[]
  getColumnsForTable: (
    dbId: number,
    schemaName: string,
    tableName: string,
  ) => Promise<{ data: IColumn[]; query?: string }>
  selectedCatalog: ICatalogListItem | null
  selectCatalog: (catalog: ICatalogListItem | null) => void
  isCreateModalOpen: boolean
  openCreateModal: () => void
  closeCreateModal: () => void
  handleCreateCatalog: (newCatalog: { name: string; type: string }) => void
  isEditModalOpen: boolean
  editingItem: CatalogTreeItem | null
  openEditModal: (item: CatalogTreeItem) => void
  closeEditModal: () => void
  handleUpdateDescription: (itemId: string, description: string) => void
  isSetOwnerModalOpen: boolean
  itemToChangeOwner: CatalogTreeItem | null
  availableOwners: string[]
  openSetOwnerModal: (item: CatalogTreeItem) => void
  closeSetOwnerModal: () => void
  handleSetOwner: (itemId: string, newOwner: string) => void
  isCreateSchemaModalOpen: boolean
  openCreateSchemaModal: (catalogId: string) => void
  closeCreateSchemaModal: () => void
  handleCreateSchema: (
    catalogId: string,
    newSchema: { name: string; comment: string },
  ) => void
  handleRenameItem: (itemId: string, newName: string) => void
  handleAddItem: (parentId: string, type: "schema" | "table") => void
  handleDeleteItem: (itemId: string) => void
  isLoading: boolean
  loadingNodes: Set<string>
  refreshCatalogs: () => Promise<void>
  fetchChildrenForItem: (nodeId: string) => Promise<void>
  expandNodes: (nodeIdsToExpand: string[]) => void
}

const CatalogContext = createContext<ICatalogContext | undefined>(undefined)

export const CatalogProvider = ({
  children,
}: {
  children: React.ReactNode
}) => {
  const [sectionedTreeData, setSectionedTreeData] = useState<
    ISectionWithTree[]
  >([])

  const [catalogListData, setCatalogListData] = useState<ICatalogListItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadingNodes, setLoadingNodes] = useState<Set<string>>(new Set())
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set())
  const [openSection, setOpenSection] = useState<string | null>("Warehouse")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCatalog, setSelectedCatalog] =
    useState<ICatalogListItem | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<CatalogTreeItem | null>(null)
  const [isSetOwnerModalOpen, setIsSetOwnerModalOpen] = useState(false)
  const [itemToChangeOwner, setItemToChangeOwner] =
    useState<CatalogTreeItem | null>(null)
  const [isCreateSchemaModalOpen, setIsCreateSchemaModalOpen] = useState(false)
  const [_parentCatalogIdForSchema, setParentCatalogIdForSchema] = useState<
    string | null
  >(null)
  const availableOwners = ["System user", "farhan@gmail.com"]

  const loadInitialData = async () => {
    setIsLoading(true)
    try {
      const response = await httpSuperset.get(endpoint.superset.database.main)
      const databases = response.data.result

      const catalogItems: CatalogTreeItem[] = databases.map((db: any) => ({
        id: `db-${db.id}`,
        pk: db.id,
        name: db.database_name,
        type: "catalog",
        children: [],
        childrenLoaded: false,
      }))

      setSectionedTreeData([{ title: "Warehouse", items: catalogItems }])

      const listItems: ICatalogListItem[] = databases.map((db: any) => ({
        name: db.database_name,
        last_viewed: "N/A",
        type: "Catalog",
      }))
      setCatalogListData(listItems)
    } catch (error) {
      console.error("Failed to load initial catalog data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadInitialData()
  }, [])

  const refreshCatalogs = async () => {
    await loadInitialData()
    setExpandedNodes(new Set())
  }

  const toggleNode = useCallback(
    async (nodeId: string) => {
      const isExpanding = !expandedNodes.has(nodeId)

      // setExpandedNodes((prev) => {
      //   const newSet = new Set(prev);
      //   isExpanding ? newSet.add(nodeId) : newSet.delete(nodeId);
      //   return newSet;
      // });
      setExpandedNodes((currentExpanded) => {
        const newExpanded = new Set(currentExpanded)
        if (newExpanded.has(nodeId)) {
          newExpanded.delete(nodeId)
        } else {
          newExpanded.add(nodeId)
        }
        return newExpanded
      })

      if (!isExpanding) return

      let nodeToUpdate: CatalogTreeItem | null = null
      const findNodeRecursive = (
        items: CatalogTreeItem[],
      ): CatalogTreeItem | null => {
        for (const item of items) {
          if (item.id === nodeId) return item
          if (item.children) {
            const found = findNodeRecursive(item.children)
            if (found) return found
          }
        }
        return null
      }
      for (const section of sectionedTreeData) {
        nodeToUpdate = findNodeRecursive(section.items)
        if (nodeToUpdate) break
      }

      if (nodeToUpdate && !nodeToUpdate.childrenLoaded) {
        setLoadingNodes((prev) => new Set(prev).add(nodeId))
        let newChildren: CatalogTreeItem[] = []

        try {
          if (nodeToUpdate.type === "catalog" && nodeToUpdate.pk) {
            const response = await httpSuperset.get(
              endpoint.superset.database.schemas(nodeToUpdate.pk),
            )
            const schemas = response.data.result
            newChildren = schemas.map((schemaName: string) => ({
              id: `schema-${nodeToUpdate!.pk}-${schemaName}`,
              pk: nodeToUpdate!.pk,
              name: schemaName,
              type: "schema",
              children: [],
              childrenLoaded: false,
            }))
          } else if (nodeToUpdate.type === "schema" && nodeToUpdate.pk) {
            const params = {
              q: `(force:!f,schema_name:'${nodeToUpdate.name}')`,
            }
            const response = await httpSuperset.get(
              endpoint.superset.database.tables(nodeToUpdate.pk),
              { params },
            )
            const tables = response.data.result
            newChildren = tables.map((table: any) => ({
              id: `table-${nodeToUpdate!.pk}-${nodeToUpdate!.name}-${table.value}`,
              pk: nodeToUpdate!.pk,
              name: table.value,
              type: table.type,
              schemaName: nodeToUpdate.name,
              children: [],
              childrenLoaded: false,
            }))
          } else if (
            nodeToUpdate.type === "table" &&
            nodeToUpdate.pk &&
            nodeToUpdate.schemaName &&
            !nodeToUpdate.childrenLoaded
          ) {
            const columns = await getColumnsForTable(
              nodeToUpdate.pk,
              nodeToUpdate.schemaName,
              nodeToUpdate.name,
            )
            newChildren = columns.data.map((col: IColumn) => ({
              id: `column-${nodeToUpdate.id}-${col.name}`,
              name: col.name,
              type: "column",
              description: col.comment,
            }))
          }
        } catch (error) {
          console.error(`Failed to load children for ${nodeId}`, error)
        }

        const updateTreeRecursive = (
          items: CatalogTreeItem[],
        ): CatalogTreeItem[] =>
          items.map((item) => {
            if (item.id === nodeId) {
              return { ...item, children: newChildren, childrenLoaded: true }
            }
            if (item.children?.length) {
              return { ...item, children: updateTreeRecursive(item.children) }
            }
            return item
          })

        setSectionedTreeData((prev) =>
          prev.map((section) => ({
            ...section,
            items: updateTreeRecursive(section.items),
          })),
        )
        setLoadingNodes((prev) => {
          const newSet = new Set(prev)
          newSet.delete(nodeId)
          return newSet
        })
      }
    },
    [expandedNodes, sectionedTreeData],
  )

  const getColumnsForTable = async (
    dbId: number,
    schemaName: string,
    tableName: string,
  ): Promise<{ data: IColumn[]; query?: string }> => {
    try {
      const response = await httpSuperset.get(
        endpoint.superset.database.columns(dbId, schemaName, tableName),
      )

      return {
        query: response.data.selectStar,
        data: response.data.columns.map((col: any) => ({
          name: col.name,
          type: col.type,
          comment: col.comment || "",
        })),
      }
    } catch (error) {
      console.error(`Failed to fetch columns for ${tableName}:`, error)
      return {
        data: [],
      }
    }
  }

  const getSchemasForCatalog = (catalogName: string): ISchema[] => {
    for (const section of sectionedTreeData) {
      const foundCatalog = section.items.find((c) => c.name === catalogName)
      if (foundCatalog && foundCatalog.children) {
        return foundCatalog.children.map((schema) => ({
          name: schema.name,
          owner: schema.owner || "N/A",
          created_at: "July 23, 2025",
        }))
      }
    }
    return []
  }

  const getTablesForSchema = (
    catalogName: string,
    schemaName: string,
  ): CatalogTreeItem[] => {
    for (const section of sectionedTreeData) {
      const foundCatalog = section.items.find((c) => c.name === catalogName)
      if (foundCatalog && foundCatalog.children) {
        const foundSchema = foundCatalog.children.find(
          (s) => s.name === schemaName,
        )
        if (foundSchema && foundSchema.children) {
          return foundSchema.children
        }
      }
    }
    return []
  }

  const toggleSection = (title: string) => {
    setOpenSection((prev) => (prev === title ? null : title))
  }

  const selectCatalog = (catalog: ICatalogListItem | null) => {
    setSelectedCatalog(catalog)
  }

  const openCreateModal = () => setIsCreateModalOpen(true)
  const closeCreateModal = () => setIsCreateModalOpen(false)

  const handleCreateCatalog = (newCatalog: { name: string; type: string }) => {
    const newCatalogItem: CatalogTreeItem = {
      id: `cat_${newCatalog.name.toLowerCase().replace(" ", "_")}`,
      name: newCatalog.name,
      type: "catalog",
      owner: "farhan@gmail.com",
      description: "",
      children: [],
    }
    setSectionedTreeData((prev) =>
      prev.map((section) =>
        section.title === "Warehouse"
          ? { ...section, items: [...section.items, newCatalogItem] }
          : section,
      ),
    )
    closeCreateModal()
  }

  const openEditModal = (item: CatalogTreeItem) => {
    setEditingItem(item)
    setIsEditModalOpen(true)
  }

  const closeEditModal = () => {
    setEditingItem(null)
    setIsEditModalOpen(false)
  }

  const handleUpdateDescription = (itemId: string, description: string) => {
    const updateRecursively = (nodes: CatalogTreeItem[]): CatalogTreeItem[] => {
      return nodes.map((node) => {
        if (node.id === itemId) {
          return { ...node, description }
        }
        if (node.children) {
          return { ...node, children: updateRecursively(node.children) }
        }
        return node
      })
    }
    setSectionedTreeData((prev) =>
      prev.map((section) => ({
        ...section,
        items: updateRecursively(section.items),
      })),
    )
    closeEditModal()
  }

  const openSetOwnerModal = (item: CatalogTreeItem) => {
    setItemToChangeOwner(item)
    setIsSetOwnerModalOpen(true)
  }

  const closeSetOwnerModal = () => {
    setItemToChangeOwner(null)
    setIsSetOwnerModalOpen(false)
  }

  const handleSetOwner = (itemId: string, newOwner: string) => {
    const updateRecursively = (nodes: CatalogTreeItem[]): CatalogTreeItem[] => {
      return nodes.map((node) => {
        if (node.id === itemId) {
          return { ...node, owner: newOwner }
        }
        if (node.children) {
          return { ...node, children: updateRecursively(node.children) }
        }
        return node
      })
    }
    setSectionedTreeData((prev) =>
      prev.map((section) => ({
        ...section,
        items: updateRecursively(section.items),
      })),
    )
    closeSetOwnerModal()
  }

  const openCreateSchemaModal = (catalogId: string) => {
    setParentCatalogIdForSchema(catalogId)
    setIsCreateSchemaModalOpen(true)
  }

  const closeCreateSchemaModal = () => {
    setParentCatalogIdForSchema(null)
    setIsCreateSchemaModalOpen(false)
  }

  const handleCreateSchema = (
    catalogId: string,
    newSchema: { name: string; comment: string },
  ) => {
    const newSchemaItem: CatalogTreeItem = {
      id: `sch_${newSchema.name.toLowerCase().replace(" ", "_")}`,
      name: newSchema.name,
      type: "schema",
      owner: "farhan@gmail.com",
      description: newSchema.comment,
      children: [],
    }

    const updateRecursively = (nodes: CatalogTreeItem[]): CatalogTreeItem[] => {
      return nodes.map((node) => {
        if (node.id === catalogId) {
          return {
            ...node,
            children: [...(node.children || []), newSchemaItem],
          }
        }
        if (node.children) {
          return { ...node, children: updateRecursively(node.children) }
        }
        return node
      })
    }

    setSectionedTreeData((prev) =>
      prev.map((section) => ({
        ...section,
        items: updateRecursively(section.items),
      })),
    )
    closeCreateSchemaModal()
  }

  const handleRenameItem = (itemId: string, newName: string) => {
    const updateRecursively = (nodes: CatalogTreeItem[]): CatalogTreeItem[] => {
      return nodes.map((node) => {
        if (node.id === itemId) {
          return { ...node, name: newName }
        }
        if (node.children) {
          return { ...node, children: updateRecursively(node.children) }
        }
        return node
      })
    }
    setSectionedTreeData((prev) =>
      prev.map((section) => ({
        ...section,
        items: updateRecursively(section.items),
      })),
    )
  }

  const handleAddItem = (parentId: string, type: "schema" | "table") => {
    const newItem: CatalogTreeItem = {
      id: `${type}_${Date.now()}`,
      name: `New ${type}`,
      type: type,
      owner: "current_user",
      description: "",
    }
    const updateRecursively = (nodes: CatalogTreeItem[]): CatalogTreeItem[] => {
      return nodes.map((node) => {
        if (node.id === parentId) {
          return { ...node, children: [...(node.children || []), newItem] }
        }
        if (node.children) {
          return { ...node, children: updateRecursively(node.children) }
        }
        return node
      })
    }
    setSectionedTreeData((prev) =>
      prev.map((section) => ({
        ...section,
        items: updateRecursively(section.items),
      })),
    )
    setExpandedNodes((prev) => new Set(prev).add(parentId))
  }

  const handleDeleteItem = (itemId: string) => {
    const filterRecursively = (
      nodes: CatalogTreeItem[],
      id: string,
    ): CatalogTreeItem[] => {
      return nodes
        .filter((node) => node.id !== id)
        .map((node) => {
          if (node.children) {
            return { ...node, children: filterRecursively(node.children, id) }
          }
          return node
        })
    }
    setSectionedTreeData((prev) =>
      prev.map((section) => ({
        ...section,
        items: filterRecursively(section.items, itemId),
      })),
    )
  }

  const filteredSectionedTreeData = useMemo(() => {
    if (!searchQuery.trim()) {
      return sectionedTreeData
    }
    const lowercasedQuery = searchQuery.toLowerCase()

    const filterTree = (nodes: CatalogTreeItem[]): CatalogTreeItem[] => {
      return nodes.reduce<CatalogTreeItem[]>((acc, node) => {
        const isNodeMatch = node.name.toLowerCase().includes(lowercasedQuery)
        const filteredChildren = node.children ? filterTree(node.children) : []
        if (isNodeMatch || filteredChildren.length > 0) {
          acc.push({
            ...node,
            children: isNodeMatch ? node.children : filteredChildren,
          })
        }

        return acc
      }, [])
    }

    return sectionedTreeData
      .map((section) => ({
        ...section,
        items: filterTree(section.items),
      }))
      .filter((section) => section.items.length > 0)
  }, [searchQuery, sectionedTreeData])

  const fetchChildrenForItem = useCallback(
    async (nodeId: string) => {
      let nodeToUpdate: CatalogTreeItem | null = null
      const findNodeRecursive = (
        items: CatalogTreeItem[],
      ): CatalogTreeItem | null => {
        for (const item of items) {
          if (item.id === nodeId) return item
          if (item.children) {
            const found = findNodeRecursive(item.children)
            if (found) return found
          }
        }
        return null
      }
      for (const section of sectionedTreeData) {
        nodeToUpdate = findNodeRecursive(section.items)
        if (nodeToUpdate) break
      }

      if (nodeToUpdate && !nodeToUpdate.childrenLoaded) {
        setLoadingNodes((prev) => new Set(prev).add(nodeId))
        let newChildren: CatalogTreeItem[] = []
        try {
          if (nodeToUpdate.type === "catalog" && nodeToUpdate.pk) {
            const response = await httpSuperset.get(
              endpoint.superset.database.schemas(nodeToUpdate.pk),
            )
            const schemas = response.data.result
            newChildren = schemas.map((schemaName: string) => ({
              id: `schema-${nodeToUpdate!.pk}-${schemaName}`,
              pk: nodeToUpdate!.pk,
              name: schemaName,
              type: "schema",
              children: [],
              childrenLoaded: false,
            }))
          } else if (nodeToUpdate.type === "schema" && nodeToUpdate.pk) {
            const params = {
              q: `(force:!f,schema_name:'${nodeToUpdate.name}')`,
            }
            const response = await httpSuperset.get(
              endpoint.superset.database.tables(nodeToUpdate.pk),
              { params },
            )
            const tables = response.data.result
            newChildren = tables.map((table: any) => ({
              id: `table-${nodeToUpdate!.pk}-${nodeToUpdate!.name}-${table.value}`,
              pk: nodeToUpdate!.pk,
              name: table.value,
              type: table.type,
            }))
          }
        } catch (error) {
          console.error(`Failed to load children for ${nodeId}`, error)
        }
        const updateTreeRecursive = (
          items: CatalogTreeItem[],
        ): CatalogTreeItem[] =>
          items.map((item) => {
            if (item.id === nodeId) {
              return { ...item, children: newChildren, childrenLoaded: true }
            }
            if (item.children?.length) {
              return { ...item, children: updateTreeRecursive(item.children) }
            }
            return item
          })
        setSectionedTreeData((prev) =>
          prev.map((section) => ({
            ...section,
            items: updateTreeRecursive(section.items),
          })),
        )
        setLoadingNodes((prev) => {
          const newSet = new Set(prev)
          newSet.delete(nodeId)
          return newSet
        })
      }
    },
    [sectionedTreeData],
  )

  const expandNodes = useCallback(
    async (nodeIdsToExpand: string[]) => {
      setExpandedNodes((currentExpanded) => {
        const newExpanded = new Set(currentExpanded)
        nodeIdsToExpand.forEach((id) => newExpanded.add(id))
        if (newExpanded.size === currentExpanded.size) {
          return currentExpanded
        }
        return newExpanded
      })
      try {
        await Promise.all(nodeIdsToExpand.map((id) => fetchChildrenForItem(id)))
      } catch (error) {
        console.error(
          "Failed to fetch children for auto-expanded nodes:",
          error,
        )
      }
    },
    [fetchChildrenForItem],
  )

  return (
    <CatalogContext.Provider
      value={{
        sectionedTreeData,
        filteredSectionedTreeData,
        expandedNodes,
        toggleNode,
        openSection,
        toggleSection,
        searchQuery,
        setSearchQuery,
        catalogListData,
        getSchemasForCatalog,
        getTablesForSchema,
        getColumnsForTable,
        selectedCatalog,
        selectCatalog,
        isCreateModalOpen,
        openCreateModal,
        closeCreateModal,
        handleCreateCatalog,
        isEditModalOpen,
        editingItem,
        openEditModal,
        closeEditModal,
        handleUpdateDescription,
        isSetOwnerModalOpen,
        itemToChangeOwner,
        availableOwners,
        openSetOwnerModal,
        closeSetOwnerModal,
        handleSetOwner,
        isCreateSchemaModalOpen,
        openCreateSchemaModal,
        closeCreateSchemaModal,
        handleCreateSchema,
        handleRenameItem,
        handleAddItem,
        handleDeleteItem,
        isLoading,
        loadingNodes,
        refreshCatalogs,
        fetchChildrenForItem,
        expandNodes,
      }}
    >
      {children}
    </CatalogContext.Provider>
  )
}

export const useCatalog = () => {
  const context = useContext(CatalogContext)
  if (context === undefined) {
    throw new Error("useCatalog must be used within a CatalogProvider")
  }
  return context
}
