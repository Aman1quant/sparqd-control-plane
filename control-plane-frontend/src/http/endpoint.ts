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
  },

  /* new api */
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
}

export default endpoint
