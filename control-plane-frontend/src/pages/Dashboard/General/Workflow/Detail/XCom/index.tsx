import { Table } from "@components/commons";
import { useDetailWorkflow } from "@context/workflow/DetailWorkflow";
import http from "@http/axios";
import endpoint from "@http/endpoint";
import { useEffect, useState, useMemo } from "react";
import { useLocation } from "react-router-dom";
import type { XComData, XComEntry } from "./data";

const XCom = () => {
  const { runsData, workflowDetail } = useDetailWorkflow();
  const location = useLocation();
  const query = new URLSearchParams(location.search);

  const [data, setData] = useState<XComData>();
  const [sortColumn, setSortColumn] = useState<keyof XComEntry>("key");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const handleSort = (columnKey: string) => {
    const key = columnKey as keyof XComEntry;
    const direction =
      sortColumn === key && sortDirection === "asc" ? "desc" : "asc";
    setSortColumn(key);
    setSortDirection(direction);
  };

  const columns = [
    {
      label: "Key",
      key: "key",
      sortable: true,
    },
    {
      label: "Value",
      key: "value",
      sortable: true,
    },
  ];
  
  const sortedData = useMemo(() => {
    if (!data?.xcom_entries) return [];
    return [...data.xcom_entries].sort((a, b) => {
      const aValue = a.pod_name?.value || "";
      const bValue = b.pod_name?.value || "";
      
      const valA = sortColumn === 'key' ? a.key : aValue;
      const valB = sortColumn === 'key' ? b.key : bValue;
      
      if (valA < valB) return sortDirection === "asc" ? -1 : 1;
      if (valA > valB) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [data, sortColumn, sortDirection]);

  const getXcomData = async () => {
    try {
      const dagId = workflowDetail.dag_id || "";
      const runId =
        query.get("run_id") ||
        runsData?.dag_runs[runsData?.dag_runs?.length - 1]?.dag_run_id ||
        "";
      const taskId = query.get("task_id") || workflowDetail.dag_id || "";

      if (!dagId || !runId || !taskId) return;

      const response = await http.get(
        endpoint.dags.run.xcom(dagId, runId, taskId)
      );

      if (response.data?.xcom_entries?.length > 0) {
        const xcomEntries = await Promise.all(
          response.data.xcom_entries.map(async (xcom: any) => {
            const responseEntry = await http.get(
              endpoint.dags.run.xcomKey(dagId, runId, taskId, xcom.key)
            );
            return { ...xcom, pod_name: responseEntry.data };
          })
        );
        setData({ ...response.data, xcom_entries: xcomEntries });
      } else {
        setData({ ...response.data, xcom_entries: [] });
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    if (workflowDetail.dag_id) {
      getXcomData();
    }
  }, [workflowDetail.dag_id, location.search]);

  return (
    <div className="overflow-x-auto">
        <Table.Table className="w-full" theme="secondary">
        <Table.TableHeader 
            columns={columns}
            sortColumn={sortColumn}
            sortDirection={sortDirection}
            onSort={handleSort}
        />
        <Table.TableBody>
            {sortedData.map((data, idx) => (
            <Table.TableRow key={idx}>
                <Table.TableCell className=" w-[30%]">{data.key}</Table.TableCell>
                <Table.TableCell className="w-[70%]">
                {data.pod_name.value}
                </Table.TableCell>
            </Table.TableRow>
            ))}
        </Table.TableBody>
        </Table.Table>
    </div>
  );
};

export default XCom;