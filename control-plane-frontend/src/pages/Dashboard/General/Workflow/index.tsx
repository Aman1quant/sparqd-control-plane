import { useEffect, useMemo, useState } from "react"
import clsx from "clsx"
import { useNavigate } from "react-router-dom"
import { format } from "date-fns"
import qs from "qs"
import { BiInfoCircle } from "react-icons/bi"
import { BsThreeDots } from "react-icons/bs"
import { useHeader } from "@context/layout/header/HeaderContext"
import http, { httpAirflow } from "@http/axios"
import endpoint from "@http/endpoint"
import { Search } from "@components/commons/Search"
import { Button, Select, Table, Tabs } from "@components/commons"
import Toggle from "@components/commons/Toggle"
import Dropdown from "@components/commons/Dropdown"
import { useModal } from "@context/layout/ModalContext"
import styles from "./Workflow.module.scss"
import CreateWorkflow from "./Create"
import { lastDagRuns } from "./data"
import {
  IconAdjustments,
  IconInfoCircle,
  IconPlayerPlay,
  IconPlus,
  IconTrash,
} from "@tabler/icons-react"
import TableSkeleton from "@components/commons/Table/TableSkeleton";

const Workflow = () => {
  const navigate = useNavigate()
  const { dispatch } = useHeader()
  const { modal, handleModal, closeModal } = useModal()

  const [activeTab, setActiveTab] = useState("All")
  const [unfilteredData, setUnfilteredData] = useState<any[]>([])
  const [dataDagStats, setDataDagStats] = useState<any[]>([])
  const [selectedValue, setSelectedValue] = useState<number | string>("all")
  const [filter, setFilter] = useState({
    dag_id_pattern: "",
    limit: 100, // Ambil lebih banyak data untuk filter client-side
  })
  const [pagination, setPagination] = useState({
    pageSize: 10,
    currentPage: 1,
  })
  const [tabCounts, setTabCounts] = useState({ All: 0, Active: 0, Paused: 0 })
  const [recentTask, setRecentTask] = useState<any[]>([])
  const [sortColumn, setSortColumn] = useState("dag_id")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [isLoading, setIsLoading] = useState(true);

  const handleSort = (columnKey: string) => {
    const direction =
      sortColumn === columnKey && sortDirection === "asc" ? "desc" : "asc"
    setSortColumn(columnKey)
    setSortDirection(direction)
  }

  const data = useMemo(() => {
    if (activeTab === "Active") {
      return unfilteredData.filter((dag) => !dag.is_paused)
    }
    if (activeTab === "Paused") {
      return unfilteredData.filter((dag) => dag.is_paused)
    }
    return unfilteredData
  }, [unfilteredData, activeTab])

  const filteredDataByOwner = useMemo(() => {
    if (!selectedValue || selectedValue === "all") {
      return data
    }
    return data.filter((workflow) => workflow.owners.includes(selectedValue))
  }, [data, selectedValue])

  const sortedData = useMemo(() => {
    return [...filteredDataByOwner].sort((a, b) => {
      const aValue = a[sortColumn] || ""
      const bValue = b[sortColumn] || ""
      if (sortColumn === "next_dagrun" || sortColumn === "last_dagrun") {
        const dateA = aValue ? new Date(aValue).getTime() : 0
        const dateB = bValue ? new Date(bValue).getTime() : 0
        return sortDirection === "asc" ? dateA - dateB : dateB - dateA
      }
      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1
      return 0
    })
  }, [filteredDataByOwner, sortColumn, sortDirection])

  const totalRecords = sortedData.length
  const totalPages = Math.ceil(totalRecords / pagination.pageSize)

  const paginatedData = useMemo(() => {
    const startIndex = (pagination.currentPage - 1) * pagination.pageSize
    const endIndex = startIndex + pagination.pageSize
    return sortedData.slice(startIndex, endIndex)
  }, [sortedData, pagination.currentPage, pagination.pageSize])

  const options = [
    { value: "all", label: "All" },
    { value: "airflow", label: "airflow" },
  ]

  const items = useMemo(
    () => [
      { label: "All", count: tabCounts.All, active: activeTab === "All" },
      {
        label: "Active",
        count: tabCounts.Active,
        active: activeTab === "Active",
      },
      {
        label: "Paused",
        count: tabCounts.Paused,
        active: activeTab === "Paused",
      },
    ],
    [activeTab, tabCounts],
  )

  const columns = [
    { label: "State", key: "is_paused", sortable: true },
    { label: "Name", key: "dag_id", sortable: true },
    { label: "Owner", key: "owners", sortable: true },
    {
      label: (
        <div className="flex items-center justify-start gap-2">
          Runs <BiInfoCircle className="text-body-large" />
        </div>
      ),
      key: "runs",
      sortable: false,
    },
    { label: "Schedule", key: "schedule_interval", sortable: true },
    {
      label: (
        <div className="flex items-center justify-start gap-2">
          Last Runs <BiInfoCircle className="text-body-large" />
        </div>
      ),
      key: "last_dagrun",
      sortable: true,
    },
    {
      label: (
        <div className="flex items-center justify-start gap-2">
          Next Runs <BiInfoCircle className="text-body-large" />
        </div>
      ),
      key: "next_dagrun",
      sortable: true,
    },
    { label: "Recent Task", key: "recent_tasks", sortable: false },
    { label: "", key: "actions", sortable: false },
  ]

  const openModal = () => {
    if (modal) return closeModal()
    handleModal(<CreateWorkflow onClose={closeModal} />)
  }

  const getDagTaskList = async (dagId: string) => {
    try {
      const response = await http.get(endpoint.dagStats.main, {
        params: { dag_ids: dagId },
      })
      setDataDagStats(response.data.dags)
    } catch (error) {
      console.error("Error fetching dag tasks:", error)
    }
  }

  const fetchTabCounts = async () => {
    try {
      const [allRes, activeRes, pausedRes] = await Promise.all([
        http.get(endpoint.dags.main, { params: { limit: 1 } }),
        http.get(endpoint.dags.main, { params: { limit: 1, paused: false } }),
        http.get(endpoint.dags.main, { params: { limit: 1, paused: true } }),
      ])
      setTabCounts({
        All: allRes.data.total_entries,
        Active: activeRes.data.total_entries,
        Paused: pausedRes.data.total_entries,
      })
    } catch (error) {
      console.error("Error fetching tab counts:", error)
    }
  }

  const getData = async (page = 1) => {
    setIsLoading(true);
    try {
      const offset = (page - 1) * filter.limit
      const params: any = { ...filter, offset }
      const response = await http.get(endpoint.dags.main, { params })
      const dags = response.data.dags
      setUnfilteredData(dags)

      const dagIdsArray: string[] = dags.map((dag: any) => dag.dag_id)
      if (dagIdsArray.length > 0) {
        getDagTaskList(dagIdsArray.join(","))
        const urlEncoded = qs.stringify(
          { dag_ids: dagIdsArray },
          { arrayFormat: "repeat" },
        )
        const responseRecentTask = await httpAirflow.post(
          endpoint.task_stats.main,
          urlEncoded,
          { headers: { "Content-Type": "application/x-www-form-urlencoded" } },
        )
        setRecentTask(responseRecentTask.data)
        await httpAirflow.post(
          endpoint.last_dag_runs.main,
          { dag_ids: dagIdsArray },
          { headers: { "Content-Type": "application/x-www-form-urlencoded" } },
        )
      }
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setIsLoading(false);
    }
  }

  type TimeDelta = {
    days?: number
    seconds?: number
    microseconds?: number
  }

  function formatTimeDelta(interval: TimeDelta) {
    const days = interval?.days ?? 0
    const seconds = interval?.seconds ?? 0
    const hrs = String(Math.floor(seconds / 3600)).padStart(1, "0")
    const mins = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0")
    const secs = String(seconds % 60).padStart(2, "0")
    return `${days} day${days !== 1 ? "s" : ""}, ${hrs}:${mins}:${secs}`
  }

  const getRunsNumber = (dag_id: string, state: string) => {
    const dagStats = dataDagStats.find((dag: any) => dag.dag_id === dag_id)
    if (!dagStats) return ""
    const stat = dagStats.stats.find((s: any) => s.state === state)
    if (!stat || stat.count === 0) return ""
    return stat.count
  }

  function getRecentTaskCount(
    recentTask: any,
    dag_id: string,
    state: any = null,
  ) {
    return (
      recentTask[dag_id]?.find((task: any) => task.state === state)?.count || ""
    )
  }

  const handleTabClick = (tabLabel: string) => {
    const newStatus = tabLabel as "All" | "Active" | "Paused"
    setActiveTab(newStatus)
    setPagination((p) => ({ ...p, currentPage: 1 }))
  }

  useEffect(() => {
    dispatch({
      type: "SET_HEADER",
      payload: {
        title: "Workflow List",
        description: "A Short description will be placed right over here",
        search: true,
      },
    })
    getData(1)
    fetchTabCounts()
  }, [])

  const taskStatusStyles = {
    empty: styles.status__empty,
    success: styles.status__success,
    error: styles.status__error,
    running: styles.status__running,
    queued: styles.status__queued,
    upstream_failed: styles.status__upstream_failed,
  }

  return (
    <Tabs
      items={items}
      showCount={true}
      onClick={(tab) => handleTabClick(tab.label)}
      renderContent={() => (
        <div className="py-4">
          <div className={styles.workflowHeader}>
            <div className={styles.workflowActionsLeft}>
              <Search
                placeholder="Search by workflow and tasks"
                sizes="md"
                type="default"
                className={styles.workflowSearch}
                onChange={(e) => {
                  setFilter({ ...filter, dag_id_pattern: e.target.value })
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    getData(1)
                  }
                }}
              />
              <Select
                options={options}
                value={selectedValue}
                onChange={(value) => setSelectedValue(value)}
                placeholder="Created by"
                className={styles.workflowSelect}
              />
              <div className={styles.workflowCheckbox}>
                <input
                  id="default-checkbox"
                  type="checkbox"
                  value=""
                  className={styles.workflowCheckboxInput}
                />
                <label
                  htmlFor="default-checkbox"
                  className={styles.workflowCheckboxLabel}
                >
                  Only pinned
                </label>
              </div>
              <Button
                variant="solid"
                color="default"
                size="md"
                showLabel={false}
                iconLeft={<IconAdjustments size="20" />}
                onClick={() => console.log("Filter")}
              />
            </div>
            <div className={styles.workflowActionsRight}>
              <Button
                variant="solid"
                color="primary"
                size="md"
                label="Create Workflow"
                iconLeft={<IconPlus size={20} />}
                onClick={() => openModal()}
              />
            </div>
          </div>
          <div className={styles.workflowContentWrapper}>
            <div className={styles.workflowTableWrapper}>
              <div className="overflow-x-auto">
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
                      paginatedData.map((workflow, index) => (
                        <Table.TableRow
                          key={index}
                          className="items-center align-top border-b"
                        >
                          <Table.TableCell className="items-center align-middle">
                            <span>
                              <Toggle
                                color="primary"
                                size="sm"
                                checked={!workflow.is_paused}
                              />
                            </span>
                          </Table.TableCell>
                          <Table.TableCell>
                            <div className="flex flex-col">
                              <span
                                onClick={() => {
                                  navigate("/admin/workflow/" + workflow.dag_id)
                                }}
                                className={styles.workflowName}
                              >
                                {workflow.dag_display_name}
                              </span>
                              <div className="nowrap">
                                {workflow.tags.map((tag: any, idx: number) => (
                                  <span className={styles.workflowTag} key={idx}>
                                    {tag.name}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </Table.TableCell>
                          <Table.TableCell>
                            {workflow.owners.map((owner: any, index: number) => (
                              <span
                                className={clsx(
                                  styles.workflowTag,
                                  "!bg-black-50 !text-black-600",
                                )}
                                key={index}
                              >
                                {owner}
                              </span>
                            ))}
                          </Table.TableCell>
                          <Table.TableCell className="flex gap-2">
                            <div className="contents items-center justify-center">
                              {(() => {
                                const value = getRunsNumber(
                                  workflow.dag_id,
                                  "queued",
                                )
                                const isEmpty = value === "" || value === 0
                                return (
                                  <span
                                    title="Queued"
                                    className={clsx(
                                      styles.task_status,
                                      isEmpty
                                        ? taskStatusStyles.empty
                                        : taskStatusStyles.queued,
                                    )}
                                  >
                                    {value}
                                  </span>
                                )
                              })()}
                              {(() => {
                                const value = getRunsNumber(
                                  workflow.dag_id,
                                  "success",
                                )
                                const isEmpty = value === "" || value === 0
                                return (
                                  <span
                                    title="Success"
                                    className={clsx(
                                      styles.task_status,
                                      isEmpty
                                        ? taskStatusStyles.empty
                                        : taskStatusStyles.success,
                                    )}
                                  >
                                    {value}
                                  </span>
                                )
                              })()}
                              {(() => {
                                const value = getRunsNumber(
                                  workflow.dag_id,
                                  "running",
                                )
                                const isEmpty = value === "" || value === 0
                                return (
                                  <span
                                    title="Running"
                                    className={clsx(
                                      styles.task_status,
                                      isEmpty
                                        ? taskStatusStyles.empty
                                        : taskStatusStyles.running,
                                    )}
                                  >
                                    {value}
                                  </span>
                                )
                              })()}
                              {(() => {
                                const value = getRunsNumber(
                                  workflow.dag_id,
                                  "failed",
                                )
                                const isEmpty = value === "" || value === 0
                                return (
                                  <span
                                    title="Failed"
                                    className={clsx(
                                      styles.task_status,
                                      isEmpty
                                        ? taskStatusStyles.empty
                                        : taskStatusStyles.error,
                                    )}
                                  >
                                    {value}
                                  </span>
                                )
                              })()}
                            </div>
                          </Table.TableCell>
                          <Table.TableCell>
                            <div className="flex items-center gap-1 ">
                              <div className={styles.workflowSchedule}>
                                {!workflow.schedule_interval
                                  ? "None"
                                  : workflow.schedule_interval.__type ===
                                      "CronExpression"
                                    ? workflow.schedule_interval.value
                                    : formatTimeDelta(workflow.schedule_interval)}
                              </div>
                              <IconInfoCircle
                                size={20}
                                title="Info"
                                className="text-black-300"
                              />
                            </div>
                          </Table.TableCell>
                          <Table.TableCell>
                            <span className={styles.workflowName}>
                              {lastDagRuns?.[
                                workflow.dag_id as keyof typeof lastDagRuns
                              ]?.end_date
                                ? format(
                                    new Date(
                                      lastDagRuns?.[
                                        workflow.dag_id as keyof typeof lastDagRuns
                                      ]?.end_date,
                                    ),
                                    "MMM d, yyyy 'at' h:mm a",
                                  )
                                : "-"}
                            </span>
                          </Table.TableCell>
                          <Table.TableCell>
                            <span className="text-body-medium text-black-500">
                              {workflow.next_dagrun
                                ? format(
                                    new Date(workflow.next_dagrun),
                                    "MMM d, yyyy 'at' h:mm a",
                                  )
                                : "-"}
                            </span>
                          </Table.TableCell>
                          <Table.TableCell className="flex gap-2">
                            {[
                              "none",
                              "removed",
                              "scheduled",
                              "queued",
                              "running",
                              "success",
                              "restarting",
                              "failed",
                              "up_for_retry",
                              "up_for_reschedule",
                              "upstream_failed",
                              "skipped",
                              "deferred",
                              "shutdown",
                            ].map((status) => {
                              const count = getRecentTaskCount(
                                recentTask,
                                workflow.dag_id,
                                status,
                              )
                              const isEmpty = !count
                              const getStatusStyle = (status: string): string => {
                                if (isEmpty) return taskStatusStyles.empty
                                switch (status) {
                                  case "success":
                                  case "restarting":
                                    return taskStatusStyles.success
                                  case "failed":
                                    return taskStatusStyles.error
                                  case "running":
                                    return taskStatusStyles.running
                                  case "queued":
                                    return taskStatusStyles.queued
                                  case "upstream_failed":
                                    return taskStatusStyles.upstream_failed
                                  default:
                                    return taskStatusStyles.empty
                                }
                              }
                              return (
                                <div
                                  title={status}
                                  key={status}
                                  className={clsx(
                                    styles.task_status,
                                    getStatusStyle(status),
                                  )}
                                >
                                  {count}
                                </div>
                              )
                            })}
                          </Table.TableCell>
                          <Table.TableCell>
                            <div className="flex items-center  gap-2">
                              <Button
                                variant="outline"
                                color="primary"
                                size="sm"
                                showLabel={false}
                                iconLeft={<IconPlayerPlay size={14} />}
                                onClick={() => console.log("Debug")}
                              />
                              <Button
                                variant="outline"
                                color="danger"
                                size="sm"
                                showLabel={false}
                                iconLeft={<IconTrash size={16} />}
                                onClick={() => console.log("Delete")}
                              />
                              <Dropdown
                                items={[
                                  {
                                    label: "Detail",
                                    onClick: () =>
                                      navigate(
                                        "/admin/workflow/" + workflow.dag_id,
                                      ),
                                  },
                                  {
                                    label: "Edit",
                                    onClick: () => console.log("Edit"),
                                  },
                                ]}
                                theme="default"
                                size="sm"
                                showArrow={false}
                                label={
                                  <BsThreeDots className="text-body-large" />
                                }
                              />
                            </div>
                          </Table.TableCell>
                        </Table.TableRow>
                      ))
                    )}
                  </Table.TableBody>
                </Table.Table>
              </div>
              <Table.Pagination
                pageSize={pagination.pageSize}
                totalPages={totalPages}
                currentPage={pagination.currentPage}
                totalRecords={totalRecords}
                onPageChange={(page) =>
                  setPagination((p) => ({ ...p, currentPage: page }))
                }
              />
            </div>
          </div>
        </div>
      )}
    />
  )
}

export default Workflow
