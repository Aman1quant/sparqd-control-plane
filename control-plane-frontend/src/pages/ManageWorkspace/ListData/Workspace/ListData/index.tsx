import { IconPencil, IconTrash } from "@tabler/icons-react"
import { Table, Button } from "@components/commons"
import TextInput from "@components/commons/TextInput"
import { useCreateWorkspace } from "@context/workspace/CreateWorkspace"
import CreateWorkspace from "../Create"
import EditWorkspace from "../Edit"
import DeleteWorkspace from "../Delete"

const WorkspaceListData = () => {
  const {
    filteredWorkspace,
    searchQuery,
    setSearchQuery,
    isCreateModalOpen,
    openCreateModal,
    closeCreateModal,
    editingWorkspace,
    openEditModal,
    closeEditModal,
    deletingWorkspace,
    openDeleteModal,
  } = useCreateWorkspace()

  const columns = [
    { label: "Name" },
    { label: "Status" },
    { label: "Workspace URL" },
    { label: "Cloud" },
    { label: "Region" },
    { label: "Credential Name" },
    { label: "Created" },
    { label: "Action" },
    { label: "" },
  ]

  return (
    <div>
      <div className="mb-6">
        <label>Workspace</label>
      </div>

      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-4">
          <TextInput
            placeholder="Filter workspace"
            value={searchQuery}
            onChange={setSearchQuery}
            className="w-64"
          />
        </div>
        <Button
          label="Create Workspace"
          variant="solid"
          size="md"
          onClick={openCreateModal}
          className="w-[300px]"
        />
      </div>

      <Table.Table className="w-full">
        <Table.TableHeader columns={columns} />
        <Table.TableBody>
          {filteredWorkspace.map((workspace) => (
            <Table.TableRow key={workspace.id}>
              <Table.TableCell>
                <span className="text-primary">{workspace.name}</span>
              </Table.TableCell>
              <Table.TableCell>{workspace.status}</Table.TableCell>
              <Table.TableCell>{workspace.workspace_url}</Table.TableCell>
              <Table.TableCell>{workspace.region}</Table.TableCell>
              <Table.TableCell>
                <span className="italic">{workspace.cloud}</span>
              </Table.TableCell>
              <Table.TableCell>
                <span className="italic">{workspace.credential}</span>
              </Table.TableCell>
              <Table.TableCell>{workspace.created}</Table.TableCell>
              <Table.TableCell>
                <div className="flex items-center gap-2">
                  <button className="text-gray-500 hover:text-black">
                    <IconPencil
                      onClick={() => openEditModal(workspace)}
                      size={18}
                    />
                  </button>
                  <button className="text-gray-500 hover:text-red-600">
                    <IconTrash
                      onClick={() => openDeleteModal(workspace)}
                      size={18}
                    />
                  </button>
                </div>
              </Table.TableCell>
            </Table.TableRow>
          ))}
        </Table.TableBody>
      </Table.Table>

      {isCreateModalOpen && <CreateWorkspace onClose={closeCreateModal} />}
      {editingWorkspace && (
        <EditWorkspace workspace={editingWorkspace} onClose={closeEditModal} />
      )}
      {deletingWorkspace && <DeleteWorkspace />}
    </div>
  )
}

export default WorkspaceListData
