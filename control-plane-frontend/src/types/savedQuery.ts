export interface User {
  first_name: string
  id: number
  last_name: string
}

export interface Database {
  database_name: string
  id: number
}

export interface SqlTable {
  catalog: string | null
  schema: string
  table: string
}

export interface Tag {
  id: number
  name: string
  type: string
}

export interface SavedQuery {
  catalog: string | null
  changed_by: User
  changed_on: string
  changed_on_delta_humanized: string
  created_by: User
  created_on: string
  database: Database
  db_id: number
  description: string
  extra: Record<string, any>
  id: number
  label: string
  tab_name: string
  last_run_delta_humanized: string
  rows: number | null
  schema: string
  sql: string
  executed_sql: string
  sql_tables: SqlTable[]
  tags: Tag[]
}

export interface LabelColumns {
  catalog: string
  "changed_by.first_name": string
  "changed_by.id": string
  "changed_by.last_name": string
  changed_on: string
  changed_on_delta_humanized: string
  "created_by.first_name": string
  "created_by.id": string
  "created_by.last_name": string
  created_on: string
  "database.database_name": string
  "database.id": string
  db_id: string
  description: string
  extra: string
  id: string
  label: string
  last_run_delta_humanized: string
  rows: string
  schema: string
  sql: string
  sql_tables: string
  "tags.id": string
  "tags.name": string
  "tags.type": string
}

export interface SavedQueryApiResponse {
  count: number
  description_columns: Record<string, any>
  ids: number[]
  label_columns: LabelColumns
  list_columns: string[]
  list_title: string
  order_columns: string[]
  result: SavedQuery[]
}

export interface SavedQueryApiParams {
  page?: number
  page_size?: number
  order_column?: string
  order_direction?: "asc" | "desc"
  filters?: Record<string, any>
}

export interface ApiError {
  message: string
  error_code?: string
  details?: any
}

export type SavedQueryApiResult =
  | { success: true; data: SavedQueryApiResponse }
  | { success: false; error: ApiError }
