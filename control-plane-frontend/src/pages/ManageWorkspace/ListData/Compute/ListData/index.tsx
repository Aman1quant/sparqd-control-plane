import { Table, Button, TextInput } from "@components/commons"
import { useCreateWorkspace } from "@context/workspace/CreateWorkspace"
import { IconPencil, IconTrash } from "@tabler/icons-react"
import { useEffect } from "react"

const ComputeListData = () => {
  const {
    filteredComputes,
    computeSearchQuery,
    setComputeSearchQuery,
    openAddComputeModal,
    openEditComputeModal,
    openDeleteComputeModal,
    fetchComputes,
    menuItem,
  } = useCreateWorkspace()

  const columns = [
    { label: "Cluster Name" },
    { label: "Size" },
    { label: "Status" },
    { label: "Workspace" },
    { label: "Created By" },
    { label: "Created At" },
    { label: "Actions" },
  ]

  useEffect(() => {
    fetchComputes()
  }, [menuItem])

  return (
    <div>
      <div className="mb-6">
        <label>Compute</label>
      </div>
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-4 w-72">
          <TextInput
            placeholder="Filter clusters"
            value={computeSearchQuery}
            onChange={setComputeSearchQuery}
          />
        </div>
        <Button
          label="Create Compute"
          variant="solid"
          size="md"
          onClick={openAddComputeModal}
        />
      </div>
      <Table.Table className="w-full">
        <Table.TableHeader columns={columns} />
        <Table.TableBody>
          {filteredComputes.map((compute) => (
            <Table.TableRow key={compute.id}>
              <Table.TableCell>{compute.name}</Table.TableCell>
              <Table.TableCell>{compute.size}</Table.TableCell>
              <Table.TableCell>{compute.status}</Table.TableCell>
              <Table.TableCell>{compute.workspaceName}</Table.TableCell>
              <Table.TableCell>{compute.createdBy}</Table.TableCell>
              <Table.TableCell>{compute.createdAt}</Table.TableCell>
              <Table.TableCell>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditComputeModal(compute)}
                    className="text-gray-500 hover:text-black"
                  >
                    <IconPencil size={18} />
                  </button>
                  <button
                    onClick={() => openDeleteComputeModal(compute)}
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

export default ComputeListData
