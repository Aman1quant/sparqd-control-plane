export interface XComEntry {
  dag_id: string;
  execution_date: string;
  key: string;
  map_index: number;
  task_id: string;
  timestamp: string;
  pod_name: PodName;
}

interface PodName {
  dag_id: string;
  execution_date: string;
  key: string;
  map_index: number;
  task_id: string;
  timestamp: string;
  value: string;
}

export interface XComData {
  total_entries: number;
  xcom_entries: XComEntry[];
}

export const XComData: XComData = {
  total_entries: 2,
  xcom_entries: [
    {
      dag_id: "bronze-precal-job",
      execution_date: "2025-05-14T08:08:58.992500+00:00",
      key: "pod_name",
      map_index: -1,
      task_id: "spark-task",
      timestamp: "2025-05-14T08:09:26.747233+00:00",
      pod_name: {
        dag_id: "bronze-precal-job",
        execution_date: "2025-05-14T08:08:58.992500+00:00",
        key: "pod_name",
        map_index: -1,
        task_id: "spark-task",
        timestamp: "2025-05-14T08:09:26.747233+00:00",
        value: "spark-task-64z23bck-driver",
      },
    },
    {
      dag_id: "bronze-precal-job",
      execution_date: "2025-05-14T08:08:58.992500+00:00",
      key: "pod_namespace",
      map_index: -1,
      task_id: "spark-task",
      timestamp: "2025-05-14T08:09:26.776304+00:00",
      pod_name: {
        dag_id: "bronze-precal-job",
        execution_date: "2025-05-14T08:08:58.992500+00:00",
        key: "pod_namespace",
        map_index: -1,
        task_id: "spark-task",
        timestamp: "2025-05-14T08:09:26.776304+00:00",
        value: "spark-team-a",
      },
    },
  ],
};