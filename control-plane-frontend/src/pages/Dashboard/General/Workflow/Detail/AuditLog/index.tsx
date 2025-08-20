import { useEffect, useState, useMemo } from "react";
import styles from "./AuditLog.module.scss";
import { type AuditLogData } from "./data";
import { Table } from "@components/commons";
import { useDetailWorkflow } from "@context/workflow/DetailWorkflow";
import http from "@http/axios";
import endpoint from "@http/endpoint";
import TableSkeleton from "@components/commons/Table/TableSkeleton";

const AuditLog = () => {
  const { workflowDetail } = useDetailWorkflow();
  const [dataEvent, setDataEvent] = useState<AuditLogData[]>([]);
  const [sortColumn, setSortColumn] = useState<keyof AuditLogData>("when");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [isLoading, setIsLoading] = useState(true);

  const handleSort = (columnKey: string) => {
    const key = columnKey as keyof AuditLogData;
    const direction =
      sortColumn === key && sortDirection === "asc" ? "desc" : "asc";
    setSortColumn(key);
    setSortDirection(direction);
  };

  const columns = [
    { label: "Time", key: "when", sortable: true },
    { label: "Task ID", key: "task_id", sortable: true },
    { label: "Event", key: "event", sortable: true },
    { label: "Logical Date", key: "execution_date", sortable: true },
    { label: "Owner", key: "owner", sortable: true },
  ];

  const sortedData = useMemo(() => {
    return [...dataEvent].sort((a, b) => {
      const aValue = a[sortColumn] || "";
      const bValue = b[sortColumn] || "";
      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [dataEvent, sortColumn, sortDirection]);

  const getData = async () => {
    setIsLoading(true);
    try {
      const response = await http.get(endpoint.eventLog.main, {
        params: {
          dag_id: workflowDetail.dag_id,
        },
      });
      setDataEvent(response.data.event_logs);
    } catch (error) {
      console.error("Error fetching code:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getData();
  }, []);

  return (
    <div className={styles.auditLogContentWrapper}>
      <div className={styles.auditLogTableWrapper}>
        <Table.Table className="w-full">
          <Table.TableHeader
            columns={columns}
            sortColumn={sortColumn}
            sortDirection={sortDirection}
            onSort={handleSort}
          />
          <Table.TableBody>
            {isLoading ? (
              <TableSkeleton columns={columns.length} rows={10} />
            ) : (
              sortedData.map((auditLog, index) => (
                <Table.TableRow key={index}>
                  <Table.TableCell>
                    <label className={styles.auditLogName}>
                      {auditLog.when ?? "-"}
                    </label>
                  </Table.TableCell>
                  <Table.TableCell>{auditLog.task_id ?? "-"}</Table.TableCell>
                  <Table.TableCell>{auditLog.event ?? "-"}</Table.TableCell>
                  <Table.TableCell>
                    {auditLog.execution_date ?? "-"}
                  </Table.TableCell>
                  <Table.TableCell>{auditLog.owner ?? "-"}</Table.TableCell>
                </Table.TableRow>
              ))
            )}
          </Table.TableBody>
        </Table.Table>
      </div>
    </div>
  );
};

export default AuditLog;