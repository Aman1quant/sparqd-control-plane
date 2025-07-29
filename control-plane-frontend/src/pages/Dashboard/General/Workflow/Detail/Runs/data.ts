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
  state:
    | "failed"
    | "success"
    | "running"
    | "queued"
    | "scheduled"
    | "up_for_retry"
    | "no_status"
  task_instances: TaskItem[]
}

export interface IDataRuns {
  dag_runs: DagRun[]
  total_entries: number
}

interface TaskRetryDelay {
  __type: string
  days: number
  microseconds: number
  seconds: number
}

interface TaskClassRef {
  class_name: string
  module_path: string
}

interface Task {
  class_ref: TaskClassRef
  depends_on_past: boolean
  doc_md: null
  downstream_task_ids: string[]
  end_date: null
  execution_timeout: null
  extra_links: any[]
  is_mapped: boolean
  operator_name: string
  owner: string
  params: Record<string, any>
  pool: string
  pool_slots: number
  priority_weight: number
  queue: string
  retries: number
  retry_delay: TaskRetryDelay
  retry_exponential_backoff: boolean
  start_date: string
  task_display_name: string
  task_id: string
  template_fields: string[]
  trigger_rule: string
  ui_color: string
  ui_fgcolor: string
  wait_for_downstream: boolean
  weight_rule: string
}

export interface IDataTasks {
  tasks: Task[]
  total_entries: number
}

/* task instances */
export interface SparkPodTemplate {
  metadata?: {
    annotations?: Record<string, string>
  }
}

export interface SparkToleration {
  effect: string
  key: string
  operator: string
}

export interface SparkDriverOrExecutor {
  cores: number
  env?: { name: string; value: string }[]
  instances?: number
  labels?: Record<string, string>
  memory: string
  nodeSelector?: Record<string, string>
  podTemplate?: SparkPodTemplate
  serviceAccount?: string
  tolerations?: SparkToleration[]
}

export interface SparkSpec {
  deps?: {
    jars?: string[]
  }
  driver: SparkDriverOrExecutor
  executor: SparkDriverOrExecutor
  image: string
  imagePullPolicy: string
  mainApplicationFile: string
  mode: string
  pythonVersion: string
  restartPolicy: {
    onFailureRetries: number
    onFailureRetryInterval: number
    onSubmissionFailureRetries: number
    onSubmissionFailureRetryInterval: number
    type: string
  }
  sparkConf: Record<string, string>
  sparkVersion: string
  type: string
}

export interface SparkTemplateSpec {
  spark: {
    apiVersion: string
    kind: string
    metadata: {
      labels: Record<string, string>
      name: string
      namespace: string
    }
    spec: SparkSpec
  }
}

export interface RenderedFields {
  application_file?: string | null
  kubernetes_conn_id?: string
  namespace?: string
  template_spec?: SparkTemplateSpec
}

export interface TaskItem {
  dag_id: string
  dag_run_id: string
  duration: number
  end_date: string
  execution_date: string
  executor: string | null
  executor_config: string
  hostname: string
  map_index: number
  max_tries: number
  note: string | null
  operator: string
  pid: number | null
  pool: string
  pool_slots: number
  priority_weight: number
  queue: string
  queued_when: string | null
  rendered_fields: RenderedFields
  rendered_map_index: number | null
  sla_miss: any
  start_date: string
  state: string
  task_display_name: string
  task_id: string
  trigger: any
  triggerer_job: any
  try_number: number
  unixname: string
}
