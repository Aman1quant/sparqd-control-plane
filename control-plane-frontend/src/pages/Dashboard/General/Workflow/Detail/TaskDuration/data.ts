export interface DagRun {
  conf: any | null
  conf_is_json: boolean
  data_interval_end: string
  data_interval_start: string
  end_date: string
  execution_date: string
  external_trigger: boolean
  last_scheduling_decision: string
  note: string | null
  queued_at: string
  run_id: string
  run_type: string
  start_date: string
  state: string
}

export interface TaskInstance {
  end_date: string
  note: string | null
  queued_dttm: string | null
  run_id: string
  start_date: string
  state: string
  task_id: string
  try_number: number
}

export interface TaskGroupChild {
  extra_links: any[]
  has_outlet_datasets: boolean
  id: string
  instances: TaskInstance[]
  is_mapped: boolean
  label: string
  operator: string
  trigger_rule: string
}

export interface TaskGroups {
  children: TaskGroupChild[]
  id: string | null
  instances: any[]
  label: string | null
}

export interface AirflowData {
  dag_runs: DagRun[]
  errors: any[]
  groups: TaskGroups
  ordering: string[]
}

export interface Series {
  id: string;
  color: string;
  values: { date: Date; duration: number | null; run_id: string }[];
}
