import { useEffect, useMemo, useState } from "react";
import { BsStar } from "react-icons/bs";
import styles from "../Dashboard.module.scss";
import { dataDashboardTable } from "./data";
import { Table } from "@components/commons";
import TableSkeleton from "@components/commons/Table/TableSkeleton";

const DashboardTable = () => {
  const [sortColumn, setSortColumn] = useState("createdAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [isLoading, setIsLoading] = useState(true);

  const handleSort = (columnKey: string) => {
    const direction =
      sortColumn === columnKey && sortDirection === "asc" ? "desc" : "asc";
    setSortColumn(columnKey);
    setSortDirection(direction);
  };

  const columns = [
    {
      label: "Name",
      key: "name",
      sortable: true,
    },
    {
      label: "Tags",
      key: "tags",
      sortable: false,
    },
    {
      label: "Created by",
      key: "createdBy",
      sortable: true,
    },
    {
      label: "Created at",
      key: "createdAt",
      sortable: true,
    },
  ];

  const sortedData = useMemo(() => {
    return [...dataDashboardTable].sort((a, b) => {
      const aValue = a[sortColumn as keyof typeof a] as string;
      const bValue = b[sortColumn as keyof typeof b] as string;
      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [dataDashboardTable, sortColumn, sortDirection]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={styles.dashboardContentWrapper}>
      <div className={styles.dashboardTableWrapper}>
        <Table.Table className="w-full">
          <Table.TableHeader
            columns={columns}
            sortColumn={sortColumn}
            sortDirection={sortDirection}
            onSort={handleSort}
          />
          <Table.TableBody>
            {isLoading ? (
              <TableSkeleton columns={columns.length} rows={5} />
            ) : (
              sortedData.map((dashboardTable) => (
                <Table.TableRow key={dashboardTable.id}>
                  <Table.TableCell className="flex items-center align-middle">
                    <BsStar className="mr-2" />
                    <label className="text-primary">{dashboardTable.name}</label>
                  </Table.TableCell>
                  <Table.TableCell>{dashboardTable.tags}</Table.TableCell>
                  <Table.TableCell>{dashboardTable.createdBy}</Table.TableCell>
                  <Table.TableCell>{dashboardTable.createdAt}</Table.TableCell>
                </Table.TableRow>
              ))
            )}
          </Table.TableBody>
        </Table.Table>
      </div>
    </div>
  );
};

export default DashboardTable;