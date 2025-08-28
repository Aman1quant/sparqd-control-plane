import { BsThreeDots } from "react-icons/bs"
import styles from "./Trash.module.scss"
import { dataWorkspaceTableTrash } from "./data"
import { Table } from "@components/commons"
import Dropdown from "@components/commons/Dropdown"

const WorkspaceTableTrash = () => {
  const columns = [
    {
      label: "Name",
      sortable: true,
    },
    {
      label: "Type",
      sortable: true,
    },
    {
      label: "Owner",
      sortable: true,
    },
    {
      label: "Created",
      sortable: true,
    },
    {
      label: "",
      sortable: false,
    },
  ]

  return (
    <div>
      <label className="text-black text-heading-6 font-medium px-3">
        Trash
      </label>
      <hr className="mt-4" />
      <div className={styles.workspaceTableTrashWrapper}>
        <Table.Table className="w-full">
          <Table.TableHeader columns={columns} />
          <Table.TableBody>
            {dataWorkspaceTableTrash.map((workspaceTableTrash) => (
              <Table.TableRow key={workspaceTableTrash.id}>
                <Table.TableCell>
                  <label className="text-primary">
                    {workspaceTableTrash.name}
                  </label>
                </Table.TableCell>

                <Table.TableCell>{workspaceTableTrash.type}</Table.TableCell>
                <Table.TableCell>{workspaceTableTrash.owner}</Table.TableCell>

                <Table.TableCell>{workspaceTableTrash.created}</Table.TableCell>

                <Table.TableCell>
                  <Dropdown
                    items={[
                      {
                        label: "Detail",
                      },
                      {
                        label: "Edit",
                        onClick: () => {
                          console.log("Edit")
                        },
                      },
                    ]}
                    theme="default"
                    size="sm"
                    showArrow={false}
                    label={<BsThreeDots className="text-body-medium" />}
                  />
                </Table.TableCell>
              </Table.TableRow>
            ))}
          </Table.TableBody>
        </Table.Table>
      </div>
    </div>
  )
}

export default WorkspaceTableTrash
