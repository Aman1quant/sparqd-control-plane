export interface AuditLogData {
  id: number
  when: string
  task_id: string
  event: string
  logicalDate: string
  owner: string
  execution_date?: string
}

export const dataAuditLog: AuditLogData[] = [
  {
    id: 1,
    when: "Mar 17,2025 at 10:50 PM",
    task_id: "article_mapping",
    event: "Manually",
    logicalDate: "Mar 19, 2025  18:00:00",
    owner: "Sneha",
  },
  {
    id: 2,
    when: "Mar 17,2025 at 10:50 PM",
    task_id: "article_mapping",
    event: "success",
    logicalDate: "none",
    owner: "Sneha",
  },
  {
    id: 3,
    when: "Mar 17,2025 at 10:50 PM",
    task_id: "article_mapping",
    event: "cli_task_run",
    logicalDate: "none",
    owner: "Sneha",
  },
  {
    id: 4,
    when: "Mar 17,2025 at 10:50 PM",
    task_id: "article_mapping",
    event: "Manually",
    logicalDate: "Mar 19, 2025  18:00:00",
    owner: "Sneha",
  },
]
