import { BsStar } from "react-icons/bs"
import styles from "../Dashboard.module.scss"
import { dataDashboardTable } from "./data"
import { Table } from "@components/commons"

const DashboardTable = () => {
  const columns = [
    {
      label: "Name",
      sortable: true,
    },
    {
      label: "Tags",
      sortable: true,
    },
    {
      label: "Created by",
      sortable: true,
    },
    {
      label: "Created at",
      sortable: true,
    },
  ]

  return (
    <div className={styles.dashboardContentWrapper}>
      <div className={styles.dashboardTableWrapper}>
        <Table.Table className="w-full">
          <Table.TableHeader columns={columns} />
          <Table.TableBody>
            {dataDashboardTable.map((dashboardTable) => (
              <Table.TableRow key={dashboardTable.id}>
                <Table.TableCell className="flex items-center align-middle">
                  <BsStar className="mr-2" />
                  <label className="text-primary">{dashboardTable.name}</label>
                </Table.TableCell>

                <Table.TableCell>{dashboardTable.tags}</Table.TableCell>
                <Table.TableCell>{dashboardTable.createdBy}</Table.TableCell>

                <Table.TableCell>{dashboardTable.createdAt}</Table.TableCell>
              </Table.TableRow>
            ))}
          </Table.TableBody>
        </Table.Table>
      </div>
    </div>
  )
}

export default DashboardTable
