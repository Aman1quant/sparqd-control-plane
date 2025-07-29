import { createContext, useContext, useState } from "react"

interface IDetailWorkflowContext {
  workflowDetail: TWorkflowDetail
  setWorkflowDetail: (payload: TWorkflowDetail) => void
  runsData?: IDataRuns
  setRunsData?: (payload: IDataRuns) => void
}

export type TWorkflowDetail = Partial<{
  dag_display_name: string
  dag_id: string
  default_view: string
  description: string | null
  file_token: string
  fileloc: string
  has_import_errors: boolean
  has_task_concurrency_limits: boolean
  is_active: boolean
  is_paused: boolean
  is_subdag: boolean
  last_expired: string | null
  last_parsed_time: string
  last_pickled: string | null
  max_active_runs: number
  max_active_tasks: number
  max_consecutive_failed_dag_runs: number
  next_dagrun: string | null
  next_dagrun_create_after: string | null
  next_dagrun_data_interval_end: string | null
  next_dagrun_data_interval_start: string | null
  owners: string[]
  pickle_id: string | null
  root_dag_id: string | null
  schedule_interval: string | null
  scheduler_lock: string | null
  tags: Tag[]
  timetable_description: string
}>

interface DagRun {
  conf: Record<string, any>
  dag_id: string
  dag_run_id: string
  data_interval_end: string
  data_interval_start: string
  end_date: string
  execution_date: string
  external_trigger: boolean
  last_scheduling_decision: string
  logical_date: string
  note: string | null
  run_type: string
  start_date: string
  state: "failed" | "success"
}

export type IDataRuns = {
  dag_runs: DagRun[]
  total_entries: number
}

interface Tag {
  name: string
}

const DetailWorkflowContext = createContext<IDetailWorkflowContext | undefined>(
  undefined,
)

export const DetailWorkflowProvider = ({
  children,
}: {
  children: React.ReactNode
}) => {
  const [detailWorkflow, setDetailWorkflow] = useState<TWorkflowDetail>({})
  const [runsData, setRunsData] = useState<IDataRuns>({
    dag_runs: [],
    total_entries: 0,
  })

  const updateDetailWorkflow = (data: TWorkflowDetail) => {
    setDetailWorkflow((prev) => ({
      ...prev,
      ...data,
    }))
  }

  const updateRunsData = (runs: IDataRuns) => {
    setRunsData((prev) => ({
      ...prev,
      ...runs,
    }))
  }
  return (
    <DetailWorkflowContext.Provider
      value={{
        workflowDetail: detailWorkflow,
        setWorkflowDetail: updateDetailWorkflow,
        runsData,
        setRunsData: updateRunsData,
      }}
    >
      {children}
    </DetailWorkflowContext.Provider>
  )
}

export const useDetailWorkflow = () => {
  const context = useContext(DetailWorkflowContext)
  if (!context) {
    throw new Error(
      "useDetailWorkflow must be used within a DetailWorkflowProvider",
    )
  }
  return context
}
