import {
  createContext,
  useContext,
  useState,
  useMemo,
  useEffect,
  useRef,
} from "react"
import { v4 as uuidv4 } from "uuid"
import { toast } from "react-toastify"

import type { SavedQuery } from "@/types/savedQuery"
import { httpNodeSuperset, httpSuperset } from "@http/axios"
import endpoint from "@http/endpoint"

const LOCAL_STORAGE_KEY = "sqlEditorTabs"

const getTabsFromLocalStorage = (): QueryTab[] => {
  try {
    const savedTabs = window.localStorage.getItem(LOCAL_STORAGE_KEY)
    return savedTabs ? JSON.parse(savedTabs) : []
  } catch (error) {
    console.error("Failed to parse tabs from localStorage", error)
    return []
  }
}

const saveTabsToLocalStorage = (tabs: QueryTab[]) => {
  try {
    window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(tabs))
  } catch (error) {
    console.error("Failed to save tabs to localStorage", error)
  }
}

interface TableData {
  [key: string]: any
}

export interface QueryTab {
  id: string
  name: string
  sql: string
  results: TableData[]
  estimate?: Partial<{
    totalRows: string
    cpuCost: string
    startDttm: number
    endDttm: number
    outputSize: string
  }>
  tags: string
  createdBy: string
  createdAt: string
  isFavorite?: boolean
  catalog?: string
  schema?: string
}

export interface QueryHistoryItem {
  id: string
  sql: string
  start_time: number
  end_time: number
  status: "success" | "failed" | "running"
  tab_name: string | null
  schema: string | null
  sql_tables: { table: string }[]
  database: {
    id: number
    database_name: string
  }
  user: {
    first_name: string
    last_name: string
  }
  rows: number | null
}

interface IQueryContext {
  tabs: QueryTab[]
  activeTabId: string | null
  activeTab: QueryTab | undefined
  queriesPageTab: string
  setQueriesPageTab: (tab: string) => void
  queryHistory: any[]
  savedQueries: SavedQuery[]
  setSavedQueries: React.Dispatch<React.SetStateAction<SavedQuery[]>>
  setQueryHistory: (history: any[]) => void
  databaseOptions: { value: number; label: string }[]
  schemaOptions: { value: string; label: string }[]
  modifiedByOptions: { value: number; label: string }[]
  setDatabaseOptions: (options: { value: number; label: string }[]) => void
  setSchemaOptions: (options: { value: string; label: string }[]) => void
  setModifiedByOptions: (options: { value: number; label: string }[]) => void
  stateOptions: { value: string; label: string }[]
  setStateOptions: (options: { value: string; label: string }[]) => void
  userOptions: { value: number; label: string }[]
  setUserOptions: (options: { value: number; label: string }[]) => void
  currentPage: number
  setCurrentPage: (page: number) => void
  totalPages: number
  setTotalPages: (count: number) => void
  pageSize: number
  totalRecords: number
  setTotalRecords: (count: number) => void
  addTab: (query?: Partial<SavedQuery & { catalog: string | null }>) => void
  closeTab: (id: string) => void
  setActiveTabId: (id: string) => void
  updateTabSql: (tabId: string, sql: string) => void
  runQuery: (tabId: string) => void
  isShareModalOpen: boolean
  openShareModal: () => void
  closeShareModal: () => void
  fetchQueryHistory: (page?: number) => Promise<void>
  renameTab: (tabId: string, newName: string) => void
  saveQuery: (tabId: string, dbId: number, schema: string) => Promise<void>
  formatSql: (tabId: string) => Promise<void>
  executeQuery: (tabId: string, dbId: string, schema: string) => Promise<void>
  executeQuerySelection: (
    tabId: string,
    dbId: string,
    schema: string,
    selectedSql: string,
  ) => Promise<void>
  isExecuteLoading: boolean
  elapsedTime: number
  cancelExecution: () => void
  errorResult: string | null
}

