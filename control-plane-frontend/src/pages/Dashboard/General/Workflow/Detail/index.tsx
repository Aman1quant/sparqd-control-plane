import { useEffect, useState } from "react"
import Breadcrumb from "@components/commons/Breadcrumb"
import { useHeader } from "@context/layout/header/HeaderContext"
import { BsStar, BsChevronRight, BsStarFill } from "react-icons/bs"
import { useLocation, useNavigate, useParams } from "react-router-dom"
import styles from "./Detail.module.scss"
import { Button, DatePicker, Select, Tabs } from "@components/commons"
import Toggle from "@components/commons/Toggle"
import AuditLog from "./AuditLog"
import CodeViewer from "./Code"
import Calendar from "./Calendar"
import Graph from "./Graph"
import XCom from "./XCom"
import http from "@http/axios"
import endpoint from "@http/endpoint"
import {
  WorkflowDetailDataDummy,
  type TimeDelta,
  type WorkflowDetail,
} from "./data"
import Runs from "./Runs"
import {
  DetailWorkflowProvider,
  useDetailWorkflow,
} from "@context/workflow/DetailWorkflow"
import LogPage from "./Log"
import TaskDuration from "./TaskDuration"
import {
  IconExternalLink,
  IconPencil,
  IconTrash,
  IconUserCircle,
} from "@tabler/icons-react"

type TabItem = {
  id: string
  label: string
  active: boolean
  content?: React.ReactNode
}

