import {
  IconCircleCheckFilled,
  IconLock,
  IconPencil,
  IconTrash,
} from "@tabler/icons-react"
import { Table, Button } from "@components/commons"
import { useUserManagement } from "@context/user/UserContext"
import TextInput from "@components/commons/TextInput"
import Checkbox from "@components/commons/Checkbox"

const UserListData = () => {
  const {
    filteredUsers,
    searchQuery,
    setSearchQuery,
    onlyAdmins,
    setOnlyAdmins,
    openAddUserModal,
    openEditModal,
    openDeleteModal,
  } = useUserManagement()

  const columns = [
    { label: "Status" },
    { label: "Name" },
    { label: "Email" },
    { label: "Source" },
    { label: "MFA" },
    { label: "Roles" },
    { label: "Actions" },
  ]

  return (
    <div>
      <div className="mb-6">
        <label>User Management</label>
      </div>

      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-4">
          <TextInput
            placeholder="Filter users"
            value={searchQuery}
            onChange={setSearchQuery}
            className="w-64"
          />
          <Checkbox
            className="w-[400px]"
            label="Only account admins"
            checked={onlyAdmins}
            onChange={setOnlyAdmins}
          />
          <span className="text-sm text-gray-500 w-[200px]">
            {filteredUsers.length} total
          </span>
        </div>
        <Button
          label="Add user"
          variant="solid"
          size="md"
          onClick={openAddUserModal}
          className="w-[300px]"
        />
      </div>

      <Table.Table className="w-full">
        <Table.TableHeader columns={columns} />
        <Table.TableBody>
          {filteredUsers.map((user) => (
            <Table.TableRow key={user.id}>
              <Table.TableCell>
                <IconCircleCheckFilled size={20} className="text-green" />
              </Table.TableCell>
              <Table.TableCell>
                <span className="text-primary">{user.name}</span>
              </Table.TableCell>
              <Table.TableCell>{user.email}</Table.TableCell>
              <Table.TableCell>{user.source}</Table.TableCell>
              <Table.TableCell>
                {user.mfa && <IconLock size={18} />}
              </Table.TableCell>
              <Table.TableCell>
                {user.roles.length > 0 && (
                  <span className="bg-gray-200 text-gray-800 px-2 py-1 rounded">
                    {user.roles.join(", ")}
                  </span>
                )}
              </Table.TableCell>
              <Table.TableCell>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditModal(user)}
                    className="text-gray-500 hover:text-black"
                  >
                    <IconPencil size={18} />
                  </button>
                  <button
                    onClick={() => openDeleteModal(user)}
                    className="text-gray-500 hover:text-red-600"
                  >
                    <IconTrash size={18} />
                  </button>
                </div>
              </Table.TableCell>
            </Table.TableRow>
          ))}
        </Table.TableBody>
      </Table.Table>
    </div>
  )
}

export default UserListData