// const initialTabs: QueryTab[] = [
//   {
//     id: "1",
//     name: "New Query 2025-07-14 11:07am",
//     sql: "SELECT * FROM",
//     results: [],
//     tags: "",
//     createdBy: "farhan@gmail.com",
//     createdAt: "Mar 19, 2025 18:00:00",
//     isFavorite: true,
//   },
// ]

const demoResults: TableData[] = [
  {
    pre_cal_id: "000ecff68b005b99fd4544b635b48b3a",
    pre_cal: "preCalSuccess",
    username: "pro44379",
    member_id: "64e68b5d40b029cf7e8c56b7",
    provider: "PMTS",
    fullname_provider: "Pragmatic Play",
    prefix: "789B",
    fullname_prefix: "789betting",
    type: "Slot",
    game_id: "6825c6b43a56c3d0dd9a1652",
    game_name: "resurrecting riches",
    create_date: "2025-06-10T03:37:41.162000+00:00",
    update_date: "2025-06-10T04:30:56.481000+00:00",
    currency: "THB",
    exchange_rates: 1,
    stake: 211,
    bet_amt: -241,
    pay_out_amt: 105.75,
    valid_amt: -241,
    win_lose: -135.25,
    comm_amt: 0,
    comm_rate: 0,
    ip_geo: "52.221.111.66",
    lvl_0_position: "SUPER_ADMIN",
    lvl_0_agent_id: "608ba9a124314971bdeca7f0",
    lvl_0_ag_user: "superadmin",
    lvl_0_pay_out: -10.57501,
    lvl_0_pt_amt: 24.1,
    date: "2025-06-10",
  },
  {
    pre_cal_id: "0018825addfd09f64a6199feba971c3f",
    pre_cal: "preCalSuccess",
    username: "star283489",
    member_id: "682f8f927d7fad1c2fbdb613",
    provider: "PGS",
    fullname_provider: "Pgsoft Seamless",
    prefix: "911B",
    fullname_prefix: "911betting",
    type: "Slot",
    game_id: "60531c5534d88c344ce9acbd",
    game_name: "treasures of aztec",
    create_date: "2025-06-10T02:21:20.946000+00:00",
    update_date: "2025-06-10T02:21:20.945000+00:00",
    currency: "THB",
    exchange_rates: 1,
    stake: 48,
    bet_amt: -23,
    pay_out_amt: 30.55,
    valid_amt: -23,
    win_lose: 7.55,
    comm_amt: 0,
    comm_rate: 0,
    ip_geo: "",
    date: "2025-06-10",
  },
]

const QueryContext = createContext<IQueryContext | undefined>(undefined)