const DetailWorklistPage = () => {
  const location = useLocation()
  const navigate = useNavigate()

  const [isStarred, setIsStarred] = useState(false)

  const toggleStar = () => {
    setIsStarred((prev) => !prev)
  }
  const { workflowDetail, setWorkflowDetail } = useDetailWorkflow()

  const [isOpen, setIsOpen] = useState(true)
  const [showContent, setShowContent] = useState(true)
  const [workflowDetailData, setWorkflowDetailData] = useState<WorkflowDetail>()

  const { dispatch } = useHeader()
  const { id } = useParams()

  const breadcrumbItems = [
    { label: "Workflow", href: "/admin/workflow", isActive: false },
    { label: workflowDetailData?.dag_display_name || "", isActive: true },
  ]
  const [selectedValue, setSelectedValue] = useState<number | string>("")
  const runTypes = [
    { value: "success", label: "Success" },
    { value: "failed", label: "Failed" },
  ]

  const runState = [
    { value: "upstream", label: "Upstream" },
    { value: "downstream", label: "Downstream" },
  ]

  const [datatabs, setDataTabs] = useState<TabItem[]>([])

  const getDetail = async (id: string) => {
    try {
      const response = await http.get(endpoint.dags.detail(id))

      setWorkflowDetailData(response.data)
      setWorkflowDetail(response.data)
    } catch (err) {
      setWorkflowDetailData(WorkflowDetailDataDummy)
      console.log(err)
    }
  }

  function formatTimeDelta(interval: TimeDelta) {
    const days = interval?.days ?? 0
    const seconds = interval?.seconds ?? 0

    const hrs = String(Math.floor(seconds / 3600)).padStart(1, "0")
    const mins = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0")
    const secs = String(seconds % 60).padStart(2, "0")

    return `${days} day${days !== 1 ? "s" : ""}, ${hrs}:${mins}:${secs}`
  }

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>

    if (isOpen) {
      timer = setTimeout(() => setShowContent(true), 400)
    } else {
      setShowContent(false)
    }

    return () => clearTimeout(timer)
  }, [isOpen])

  useEffect(() => {
    dispatch({
      type: "SET_HEADER",
      payload: {
        title: "",
        description: "",
        search: true,
      },
    })

    getDetail(id || "")
  }, [dispatch])

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const taskId = params.get("task_id")
    const tabId = params.get("tab") || "graph"

    const items: TabItem[] = [
      // {
      //   id: "grid",
      //   label: "Grid",
      //   active: tabId === "grid",
      //   content: <Grid />,
      // },
      {
        id: "graph",
        label: "Graph",
        active: tabId === "graph",
        content: <Graph />,
      },
      {
        id: "calendar",
        label: "Calendar",
        active: tabId === "calendar",
        content: <Calendar />,
      },
      {
        id: "code",
        label: "Code",
        active: tabId === "code",
        content: <CodeViewer />,
      },
      {
        id: "audit_log",
        label: "Audit Log",
        active: tabId === "audit_log",
        content: <AuditLog />,
      },
      ...(taskId
        ? [
            {
              id: "xcom",
              label: "XCom",
              active: tabId === "xcom",
              content: (
                <div className="mt-3">
                  <XCom />
                </div>
              ),
            },
            {
              id: "log",
              label: "Log",
              active: tabId === "log",
              content: (
                <div className="mt-3">
                  <LogPage />
                </div>
              ),
            },
          ]
        : []),

      {
        id: "task_duration",
        label: "Task Duration",
        active: tabId === "task_duration",
        content: <TaskDuration taskId={taskId || ""} />,
      },
    ]

    setDataTabs(items)
  }, [location.search])

  return (
    <div className={styles.workflowDetailContentWrapper}>
      <div className={styles.topSection}>
        <Breadcrumb items={breadcrumbItems} />
        <div className={styles.topRow}>
          <div className={styles.titleLabel}>
            <span className="truncate whitespace-nowrap">
              {workflowDetailData?.dag_display_name}
            </span>
            <span
              onClick={toggleStar}
              className={`${styles.starIcon} ${isStarred ? styles.active : ""}`}
            >
              {isStarred ? <BsStarFill /> : <BsStar />}
            </span>
          </div>
          <div className={styles.actions}>
            <Button
              variant="outline"
              color="danger"
              size="md"
              showLabel={false}
              iconLeft={<IconTrash size={20} />}
              onClick={() => console.log("Delete")}
            />
            <Button
              variant="solid"
              color="primary"
              size="md"
              label="Run now"
              onClick={() => console.log("Save")}
            />
          </div>
        </div>
      </div>
      <hr />
      <div className={styles.contentSection}>
        <div className={styles.mainContent}>
          <div className={styles.filterRow}>
            <div className={styles.filterInputs}>
              <DatePicker
                onChange={(date) => console.log(date)}
                selected={new Date()}
                dateFormat="MMM d, yyyy hh:mm aa"
                data-placement="bottom-end"
              />
              <Select
                options={runTypes}
                value={selectedValue}
                onChange={(value) => setSelectedValue(value)}
                placeholder="All Run Types"
                className={styles.flexGrowSelect}
              />
              <Select
                options={runState}
                value={selectedValue}
                onChange={(value) => setSelectedValue(value)}
                placeholder="All Run State"
                className={styles.flexGrowSelect}
              />
              <Button
                variant="outline"
                color="primary"
                responsive={true}
                size="sm"
                label="Clear Filters"
                onClick={() => console.log("Save")}
              />
            </div>
            <div className={styles.autoRefreshToggle}>
              <label className={styles.autoRefreshLabel}>Auto refresh</label>
              <Toggle color="primary" size="sm" checked />
            </div>
          </div>

          <label className="text-heading-6">Runs</label>
          <Runs />

          <Tabs
            items={datatabs}
            renderContent={() => (
              <div className="w-full overflow-x-auto">
                <div
                  className={`${
                    isOpen ? "w-full" : "max-w-full"
                  } h-fit flex flex-col gap-2`}
                >
                  {datatabs.find((tab) => tab.active)?.content}
                </div>
              </div>
            )}
            onClick={(tab) => {
              const params = new URLSearchParams(location.search)
              params.set("tab", tab.id || "grid")
              navigate(`/admin/workflow/${workflowDetail.dag_id}?${params}`)
            }}
          />
        </div>

        <div
          className={`${styles.sidePanelWrapper} ${!isOpen ? styles.closed : ""}`}
        >
          <button
            type="button"
            className={styles.toggleButton}
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? "Close side panel" : "Open side panel"}
          >
            <BsChevronRight
              className={`${styles.icon} ${!isOpen ? styles.rotated : ""}`}
            />
          </button>

          <div className={styles.sidePanel}>
            {showContent && (
              <div className={styles.sidePanelContent}>
                <h2 className="text-heading-6 mb-4">Job details</h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-y-4 text-body-medium">
                  <label className="text-black-400 col-span-1">Job ID</label>
                  <label className="col-span-2">
                    {workflowDetailData?.dag_id}
                  </label>
                  <label className="text-black-400 col-span-1">Creator</label>
                  <label className="col-span-2 flex items-center gap-2">
                    <IconUserCircle size={16} />{" "}
                    {workflowDetailData?.owners?.[0] ?? "None"}
                  </label>
                  <label className="text-black-400 col-span-1">Run as</label>
                  <label className="col-span-2 flex items-center gap-2">
                    <IconUserCircle size={16} /> mail@mail.com{" "}
                    <IconPencil size={16} />
                  </label>
                  <label className="text-black-400 col-span-1">Tags</label>
                  {(workflowDetailData?.tags || []).length > 0 ? (
                    <>
                      <label className="col-span-2 flex flex-wrap gap-1">
                        {workflowDetailData?.tags.map((tag, index) => (
                          <span key={index} className={styles.workflowTag}>
                            {tag.name}
                          </span>
                        ))}
                      </label>
                    </>
                  ) : (
                    <label className="col-span-2 font-medium">
                      <Button
                        variant="outline"
                        color="primary"
                        size="sm"
                        label="Add Tags"
                        onClick={() => console.log("Save")}
                      />
                    </label>
                  )}

                  <label className="text-black-400 col-span-1">
                    Description
                  </label>
                  <label className="col-span-2 font-medium">
                    {workflowDetailData?.description || (
                      <Button
                        variant="outline"
                        color="primary"
                        size="sm"
                        label="Add Description"
                        onClick={() => console.log("Save")}
                      />
                    )}
                  </label>
                  <label className="text-black-400 col-span-1">Lineage</label>
                  <label className="col-span-2 text-black-400">
                    No lineage information for this job.{" "}
                    <Button
                      variant="link"
                      color="primary"
                      size="sm"
                      label="Learn more"
                      iconRight={<IconExternalLink size={16} />}
                      onClick={() => console.log("Save")}
                    />
                  </label>
                </div>

                <h2 className="text-heading-6 mb-2 mt-6">
                  Schedules & Triggers
                </h2>
                <div className="text-body-medium">
                  <label className="text-black-400">
                    {workflowDetailData?.schedule_interval
                      ? workflowDetailData?.schedule_interval.__type ===
                        "CronExpression"
                        ? workflowDetailData?.schedule_interval.value
                        : formatTimeDelta(
                            workflowDetailData?.schedule_interval as TimeDelta,
                          )
                      : "None"}
                  </label>
                </div>

                <h2 className="flex align-middle items-center gap-2 text-heading-6 mb-2 mt-6">
                  Job parameters
                </h2>
                <label className="text-black-400">
                  {workflowDetailData?.params
                    ? JSON.stringify(workflowDetailData?.params, null, 2)
                    : "No parameters defined for this job."}
                </label>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

const DetailWorklist = () => {
  return (
    <DetailWorkflowProvider>
      <DetailWorklistPage />
    </DetailWorkflowProvider>
  )
}

export default DetailWorklist
