import { createContext, useContext, useState, useMemo } from "react"

export interface IUser {
  id: string
  status: "active" | "inactive"
  name: string
  email: string
  source: "Account"
  mfa: boolean
  roles: string[]
  firstName?: string
  lastName?: string
}

interface IUserManagementContext {
  users: IUser[]
  filteredUsers: IUser[]
  searchQuery: string
  setSearchQuery: (query: string) => void
  onlyAdmins: boolean
  setOnlyAdmins: (value: boolean) => void
  addUser: (email: string, fullName: string) => void
  handleUpdateUser: (userId: string, updatedData: Partial<IUser>) => void
  handleDeleteUser: (userId: string) => void

  isAddUserModalOpen: boolean
  openAddUserModal: () => void
  closeAddUserModal: () => void

  isEditModalOpen: boolean
  editingUser: IUser | null
  openEditModal: (user: IUser) => void
  closeEditModal: () => void

  isDeleteModalOpen: boolean
  deletingUser: IUser | null
  openDeleteModal: (user: IUser) => void
  closeDeleteModal: () => void
}

const initialUsers: IUser[] = [
  {
    id: "1",
    status: "active",
    name: "park_test_test",
    email: "hans.park99@gmail.com",
    source: "Account",
    mfa: true,
    roles: ["Account admin"],
    firstName: "park_test",
    lastName: "test",
  },
  {
    id: "2",
    status: "active",
    name: "hello.soladev@gmail.com",
    email: "hello.soladev@gmail.com",
    source: "Account",
    mfa: true,
    roles: ["Account admin"],
    firstName: "hello.soladev",
    lastName: "gmail.com",
  },
]

const UserManagementContext = createContext<IUserManagementContext | undefined>(
  undefined,
)

export const UserManagementProvider = ({
  children,
}: {
  children: React.ReactNode
}) => {
  const [users, setUsers] = useState<IUser[]>(initialUsers)
  const [searchQuery, setSearchQuery] = useState("")
  const [onlyAdmins, setOnlyAdmins] = useState(false)
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<IUser | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [deletingUser, setDeletingUser] = useState<IUser | null>(null)

  const openAddUserModal = () => setIsAddUserModalOpen(true)
  const closeAddUserModal = () => setIsAddUserModalOpen(false)

  const addUser = (email: string, fullName: string) => {
    const newUser: IUser = {
      id: `user-${Date.now()}`,
      name: fullName || email.split("@")[0],
      email,
      status: "active",
      source: "Account",
      mfa: false,
      roles: [],
      firstName: fullName.split(" ")[0],
      lastName: fullName.split(" ").slice(1).join(" "),
    }
    setUsers((prev) => [...prev, newUser])
    closeAddUserModal()
  }

  const openEditModal = (user: IUser) => {
    setEditingUser(user)
    setIsEditModalOpen(true)
  }
  const closeEditModal = () => {
    setEditingUser(null)
    setIsEditModalOpen(false)
  }

  const handleUpdateUser = (userId: string, updatedData: Partial<IUser>) => {
    setUsers((prev) =>
      prev.map((user) =>
        user.id === userId
          ? {
              ...user,
              ...updatedData,
              name: `${updatedData.firstName} ${updatedData.lastName}`.trim(),
            }
          : user,
      ),
    )
    closeEditModal()
  }

  const openDeleteModal = (user: IUser) => {
    setDeletingUser(user)
    setIsDeleteModalOpen(true)
  }

  const closeDeleteModal = () => {
    setDeletingUser(null)
    setIsDeleteModalOpen(false)
  }

  const handleDeleteUser = (userId: string) => {
    setUsers((prev) => prev.filter((user) => user.id !== userId))
    closeDeleteModal()
  }

  const filteredUsers = useMemo(() => {
    let filtered = users
    if (onlyAdmins) {
      filtered = filtered.filter((user) => user.roles.includes("Account admin"))
    }
    if (searchQuery) {
      filtered = filtered.filter(
        (user) =>
          user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }
    return filtered
  }, [users, searchQuery, onlyAdmins])

  return (
    <UserManagementContext.Provider
      value={{
        users,
        filteredUsers,
        searchQuery,
        setSearchQuery,
        onlyAdmins,
        setOnlyAdmins,
        addUser,
        isAddUserModalOpen,
        openAddUserModal,
        closeAddUserModal,
        isEditModalOpen,
        editingUser,
        openEditModal,
        closeEditModal,
        handleUpdateUser,
        handleDeleteUser,
        isDeleteModalOpen,
        deletingUser,
        openDeleteModal,
        closeDeleteModal,
      }}
    >
      {children}
    </UserManagementContext.Provider>
  )
}

export const useUserManagement = () => {
  const context = useContext(UserManagementContext)
  if (context === undefined) {
    throw new Error(
      "useUserManagement must be used within a UserManagementProvider",
    )
  }
  return context
}