export const QueryProvider = ({ children }: { children: React.ReactNode }) => {
  const [tabs, setTabs] = useState<QueryTab[]>([])
  const [activeTabId, setActiveTabId] = useState<string | null>(null)
  const [queriesPageTab, setQueriesPageTab] = useState("Saved queries")
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)
  const [queryHistory, setQueryHistory] = useState<any[]>([])
  const [savedQueries, setSavedQueries] = useState<SavedQuery[]>([])
  const [databaseOptions, setDatabaseOptions] = useState<
    { value: number; label: string }[]
  >([])
  const [schemaOptions, setSchemaOptions] = useState<
    { value: string; label: string }[]
  >([])
  const [modifiedByOptions, setModifiedByOptions] = useState<
    { value: number; label: string }[]
  >([])
  const [stateOptions, setStateOptions] = useState<
    { value: string; label: string }[]
  >([])
  const [userOptions, setUserOptions] = useState<
    { value: number; label: string }[]
  >([])
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalRecords, setTotalRecords] = useState(0)
  const [isExecuteLoading, setIsExecuteLoading] = useState(false)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [errorResult, setErrorResult] = useState<string | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const isCancelledRef = useRef<boolean>(false)
  const pageSize = 25

  const openShareModal = () => setIsShareModalOpen(true)
  const closeShareModal = () => setIsShareModalOpen(false)

  const renameTab = (tabId: string, newName: string) => {
    setTabs((prevTabs) =>
      prevTabs.map((tab) =>
        tab.id === tabId ? { ...tab, name: newName } : tab,
      ),
    )
  }

  const loadInitialTabs = async () => {
    // let apiTabs: QueryTab[] = []
    let activeApiTabId: string | null = null

    try {
      const response = await httpSuperset.get(
        endpoint.superset.sqllab.tabs_state,
      )
      const data = response.data.result

      if (data && data.tab_state_ids && data.tab_state_ids.length > 0) {
        // const tabStates = data.tab_state_ids
        // const activeTabData = data.active_tab
        // activeApiTabId = activeTabData?.id?.toString() || null
        // apiTabs = tabStates.map((tabState: { id: number; label: string }) => {
        //   if (activeTabData && tabState.id === activeTabData.id) {
        //     return {
        //       id: activeTabData.id.toString(),
        //       name: activeTabData.label,
        //       sql: activeTabData.sql || "",
        //       results: [],
        //       tags: "",
        //       createdBy: "Unknown User",
        //       createdAt: new Date().toISOString(),
        //       isFavorite: !!activeTabData.saved_query,
        //     }
        //   }
        //   return {
        //     id: tabState.id.toString(),
        //     name: tabState.label,
        //     sql: "",
        //     results: [],
        //     tags: "",
        //     createdBy: "Unknown User",
        //     createdAt: new Date().toISOString(),
        //     isFavorite: false,
        //   }
        // })
      }
    } catch (error) {
      console.error("Failed to load SQL Lab tabs state:", error)
    }
    const localTabs = getTabsFromLocalStorage()
    const allTabs: QueryTab[] = []
    localTabs.forEach((localTab) => {
      if (!allTabs.some((apiTab) => apiTab.id === localTab.id)) {
        allTabs.push(localTab)
      }
    })

    if (allTabs.length === 0) {
      addTab()
    } else {
      setTabs(allTabs)
      setActiveTabId(activeApiTabId || allTabs[0].id)
    }
  }

  const addTab = (query?: Partial<SavedQuery & { catalog: string | null }>) => {
    const newTab: QueryTab = {
      id: query?.id?.toString() || uuidv4(),
      name: query?.label || query?.tab_name || `Untitled ${tabs.length + 1}`,
      sql: query?.sql || "Select ...",
      results: [],
      catalog: query?.catalog || query?.database?.database_name || "", // Add this logic
      schema: query?.schema || "", // Add this
      tags: "",
      createdBy: query?.created_by?.first_name || "current_user@quantdata.com",
      createdAt: query?.created_on || new Date().toISOString(),
      isFavorite: false,
    }

    setTabs((prev) => {
      const tabExists = prev.some((t) => t.id === newTab.id)
      const newTabs = tabExists ? prev : [...prev, newTab]

      const localTabsToSave = newTabs.filter((t) => !t.id.match(/^\d+$/))
      saveTabsToLocalStorage(localTabsToSave)

      return newTabs
    })

    setActiveTabId(newTab.id)
  }

  // const fetchTabDetails = async (tabId: string) => {
  //   try {
  //     const response = await httpSuperset.get(
  //       endpoint.superset.sqllab.tab_state(tabId),
  //     )
  //     const tabData = response.data.result

  //     const fullTabInfo: Partial<QueryTab> = {
  //       sql: tabData.sql,
  //       name: tabData.tab_name,
  //     }

  //     setTabs((prevTabs) =>
  //       prevTabs.map((tab) =>
  //         tab.id === tabId ? { ...tab, ...fullTabInfo } : tab,
  //       ),
  //     )
  //   } catch (error) {
  //     console.error(`Failed to fetch details for tab ${tabId}:`, error)
  //   }
  // }
  const fetchTabDetails = (tabId: string) => {
    setTabs((prevTabs) =>
      prevTabs.map((tab) =>
        tab.id === tabId && tab.sql === ""
          ? { ...tab, sql: "SELECT * from DEFAULT;" }
          : tab,
      ),
    )
  }

  const closeTab = (id: string) => {
    setTabs((prev) => {
      const tabIndex = prev.findIndex((tab) => tab.id === id)
      const newTabs = prev.filter((tab) => tab.id !== id)

      const localTabsToSave = newTabs.filter((t) => !t.id.match(/^\d+$/))
      saveTabsToLocalStorage(localTabsToSave)

      if (activeTabId === id) {
        const newActiveId =
          newTabs.length > 0 ? newTabs[Math.max(0, tabIndex - 1)].id : null
        setActiveTabId(newActiveId)
      }
      return newTabs
    })
  }

  const updateTabSql = (tabId: string, sql: string) => {
    setTabs((prev) =>
      prev.map((tab) => (tab.id === tabId ? { ...tab, sql: sql } : tab)),
    )
  }

  const runQuery = (tabId: string) => {
    const tabToRun = tabs.find((tab) => tab.id === tabId)

    if (tabToRun && tabToRun.sql.trim() !== "") {
      const hasError = tabToRun.sql.toLowerCase().includes("error")
      const newHistoryItem: QueryHistoryItem = {
        id: uuidv4(),
        sql: tabToRun.sql,
        start_time: new Date().getTime(),
        status: hasError ? "failed" : "success",
        end_time: new Date().getTime() + 1000,
        tab_name: tabToRun.name,
        database: {
          id: 0,
          database_name: "default",
        },
        schema: "default",
        sql_tables: [],
        user: { first_name: "Current", last_name: "User" },
        rows: null,
      }
      setQueryHistory((prev) => [newHistoryItem, ...prev])
    }

    // Use the demo results with the new structure
    setTabs((prevTabs) =>
      prevTabs.map((tab) =>
        tab.id === tabId ? { ...tab, results: demoResults } : tab,
      ),
    )
  }

  const executeQuery = async (tabId: string, dbId: string, schema: string) => {
    isCancelledRef.current = false
    setIsExecuteLoading(true)

    if (timerRef.current) clearInterval(timerRef.current)
    setElapsedTime(0)
    const startTime = Date.now()
    timerRef.current = setInterval(() => {
      setElapsedTime(Date.now() - startTime)
    }, 50)
    try {
      setErrorResult(null)
      const tabToExecute = tabs.find((tab) => tab.id === tabId)

      if (!tabToExecute) {
        console.error("No active tab to execute.")
        return
      }

      const payload = {
        database_id: +dbId,
        json: true,
        runAsync: false,
        catalog: null,
        schema: schema,
        sql: tabToExecute.sql,
        sql_editor_id: tabId,
        tab: tabToExecute.name,
        tmp_table_name: "",
        select_as_cta: false,
        ctas_method: "TABLE",
        templateParams: null,
        queryLimit: 1000,
        expand_data: true,
      }

      const response = await httpNodeSuperset.post(
        endpoint.superset.node.sqllab.execute,
        payload,
      )

      if (isCancelledRef.current) console.log("ok1")

      const queryData = response.data?.data || []
      setTabs((prevTabs) =>
        prevTabs.map((tab) =>
          tab.id === tabId
            ? {
                ...tab,
                results: queryData,
                estimate: {
                  startDttm: response.data.query.startDttm,
                  endDttm: response.data.query.endDttm,
                },
              }
            : tab,
        ),
      )

      if (isCancelledRef.current) return

      await estimateQuery(tabId, dbId, schema)

      if (!isCancelledRef.current) {
        toast.success("Query executed successfully!")
      }
    } catch (error: any) {
      if (!isCancelledRef.current) {
        const errorMessage =
          error?.response?.data?.error ||
          error?.message ||
          "Failed to execute query."
        toast.error(errorMessage)

        setErrorResult(errorMessage)
      }
    } finally {
      setIsExecuteLoading(false)
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }

  const executeQuerySelection = async (
    tabId: string,
    dbId: string,
    schema: string,
    selectedSql: string,
  ) => {
    isCancelledRef.current = false
    setIsExecuteLoading(true)
    if (timerRef.current) clearInterval(timerRef.current)
    setElapsedTime(0)
    const startTime = Date.now()
    timerRef.current = setInterval(() => {
      setElapsedTime(Date.now() - startTime)
    }, 50)
    try {
      setErrorResult(null)
      const tabToExecute = tabs.find((tab) => tab.id === tabId)

      if (!tabToExecute) {
        console.error("No active tab to execute.")
        return
      }

      if (!selectedSql.trim()) {
        toast.error("No SQL selected to execute.")
        return
      }

      const payload = {
        database_id: +dbId,
        json: true,
        runAsync: false,
        catalog: null,
        schema: schema,
        sql: selectedSql,
        sql_editor_id: tabId,
        tab: `${tabToExecute.name} (Selection)`,
        tmp_table_name: "",
        select_as_cta: false,
        ctas_method: "TABLE",
        templateParams: null,
        queryLimit: 1000,
        expand_data: true,
      }

      const response = await httpNodeSuperset.post(
        endpoint.superset.node.sqllab.execute,
        payload,
      )

      if (isCancelledRef.current) return

      const queryData = response.data?.data || []
      setTabs((prevTabs) =>
        prevTabs.map((tab) =>
          tab.id === tabId
            ? {
                ...tab,
                results: queryData,
                estimate: {
                  startDttm: response.data.query.startDttm,
                  endDttm: response.data.query.endDttm,
                },
              }
            : tab,
        ),
      )

      if (isCancelledRef.current) return

      await estimateQuery(tabId, dbId, schema)

      if (!isCancelledRef.current) {
        toast.success("Selected query executed successfully!")
      }
    } catch (error: any) {
      if (!isCancelledRef.current) {
        const errorMessage =
          error?.response?.data?.error ||
          error?.message ||
          "Failed to execute selected query."
        toast.error(errorMessage)

        setErrorResult(errorMessage)
      }
    } finally {
      setIsExecuteLoading(false)
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }

  const estimateQuery = async (tabId: string, dbId: string, schema: string) => {
    try {
      const tabToEstimate = tabs.find((tab) => tab.id === tabId)

      if (!tabToEstimate) {
        console.error("No active tab to estimate.")
        return
      }

      const payload = {
        database_id: +dbId,
        catalog: null,
        schema: schema,
        sql: tabToEstimate.sql,
        template_params: {},
      }

      const response = await httpNodeSuperset.post(
        endpoint.superset.node.sqllab.estimate,
        payload,
      )

      if (isCancelledRef.current) return

      const estimatedData = response.data.result[0] || []

      setTabs((prevTabs) =>
        prevTabs.map((tab) =>
          tab.id === tabId
            ? {
                ...tab,
                estimate: {
                  ...tab.estimate,
                  totalRows: estimatedData["Output count"] || "0",
                  cpuCost: estimatedData["CPU cost"] || "0",
                  outputSize: estimatedData["Output size"] || "0",
                },
              }
            : tab,
        ),
      )

      // toast.success("Query estimated successfully!")
    } catch (error) {
      if (!isCancelledRef.current) {
        console.error("Error estimating query:", error)
        toast.error("Failed to estimate query.")
      }
    }
  }

  const saveQuery = async (tabId: string, dbId: number, schema: string) => {
    const tabToSave = tabs.find((tab) => tab.id === tabId)
    if (!tabToSave) {
      console.error("No active tab to save.")
      return
    }

    const payload = {
      db_id: dbId,
      label: tabToSave.name,
      schema: schema,
      sql: tabToSave.sql,
      description: "",
      catalog: null,
    }

    try {
      await httpNodeSuperset.post(
        endpoint.superset.node.saved_query.main,
        payload,
      )
      toast.success("Query saved successfully!")
    } catch (error) {
      console.error("Failed to save query:", error)
      toast.error("Error: Could not save the query.")
    }
  }

  const formatSql = async (tabId: string) => {
    try {
      const getSqlTab = tabs.find((tab) => tab.id === tabId)
      if (!getSqlTab) {
        console.error("No active tab to format SQL.")
        return
      }

      const payload = {
        sql: getSqlTab.sql,
      }

      const result = await httpNodeSuperset.post(
        endpoint.superset.node.sqllab.format_query,
        payload,
      )

      if (result.data.result) {
        updateTabSql(tabId, result.data.result)
      }
    } catch (error) {
      console.error("Failed to format SQL:", error)
      toast.error("Error: Could not format the SQL query.")
    }
  }

  const cancelExecution = () => {
    isCancelledRef.current = true
    setIsExecuteLoading(false)
    if (timerRef.current) clearInterval(timerRef.current)

    if (activeTabId) {
      setTabs((prevTabs) =>
        prevTabs.map((tab) =>
          tab.id === activeTabId
            ? { ...tab, results: [], estimate: undefined }
            : tab,
        ),
      )
    }

    toast.warn("Query execution cancelled by user.")
  }

  const activeTab = useMemo(
    () => tabs.find((tab) => tab.id === activeTabId),
    [tabs, activeTabId],
  )

  useEffect(() => {
    loadInitialTabs()
  }, [])

  useEffect(() => {
    const currentTab = tabs.find((t) => t.id === activeTabId)

    if (currentTab && currentTab.sql === "" && currentTab.id) {
      fetchTabDetails(currentTab.id)
    }
  }, [activeTabId])

  const fetchQueryHistory = async (page = 0) => {
    try {
      const params = {
        q: `(order_column:start_time,order_direction:desc,page:${page},page_size:${pageSize})`,
      }
      const response = await httpSuperset.get(endpoint.superset.query.main, {
        params,
      })

      setQueryHistory(response.data.result || [])
      setTotalRecords(response.data.count)
      setTotalPages(Math.ceil(response.data.count / pageSize))
      setCurrentPage(page)
    } catch (error) {
      console.error("Error fetching query history:", error)
    }
  }

  const fetchCsrfToken = async () => {
    try {
      const response = await httpSuperset.get(
        endpoint.superset.security.csrf_token,
      )
      const token = response.data.result

      if (token) {
        httpSuperset.defaults.headers.common["X-CSRFToken"] = token
      }
    } catch (error) {
      console.error("Failed to fetch CSRF token:", error)
    }
  }

  useEffect(() => {
    const initializeApp = async () => {
      await fetchCsrfToken()
      await fetchQueryHistory()
    }

    initializeApp()
  }, [])

  return (
    <QueryContext.Provider
      value={{
        tabs,
        activeTabId,
        activeTab,
        queriesPageTab,
        setQueriesPageTab,
        queryHistory,
        setQueryHistory,
        savedQueries,
        setSavedQueries,
        databaseOptions,
        setDatabaseOptions,
        schemaOptions,
        setSchemaOptions,
        modifiedByOptions,
        setModifiedByOptions,
        stateOptions,
        setStateOptions,
        userOptions,
        setUserOptions,
        currentPage,
        setCurrentPage,
        totalPages,
        setTotalPages,
        totalRecords,
        setTotalRecords,
        pageSize,
        addTab,
        closeTab,
        setActiveTabId,
        updateTabSql,
        runQuery,
        isShareModalOpen,
        openShareModal,
        closeShareModal,
        fetchQueryHistory,
        renameTab,
        saveQuery,
        formatSql,
        executeQuery,
        executeQuerySelection,
        isExecuteLoading,
        elapsedTime,
        cancelExecution,
        errorResult,
      }}
    >
      {children}
    </QueryContext.Provider>
  )
}

export const useQuery = () => {
  const context = useContext(QueryContext)
  if (context === undefined) {
    throw new Error("useQuery must be used within a QueryProvider")
  }
  return context
}
