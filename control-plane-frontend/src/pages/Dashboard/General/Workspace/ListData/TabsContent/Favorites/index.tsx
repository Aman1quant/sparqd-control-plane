import { BsStarFill, BsThreeDots } from "react-icons/bs"
import styles from "./Favorites.module.scss"
import { dataWorkspaceTableFavorites } from "./data"
import { Table } from "@components/commons"
import Dropdown from "@components/commons/Dropdown"

const WorkspaceTableFavorites = () => {
  const columns = [
    {
      label: "",
      sortable: false,
    },
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
      label: "Location",
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
        Favorites
      </label>
      <hr className="mt-4" />
      <div className={styles.workspaceTableFavoritesWrapper}>
        <Table.Table className="w-full">
          <Table.TableHeader columns={columns} />
          <Table.TableBody>
            {dataWorkspaceTableFavorites.map((workspaceTableFavorites) => (
              <Table.TableRow key={workspaceTableFavorites.id}>
                <Table.TableCell>
                  <BsStarFill className="ms-2 text-yellow" />
                </Table.TableCell>
                <Table.TableCell>
                  <label className="text-primary">
                    {workspaceTableFavorites.name}
                  </label>
                </Table.TableCell>

                <Table.TableCell>
                  {workspaceTableFavorites.type}
                </Table.TableCell>
                <Table.TableCell>
                  {workspaceTableFavorites.owner}
                </Table.TableCell>

                <Table.TableCell>
                  {workspaceTableFavorites.location}
                </Table.TableCell>

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

export default WorkspaceTableFavorites
