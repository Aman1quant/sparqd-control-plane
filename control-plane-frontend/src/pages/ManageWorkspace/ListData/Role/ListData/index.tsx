import { Table, Button } from "@components/commons"
import TextInput from "@components/commons/TextInput"
import { useRoleManagement } from "@context/role/RoleContext"
import { IconPencil, IconTrash } from "@tabler/icons-react"

const RoleListData = () => {
  const {
    filteredRoles,
    searchQuery,
    setSearchQuery,
    openAddRoleModal,
    openEditModal,
    openDeleteModal,
  } = useRoleManagement()

  const columns = [
    { label: "Role name" },
    { label: "Description" },
    { label: "Actions" },
  ]

  return (
    <div>
      <div className="mb-6">
        <label>Role</label>
      </div>
      <div className="flex justify-between items-center mb-4">
        <div className="w-[300px]">
          <TextInput
            placeholder="Filter roles"
            value={searchQuery}
            onChange={setSearchQuery}
          />
        </div>
        <Button
          label="Add role"
          variant="solid"
          size="md"
          onClick={openAddRoleModal}
          className="w-[300px]"
        />
      </div>

      <Table.Table className="w-full">
        <Table.TableHeader columns={columns} />
        <Table.TableBody>
          {filteredRoles.map((role) => (
            <Table.TableRow key={role.id}>
              <Table.TableCell>{role.name}</Table.TableCell>
              <Table.TableCell>{role.description}</Table.TableCell>
              <Table.TableCell>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditModal(role)}
                    className="text-gray-500 hover:text-black"
                  >
                    <IconPencil size={18} />
                  </button>
                  <button
                    onClick={() => openDeleteModal(role)}
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

export default RoleListData
