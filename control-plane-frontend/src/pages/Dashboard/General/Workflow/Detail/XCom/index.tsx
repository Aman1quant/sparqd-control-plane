import { Table } from "@components/commons"
import { XComData } from "./data"

import { useDetailWorkflow } from "@context/workflow/DetailWorkflow"
import http from "@http/axios"
import endpoint from "@http/endpoint"
import { useEffect, useState } from "react"
import { useLocation } from "react-router-dom"

const XCom = () => {
  const { runsData, workflowDetail } = useDetailWorkflow()
  const location = useLocation()
  const query = new URLSearchParams(location.search)

  const [data, setData] = useState<XComData>()

  const columns = [
    {
      label: "Key",
      sortable: true,
    },
    {
      label: "Value",
      sortable: true,
    },
  ]

  const getXcomData = async () => {
    try {
      const dagId = workflowDetail.dag_id || ""
      const runId =
        query.get("run_id") ||
        runsData?.dag_runs[runsData?.dag_runs?.length - 1]?.dag_run_id ||
        ""

      const taskId = query.get("task_id") || workflowDetail.dag_id || ""

      const response = await http.get(
        endpoint.dags.run.xcom(dagId, runId, taskId),
      )

      if (response.data?.xcom_entries?.length > 0) {
        const xcomEntries = await Promise.all(
          response.data.xcom_entries.map(async (xcom: any) => {
            const responseEntry = await http.get(
              endpoint.dags.run.xcomKey(dagId, runId, taskId, xcom.key),
            )
            return { ...xcom, pod_name: responseEntry.data }
          }),
        )

        setData({ ...response.data, xcom_entries: xcomEntries })
      }
    } catch (error) {
      console.error("Error fetching data:", error)
    }
  }

  useEffect(() => {
    if (workflowDetail.dag_id) {
      getXcomData()
    }
  }, [workflowDetail.dag_id, location.search])

  return (
    <Table.Table className="w-full" theme="secondary">
      <Table.TableHeader columns={columns} />
      <Table.TableBody>
        {data?.xcom_entries.map((data, idx) => (
          <Table.TableRow key={idx}>
            <Table.TableCell className=" w-[30%]">{data.key}</Table.TableCell>
            <Table.TableCell className="w-[70%]">
              {data.pod_name.value}
            </Table.TableCell>
          </Table.TableRow>
        ))}
      </Table.TableBody>
    </Table.Table>
  )
}

export default XCom
