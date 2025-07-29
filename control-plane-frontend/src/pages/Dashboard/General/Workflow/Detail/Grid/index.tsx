import {
  BsArrowRepeat,
  BsCheckCircle,
  BsClock,
  BsXSquare,
} from "react-icons/bs"
import styles from "./Grid.module.scss"
import { dataGrid } from "./data"
import { Table } from "@components/commons"

const Grid = () => {
  const columns = [
    {
      label: "Name",
      sortable: true,
    },
    {
      label: "Run ID",
      sortable: true,
    },
    {
      label: "Launched",
      sortable: true,
    },
    {
      label: "Duration",
      sortable: true,
    },
    {
      label: "Status",
      sortable: true,
    },
    {
      label: "Error Code",
      sortable: true,
    },
    {
      label: "Run Parameters",
      sortable: true,
    },
    {
      label: "",
      sortable: false,
    },
  ]

  return (
    <div className={styles.gridContentWrapper}>
      <div className={styles.gridTableWrapper}>
        <Table.Table className="w-full">
          <Table.TableHeader columns={columns} />
          <Table.TableBody>
            {dataGrid.map((grid) => (
              <Table.TableRow key={grid.id}>
                <Table.TableCell>
                  <label className={styles.gridName}>{grid.name}</label>
                </Table.TableCell>
                <Table.TableCell>{grid.runID}</Table.TableCell>

                <Table.TableCell>{grid.launched}</Table.TableCell>
                <Table.TableCell>{grid.duration}</Table.TableCell>
                <Table.TableCell className="flex items-center align-middle gap-2">
                  {grid.status === "Success" && (
                    <BsCheckCircle className="text-green" />
                  )}
                  {grid.status === "Queued" && <BsClock />}
                  {grid.status === "Running" && <BsArrowRepeat />}
                  {grid.status}
                </Table.TableCell>
                <Table.TableCell>{grid.errorCode}</Table.TableCell>
                <Table.TableCell>{grid.runParameter}</Table.TableCell>
                <Table.TableCell>
                  <div className="flex items-center align-middle gap-4">
                    <BsXSquare className="text-red" />
                    {/* <Button
                      theme="link"
                      size="xs"
                      className="bg-white w-full gap-2 md:w-fit"
                      onClick={() => console.log("Save")}
                    >
                      <BsThreeDots />
                    </Button> */}
                  </div>
                </Table.TableCell>
              </Table.TableRow>
            ))}
          </Table.TableBody>
        </Table.Table>
      </div>
    </div>
  )
}

export default Grid
