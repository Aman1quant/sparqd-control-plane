import { Table, Button } from "@components/commons"
import TextInput from "@components/commons/TextInput"

const WorkspaceListData = () => {

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
            value={""}
            className="w-64"
          />
        </div>
        <Button
          label="Create Workspace"
          variant="solid"
          size="md"
          className="w-[300px]"
        />
      </div>

      <Table.Table className="w-full">
        <Table.TableHeader columns={columns} />

      </Table.Table>

    </div>
  )
}

export default WorkspaceListData
