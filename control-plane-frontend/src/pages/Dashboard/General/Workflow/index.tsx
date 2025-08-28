import { useEffect, useState } from "react"
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

const Workflow = () => {
  const navigate = useNavigate()
  const { dispatch } = useHeader()
  const { modal, handleModal, closeModal } = useModal()

  const [data, setData] = useState<any[]>([])
  const [dataDagStats, setDataDagStats] = useState<any[]>([])
  const [selectedValue, setSelectedValue] = useState<number | string>("")
  const [filter, setFilter] = useState({
    dag_id_pattern: "",
    limit: 10,
  })
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 10,
    totalRecords: 100,
  })

  const [recentTask, setRecentTask] = useState<any[]>([])

  const options = [
    { value: "all", label: "All" },
    { value: "user1", label: "User 1" },
    { value: "user2", label: "User 2" },
  ]

  const items = [
    { label: "All", count: 12, active: false },
    { label: "Active", count: 4, active: false },
    { label: "Paused", count: 8, active: true },
  ]

  const columns = [
    {
      label: "State",
      sortable: false,
    },
    {
      label: "Name",
      sortable: true,
    },
    {
      label: "Owner",
      sortable: true,
    },
    {
      label: (
        <div className="flex items-center justify-start gap-2">
          Runs <BiInfoCircle className="text-body-large" />
        </div>
      ),
      sortable: true,
    },
    {
      label: "Schedule",
      sortable: true,
    },
    {
      label: (
        <div className="flex items-center justify-start gap-2">
          Last Runs <BiInfoCircle className="text-body-large" />
        </div>
      ),
      sortable: true,
    },
    {
      label: (
        <div className="flex items-center justify-start gap-2">
          Next Runs <BiInfoCircle className="text-body-large" />
        </div>
      ),
      sortable: true,
    },
    {
      label: "Recent Task",
      sortable: true,
    },
    {
      label: "",
      sortable: false,
    },
  ]

  const openModal = () => {
    if (modal) return closeModal()

    handleModal(<CreateWorkflow onClose={closeModal} />)
  }

  const getDagTaskList = async (dagId: string) => {
    try {
      const data = await http.get(endpoint.dagStats.main, {
        params: {
          dag_ids: dagId,
        },
      })
      setDataDagStats(data.data.dags)
    } catch (error) {
      console.error("Error fetching dag tasks:", error)
      return []
    }
  }

  const getData = async (page = 1) => {
    try {
      const offset = (page - 1) * filter.limit

      const data = await http.get(endpoint.dags.main, {
        params: {
          ...filter,
          offset,
        },
      })

      const dags = data.data.dags
      setData(dags)
      setPagination({
        currentPage: page,
        totalPages: Math.ceil(data.data.total_entries / filter.limit),
        totalRecords: data.data.total_entries,
      })

      const dagIdsArray: string[] = dags.map((dag: any) => dag.dag_id)

      getDagTaskList(dagIdsArray.join(","))

      const urlEncoded = qs.stringify(
        { dag_ids: dagIdsArray },
        { arrayFormat: "repeat" },
      )

      const responseRecentTask = await httpAirflow.post(
        endpoint.task_stats.main,
        urlEncoded,
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        },
      )

      setRecentTask(responseRecentTask.data)

      await httpAirflow.post(
        endpoint.last_dag_runs.main,
        {
          dag_ids: dagIdsArray,
        },
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        },
      )

      // setLastDagRun(responseLastDagRun.data)
    } catch (error) {
      console.error("Error fetching data:", error)
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

  useEffect(() => {
    dispatch({
      type: "SET_HEADER",
      payload: {
        title: "Workflow List",
        description: "A Short description will be placed right over here",
        search: true,
      },
    })

    getData()
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
                  setFilter({
                    ...filter,
                    dag_id_pattern: e.target.value,
                  })
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
                onClick={() => {
                  console.log("Filter")
                }}
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
                  <Table.TableHeader columns={columns} />
                  <Table.TableBody>
                    {data.map((workflow, index) => (
                      <Table.TableRow
                        key={index}
                        className="items-center align-top"
                      >
                        <Table.TableCell className="items-center align-middle">
                          <span>
                            <Toggle
                              color="primary"
                              size="sm"
                              // checked={workflow.is_active}
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
                              onClick={() => {
                                console.log("Debug")
                              }}
                            />
                            <Button
                              variant="outline"
                              color="danger"
                              size="sm"
                              showLabel={false}
                              iconLeft={<IconTrash size={16} />}
                              onClick={() => {
                                console.log("Delete")
                              }}
                            />
                            <Dropdown
                              items={[
                                {
                                  label: "Detail",
                                  onClick: () => {
                                    navigate(
                                      "/admin/workflow/" + workflow.dag_id,
                                    )
                                  },
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
                              label={
                                <BsThreeDots className="text-body-large" />
                              }
                            />
                          </div>
                        </Table.TableCell>
                      </Table.TableRow>
                    ))}
                  </Table.TableBody>
                </Table.Table>
              </div>

              <Table.Pagination
                totalPages={pagination.totalPages}
                currentPage={pagination.currentPage}
                totalRecords={pagination.totalRecords}
                onPageChange={(page) => {
                  getData(page)
                }}
              />
            </div>
          </div>
        </div>
      )}
    />
  )
}

export default Workflow
