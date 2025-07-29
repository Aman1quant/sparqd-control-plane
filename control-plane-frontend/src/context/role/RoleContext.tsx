import { createContext, useContext, useState, useMemo } from "react"

export interface IPermission {
  name: string
  description: string
}

export interface IRole {
  id: string
  name: string
  description: string
  permissions: string[]
}

interface IRoleManagementContext {
  roles: IRole[]
  allPermissions: IPermission[]
  filteredRoles: IRole[]
  searchQuery: string
  setSearchQuery: (query: string) => void
  addRole: (name: string, description: string) => void
  updateRole: (roleId: string, updatedData: Partial<IRole>) => void
  deleteRole: (roleId: string) => void
  isAddRoleModalOpen: boolean
  openAddRoleModal: () => void
  closeAddRoleModal: () => void
  isEditModalOpen: boolean
  editingRole: IRole | null
  openEditModal: (role: IRole) => void
  closeEditModal: () => void
  isDeleteModalOpen: boolean
  deletingRole: IRole | null
  openDeleteModal: (role: IRole) => void
  closeDeleteModal: () => void
}

const initialRoles: IRole[] = [
  {
    id: "1",
    name: "Account admin",
    description:
      "Can manage workspaces, users & groups, cloud resources and settings.",
    permissions: ["Can manage workspaces"],
  },
  {
    id: "2",
    name: "Marketplace admin",
    description: "Can manage exchanges and listings on the Marketplace.",
    permissions: [],
  },
]

const allPermissions: IPermission[] = [
  {
    name: "Can manage workspaces",
    description: "Allows creating, deleting, and modifying workspaces.",
  },
  {
    name: "Can manage billing",
    description: "Allows viewing and managing billing information.",
  },
  {
    name: "Can access SQL editor",
    description: "Allows user to access and run queries in SQL editor.",
  },
]

const RoleManagementContext = createContext<IRoleManagementContext | undefined>(
  undefined,
)

export const RoleManagementProvider = ({
  children,
}: {
  children: React.ReactNode
}) => {
  const [roles, setRoles] = useState<IRole[]>(initialRoles)
  const [searchQuery, setSearchQuery] = useState("")
  const [isAddRoleModalOpen, setIsAddRoleModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingRole, setEditingRole] = useState<IRole | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [deletingRole, setDeletingRole] = useState<IRole | null>(null)

  const openAddRoleModal = () => setIsAddRoleModalOpen(true)
  const closeAddRoleModal = () => setIsAddRoleModalOpen(false)

  const addRole = (name: string, description: string) => {
    const newRole: IRole = {
      id: `role-${Date.now()}`,
      name,
      description: description,
      permissions: [],
    }
    setRoles((prev) => [...prev, newRole])
    closeAddRoleModal()
  }

  const openEditModal = (role: IRole) => {
    setEditingRole(role)
    setIsEditModalOpen(true)
  }
  const closeEditModal = () => {
    setEditingRole(null)
    setIsEditModalOpen(false)
  }

  const updateRole = (roleId: string, updatedData: Partial<IRole>) => {
    setRoles((prev) =>
      prev.map((role) =>
        role.id === roleId ? { ...role, ...updatedData } : role,
      ),
    )
    closeEditModal()
  }

  const openDeleteModal = (role: IRole) => {
    setDeletingRole(role)
    setIsDeleteModalOpen(true)
  }
  const closeDeleteModal = () => {
    setDeletingRole(null)
    setIsDeleteModalOpen(false)
  }

  const deleteRole = (roleId: string) => {
    setRoles((prev) => prev.filter((role) => role.id !== roleId))
    closeDeleteModal()
  }

  const filteredRoles = useMemo(() => {
    if (!searchQuery) return roles
    return roles.filter((role) =>
      role.name.toLowerCase().includes(searchQuery.toLowerCase()),
    )
  }, [roles, searchQuery])

  return (
    <RoleManagementContext.Provider
      value={{
        roles,
        allPermissions,
        filteredRoles,
        searchQuery,
        setSearchQuery,
        addRole,
        updateRole,
        deleteRole,
        isAddRoleModalOpen,
        openAddRoleModal,
        closeAddRoleModal,
        isEditModalOpen,
        editingRole,
        openEditModal,
        closeEditModal,
        isDeleteModalOpen,
        deletingRole,
        openDeleteModal,
        closeDeleteModal,
      }}
    >
      {children}
    </RoleManagementContext.Provider>
  )
}

export const useRoleManagement = () => {
  const context = useContext(RoleManagementContext)
  if (context === undefined) {
    throw new Error(
      "useRoleManagement must be used within a RoleManagementProvider",
    )
  }
  return context
}
