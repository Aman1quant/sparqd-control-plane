const endpoint = {
  dags: {
    main: "/v1/dags",
    detail: (dagId: string) => `/v1/dags/${dagId}/details`,
    run: {
      main: (dagId: string) => `/v1/dags/${dagId}/dagRuns`,
      detail: (dagId: string, runId: string) =>
        `/v1/dags/${dagId}/dagRuns/${runId}`,

      taskInstances: (dagId: string, runId: string) =>
        `/v1/dags/${dagId}/dagRuns/${runId}/taskInstances`,

      xcom: (dagId: string, runId: string, taskId: string) =>
        `/v1/dags/${dagId}/dagRuns/${runId}/taskInstances/${taskId}/xcomEntries`,
      xcomKey: (dagId: string, runId: string, taskId: string, key: string) =>
        `/v1/dags/${dagId}/dagRuns/${runId}/taskInstances/${taskId}/xcomEntries/${key}`,

      log: (dagId: string, runId: string, taskId: string) =>
        `/v1/dags/${dagId}/dagRuns/${runId}/taskInstances/${taskId}/logs/1?full_content=false`,
    },

    tasks: {
      main: (dagId: string) => `/v1/dags/${dagId}/tasks`,
    },
  },

  dagStats: {
    main: "/v1/dagStats",
  },

  dagSource: {
    file: (file_token: string) => `/v1/dagSources/${file_token}`,
  },

  eventLog: {
    main: `/v1/eventLogs`,
  },

  auth: {
    main: "/realms/dataplatform/protocol/openid-connect/token",
  },

  task_stats: {
    main: "/task-stats",
  },
  last_dag_runs: {
    main: "/last_dagruns",
  },
  grid_data: {
    main: "/grid_data",
  },
  graph_data: {
    main: "/graph_data",
  },

  /* jupyter */
  jupyter: {
    start_server: "/start-kernel",
    get_server: "/kernels",
    list_workspace: "/workspace",
    list_workspace_local: "/local-fs",
    files: "/files",
    breadcrumbs: "/breadcrumbs",
    get_file_s3: "/get-file-s3",
    get_file_local: "/get-file-local",
    folders: "/folders",
    upload: "/upload",
    rename: "/rename",
    delete: "/delete",
    kernels: {
      main: "/kernels",
      detail: (kernelId: string) => `/kernels/${kernelId}`,
      start: (kernelId: string) => `/kernels/${kernelId}/start`,
      interrupt: (kernelId: string) => `/kernels/${kernelId}/interrupt`,
      restart: (kernelId: string) => `/kernels/${kernelId}/restart`,
    },

    server: {
      start: "/start-server",
      stop: "/stop-server",
      status: "/status-server",
    },
  },

  new_api: {
    onboarding: "/v1/onboarding",
    workspace: {
      main: "/v1/workspace",
      detail: (workspaceId: string) => `/v1/workspace/${workspaceId}`,
    },
    auth: {
      singup: "/v1/auth/signup",
    },
    cluster: {
      main: "/v1/cluster",
      detail: (uid: string) => `/v1/cluster/${uid}`,
    },
  },

  /* superset */
  superset: {
    auth: {
      login: "/v1/security/login",
      refresh: "/v1/security/refresh",
    },

    database: {
      main: "/v1/database/",
      schemas: (dbId: number) => `/v1/database/${dbId}/schemas/`,
      tables: (dbId: number) => `/v1/database/${dbId}/tables/`,
      columns: (dbId: number, schema: string, table: string) =>
        `/v1/database/${dbId}/table/${encodeURIComponent(table)}/${encodeURIComponent(schema)}/`,
    },
    security: {
      csrf_token: "/v1/security/csrf_token/",
    },
    query: {
      main: "/v1/query/",
      // Saved query
      saved_query: "/v1/saved_query/",
      delete_saved_query: (id: number) => `/v1/saved_query/${id}`,
      related_database: "/v1/saved_query/related/database",
      distinct_schema: "/v1/saved_query/distinct/schema",
      related_changed_by: "/v1/saved_query/related/changed_by",
      history_related_database: "/v1/query/related/database",
      history_distinct_status: "/v1/query/distinct/status",
      history_related_user: "/v1/query/related/user",
    },
    sqllab: {
      tabs_state: "/v1/sqllab/",
      tab_state: (tabId: string | number) => `/v1/query/${tabId}`,
      execute: "/v1/sqllab/execute/",
    },

    node: {
      saved_query: {
        main: "/saved_query/",
        delete: (id: number) => `/saved_query/${id}`,
      },
      sqllab: {
        format_query: "/sqllab/format_query",
        execute: "/sqllab/execute",
        estimate: "/sqllab/estimate",
      },
    },
  },
}

export default endpoint
