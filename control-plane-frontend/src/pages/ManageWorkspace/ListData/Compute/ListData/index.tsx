import { Table, Button, TextInput } from "@components/commons"

const ComputeListData = () => {

  const columns = [
    { label: "Cluster Name" },
    { label: "Size" },
    { label: "Status" },
    { label: "Workspace" },
    { label: "Created By" },
    { label: "Created At" },
    { label: "Actions" },
  ]

  return (
    <div>
      <div className="mb-6">
        <label>Compute</label>
      </div>
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-4 w-72">
          <TextInput
            placeholder="Filter clusters"
            value={""}
          />
        </div>
        <Button
          label="Create Compute"
          variant="solid"
          size="md"
        />
      </div>
      <Table.Table className="w-full">
        <Table.TableHeader columns={columns} />
      </Table.Table>
    </div>
  )
}

export default ComputeListData
