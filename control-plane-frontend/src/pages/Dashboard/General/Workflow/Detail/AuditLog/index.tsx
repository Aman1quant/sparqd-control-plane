import { useEffect, useState } from "react"
import styles from "./AuditLog.module.scss"
import { type AuditLogData } from "./data"
import { Button, Table } from "@components/commons"
import { useDetailWorkflow } from "@context/workflow/DetailWorkflow"
import http from "@http/axios"
import endpoint from "@http/endpoint"

const AuditLog = () => {
  const { workflowDetail } = useDetailWorkflow()

  const [dataEvent, setDataEvent] = useState<AuditLogData[]>([])
  const columns = [
    {
      label: "Time",
      sortable: true,
    },
    {
      label: "Task ID",
      sortable: true,
    },
    {
      label: "Event",
      sortable: true,
    },
    {
      label: "Logical Date",
      sortable: true,
    },
    {
      label: "Owner",
      sortable: true,
    },
    {
      label: "Details",
      sortable: false,
    },
  ]

  const getData = async () => {
    try {
      const response = await http.get(endpoint.eventLog.main, {
        params: {
          dag_id: workflowDetail.dag_id,
        },
      })

      setDataEvent(response.data.event_logs)
    } catch (error) {
      console.error("Error fetching code:", error)
    }
  }

  useEffect(() => {
    getData()
  }, [])

  return (
    <div className={styles.auditLogContentWrapper}>
      <div className={styles.auditLogTableWrapper}>
        <Table.Table className="w-full">
          <Table.TableHeader columns={columns} />
          <Table.TableBody>
            {dataEvent.map((auditLog, index) => (
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

                <Table.TableCell>
                  <Button
                    variant="link"
                    color="primary"
                    label="See Details"
                    onClick={() => {
                      console.log("Details clicked for:", auditLog)
                    }}
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

export default AuditLog
