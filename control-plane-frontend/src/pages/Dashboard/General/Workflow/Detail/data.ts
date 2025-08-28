export interface WorkflowDetail {
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
  schedule_interval: {
    __type: string
    value: string
  }
  scheduler_lock: string | null
  tags: Tag[]
  timetable_description: string
  params: {}
}

export type TimeDelta = {
  days?: number
  seconds?: number
  microseconds?: number
}

interface Tag {
  name: string
}

export const WorkflowDetailDataDummy: WorkflowDetail = {
  dag_display_name: "bronze-precal-job",
  dag_id: "bronze-precal-job",
  default_view: "grid",
  description: null,
  file_token:
    ".eJxT0s8vKNFPzCxKy8kv109JTC_WL0otyIewkory86pSQex4CDO-oCg1OTFHr6BSCQBiZxVh.THKZlZl5pWozxU3IIHjef_Bivfo",
  fileloc: "/opt/airflow/dags/repo/dags/bronze/dag_bronze_precal.py",
  has_import_errors: false,
  has_task_concurrency_limits: false,
  is_active: true,
  is_paused: false,
  is_subdag: false,
  last_expired: null,
  last_parsed_time: "2025-05-29T06:49:54.410469+00:00",
  last_pickled: null,
  max_active_runs: 16,
  max_active_tasks: 16,
  max_consecutive_failed_dag_runs: 0,
  next_dagrun: null,
  next_dagrun_create_after: null,
  next_dagrun_data_interval_end: null,
  next_dagrun_data_interval_start: null,
  owners: ["airflow"],
  pickle_id: null,
  root_dag_id: null,
  schedule_interval: {
    __type: "timedelta",
    value: "0:00:00",
  },
  scheduler_lock: null,
  tags: [
    {
      name: "kubernetes",
    },
    {
      name: "spark-operator",
    },
    {
      name: "example",
    },
    {
      name: "spark",
    },
  ],
  timetable_description: "Never, external triggers only",
  params: {},
}
