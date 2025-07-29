import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useDetailWorkflow } from "@context/workflow/DetailWorkflow"
import http from "@http/axios"
import endpoint from "@http/endpoint"

import styles from "./Runs.module.scss"
import type { IDataTasks, IDataRuns } from "./data"

const Runs = () => {
  const navigate = useNavigate()

  const { workflowDetail, setRunsData } = useDetailWorkflow()
  const [data, setData] = useState<IDataRuns>({
    dag_runs: [],
    total_entries: 0,
  })
  const [taskData, setTaskData] = useState<IDataTasks>({
    tasks: [],
    total_entries: 0,
  })

  const columnWidth = 27
  const chartHeight = 100
  const yAxisWidth = 50

  const getData = async () => {
    try {
      const response = await http.get(
        endpoint.dags.run.main(workflowDetail.dag_id || ""),
        {
          params: {
            limit: 1000,
          },
        },
      )

      setRunsData?.(response.data)

      if (response?.data?.dag_runs?.length > 0) {
        const recentRuns = [...response.data.dag_runs].slice(-20)
        for (let idx = 0; idx < recentRuns.length; idx++) {
          const dagRun = recentRuns[idx]
          const instances = await getTaskInstances(
            dagRun.dag_id,
            dagRun.dag_run_id,
          )
          dagRun.task_instances = instances
        }

        setData({ ...response.data, dag_runs: recentRuns })
      } else {
        setData({ dag_runs: [], total_entries: 0 })
      }
    } catch (error) {
      console.error("Error fetching data:", error)
    }
  }

  const getTasks = async () => {
    try {
      const response = await http.get(
        endpoint.dags.tasks.main(workflowDetail.dag_id || ""),
        { params: { order_by: "start_date" } },
      )
      setTaskData(response.data)
    } catch (error) {
      console.error("Error fetching tasks:", error)
    }
  }

  const getTaskInstances = async (dagId: string, runId: string) => {
    try {
      const response = await http.get(
        endpoint.dags.run.taskInstances(dagId, runId),
      )
      return response.data.task_instances || []
    } catch (error) {
      console.error("Error fetching task instances:", error)
      return []
    }
  }

  const getDuration = (start: string, end?: string) => {
    const startTime = new Date(start).getTime()
    const endTime = end ? new Date(end).getTime() : Date.now()
    return Math.max((endTime - startTime) / 1000, 1)
  }

  const getMaxDuration = () => {
    return Math.max(
      ...data.dag_runs.map((run) => getDuration(run.start_date, run.end_date)),
      1,
    )
  }

  const getHeight = (duration: number, maxDuration: number) => {
    return Math.max((duration / maxDuration) * chartHeight, 15)
  }

  const getYAxisTicks = (maxDuration: number) => {
    const step = Math.ceil(maxDuration / 3)
    return [0, step * 2, maxDuration].reverse()
  }

  const formatDuration = (seconds: number): string => {
    const days = Math.floor(seconds / (60 * 60 * 24))
    const hours = Math.floor((seconds % (60 * 60 * 24)) / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)
    if (days > 0) {
      return `${days}d${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`
    }
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`
  }

  function formatDateUTC(dateStr?: string) {
    if (!dateStr) return "N/A"
    const date = new Date(dateStr)
    return `${date.toISOString().split("T")[0]}, ${date.toISOString().split("T")[1].split(".")[0]} UTC`
  }

  useEffect(() => {
    if (workflowDetail.dag_id) {
      getData()
      getTasks()
    }
  }, [workflowDetail.dag_id])

  const maxDuration = getMaxDuration()
  const yTicks = getYAxisTicks(maxDuration)

  const YAxisLabels = () => (
    <div style={{ width: yAxisWidth }}>
      <label style={{ fontSize: 13, color: "#8F9091" }}>Duration</label>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          alignItems: "flex-end",
          height: `${chartHeight + 15}px`,
          borderRight: "2px solid #e5e7eb",
          paddingTop: 8,
        }}
      >
        {yTicks.map((tick) => (
          <div
            key={tick}
            style={{
              fontSize: 10,
              color: "#9ca3af",
              textAlign: "right",
              paddingRight: 6,
            }}
          >
            {formatDuration(tick)}
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <div className="overflow-x-auto">
      <div className="flex relative">
        <YAxisLabels />

        <div className="flex-1 relative w-[87%] md:w-full">
          <div
            style={{
              position: "absolute",
              top: 30,
              left: 0,
              height: `${chartHeight}px`,
              width: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              pointerEvents: "none",
              zIndex: 0,
            }}
          >
            {yTicks.map((_, idx) => (
              <div
                key={idx}
                style={{
                  width: "100%",
                  border: "1px solid #e5e7eb",
                }}
              />
            ))}
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              zIndex: 1,
              position: "relative",
              paddingLeft: 4,
            }}
          >
            {data.dag_runs.map((run, i) => {
              const duration = getDuration(run.start_date, run.end_date)
              const barHeight = getHeight(duration, maxDuration)

              const showLabel = [0, 10].includes(i)
              const showGrid = showLabel

              return (
                <div
                  key={run.start_date}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    width: columnWidth,
                    position: "relative",
                  }}
                >
                  {showGrid && (
                    <div
                      style={{
                        position: "absolute",
                        top: 0,
                        bottom: 0,
                        left: "50%",
                        width: 1,
                        backgroundColor: "#e5e7eb",
                        zIndex: -9999,
                      }}
                    />
                  )}

                  {showLabel ? (
                    <div
                      style={{
                        fontSize: 11,
                        color: "#333",
                        textShadow: "-1px 1px 0px white",
                        marginBottom: 10,
                        transform: "rotate(-45deg)",
                        transformOrigin: "top right",
                        whiteSpace: "nowrap",
                        height: 30,
                        zIndex: 1,
                      }}
                    >
                      {new Date(run.start_date).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false,
                      })}
                    </div>
                  ) : (
                    <div style={{ height: 30, marginBottom: 10 }} />
                  )}

                  <div
                    style={{
                      height: chartHeight,
                      display: "flex",
                      alignItems: "flex-end",
                      justifyContent: "center",
                      width: "100%",
                    }}
                  >
                    <div
                      title={`Status: ${run.state}\nExecution Date: ${formatDateUTC(run.start_date)}\nDuration: ${formatDuration(duration)}`}
                      style={{
                        height: `${barHeight}px`,
                        width: 12,
                        background:
                          run.state === "success"
                            ? "#008000"
                            : run.state === "running"
                              ? "#00FF00"
                              : "red",
                        borderRadius: 2,
                        marginBottom: 1,
                      }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className={styles.sectionDivider} />

      <div className={styles.bottomSection}>
        <div className={styles.taskLabels}>
          {taskData.tasks.map((t, idx) => (
            <div key={idx} className={styles.taskName}>
              {t.task_display_name}
            </div>
          ))}
        </div>

        <div className={styles.taskGridWrapper}>
          {taskData.tasks.map((task, idx) => (
            <div key={idx} className={styles.taskRow}>
              {data.dag_runs.map((run, i) => {
                const taskInstance = run.task_instances?.find(
                  (ti) => ti.task_id === task.task_id,
                )
                const isSuccess = taskInstance?.state === "success"
                const isRunning = taskInstance?.state === "running"
                const isFailed = taskInstance?.state === "failed"
                return (
                  <div
                    onClick={() => {
                      if (taskInstance) {
                        const params = new URLSearchParams(location.search)

                        params.set("run_id", run.dag_run_id)
                        params.set("task_id", taskInstance.task_id)

                        navigate(
                          `/admin/workflow/${workflowDetail.dag_id}?${params}`,
                        )
                      }
                    }}
                    key={i}
                    title={`Task: ${task.task_id}\nStatus: ${taskInstance?.state ?? "N/A"}\nStarted: ${taskInstance?.start_date ? formatDateUTC(taskInstance?.start_date) : "N/A"}\nEnded: ${taskInstance?.end_date ? formatDateUTC(taskInstance.end_date) : "N/A"}`}
                    className={styles.taskBox}
                    style={{
                      cursor: "pointer",
                      backgroundColor: isSuccess
                        ? "#008000"
                        : isRunning
                          ? "#00FF00"
                          : isFailed
                            ? "#ff4d4f"
                            : "#e5e7eb",
                      border: isFailed ? "1.5px solid red" : "none",
                    }}
                  />
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Runs
