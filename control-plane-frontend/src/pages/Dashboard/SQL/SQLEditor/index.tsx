import { useEffect, useMemo, useState, useRef } from "react"
import clsx from "clsx"
import { toast } from "react-toastify"
// import { TiBook, TiTime } from "react-icons/ti"
import { Pagination } from "@components/commons/Table"
import hugIcon from "@assets/hugeIcon.png"
import { useHeader } from "@context/layout/header/HeaderContext"
import { useCatalog } from "@context/catalog/CatalogContext"
import { useQuery } from "@context/query/QueryContext"
import styles from "./SQLEditor.module.scss"
import { Button, Select, Table, Tabs, Search } from "@components/commons"
import { BiFullscreen, BiSearch } from "react-icons/bi"
import Dropdown from "@components/commons/Dropdown"
// import { BsStar } from "react-icons/bs"
import { GoShareAndroid } from "react-icons/go"
import QueryEditor, {
  type QueryEditorRef,
} from "@components/shared/QueryEditor"
import SQLMenu from "./SQLMenu"
import SQLHistory from "./SQLHistory"
import {
  IconPlayerPlayFilled,
  IconChartBar,
  IconFilter,
  IconCode,
  IconPlus,
  IconX,
  IconLayoutSidebarRightCollapse,
  IconAlertCircle,
  IconDotsVertical,
  IconHistory,
  IconPencil,
  IconPlayerStopFilled,
} from "@tabler/icons-react"
import {
  downloadAsCSV,
  downloadAsExcel,
  downloadAsTSV,
} from "@utils/downloadUtils"
import ShareQueryModal from "./ShareQueryModal"
import SQLRenameTabModal from "./SQLRenameTabModal"
import { useGlobalShortcut } from "@hooks/useGlobalShorcut"

const SQLEditorComponent = () => {
  const { dispatch } = useHeader()
  const {
    tabs,
    activeTabId,
    addTab,
    closeTab,
    setActiveTabId,
    updateTabSql,
    openShareModal,
    saveQuery,
    formatSql,
    executeQuery,
    executeQuerySelection,
    isExecuteLoading,
    elapsedTime,
    cancelExecution,
    errorResult,
  } = useQuery()

  const { sectionedTreeData, fetchChildrenForItem } = useCatalog()

  const queryEditorRef = useRef<QueryEditorRef>(null)

  const [selectedCatalog, setSelectedCatalog] = useState("")
  const [selectedSchema, setSelectedSchema] = useState("")
  const [tableSearchTerm, setTableSearchTerm] = useState("")
  const [showTableSearch, setShowTableSearch] = useState(false)
  const [isResultsMaximized, setIsResultsMaximized] = useState(false)
  const [isResultsOpen, setIsResultsOpen] = useState(true)
  const [activeSideTab, setActiveSideTab] = useState<"history" | null>(null)
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(true)
  const [hasSelection, setHasSelection] = useState(false)

  const [sortColumn, setSortColumn] = useState<string>("")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [renameModalInfo, setRenameModalInfo] = useState<{
    id: string
    name: string
  } | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const PAGE_SIZE = 50

  const handleSort = (columnKey: string) => {
    const direction =
      sortColumn === columnKey && sortDirection === "asc" ? "desc" : "asc"
    setSortColumn(columnKey)
    setSortDirection(direction)
  }

  // const handleCloseSidePanel = () => {
  //   setIsSidePanelOpen(false)
  //   setActiveSideTab(null)
  // }
  // const [isHistoryPanelOpen, setIsHistoryPanelOpen] = useState(false)
  // const [isHistoryPanelOpen, setIsHistoryPanelOpen] = useState(false)

  const sidebarItems = [
    { id: "history", icon: <IconHistory size={20} className="text-primary" /> },
  ]

  // const options = [{ value: "cdp", label: "cdp" }]
  const tabTable = [{ label: "Raw Result", active: true }]

  // Generate dynamic columns based on the data
  const generateColumns = (data: any[]) => {
    if (!data || data.length === 0) {
      return [{ key: "index", label: "#", sortable: false }]
    }
    const allKeys = Object.keys(data[0])
    return [
      { key: "index", label: "#", sortable: false },
      ...allKeys.map((key) => ({ key: key, label: key, sortable: true })),
    ]
  }

  const columnTable = useMemo(() => {
    const activeTab = tabs.find((tab) => tab.id === activeTabId)
    return generateColumns(activeTab?.results || [])
  }, [tabs, activeTabId])

  useEffect(() => {
    dispatch({
      type: "SET_HEADER",
      payload: {
        title: "",
        description: "",
        search: true,
      },
    })
  }, [dispatch])

  // const getStatusColor = (status: string) => {
  //   switch (status.toLowerCase()) {
  //     case "success":
  //       return "bg-green-100 text-green-800"
  //     case "failed":
  //       return "bg-red-100 text-red-800"
  //     case "running":
  //     case "stopped":
  //       return "bg-blue-100 text-blue-800"
  //     default:
  //       return "bg-gray-100 text-gray-800"
  //   }
  // }

  const formatLiveDuration = (durationMs: number) => {
    const hours = Math.floor(durationMs / 3600000)
    const minutes = Math.floor((durationMs % 3600000) / 60000)
    const seconds = Math.floor((durationMs % 60000) / 1000)

    const milliseconds = Math.floor((durationMs % 1000) / 10)

    const pad = (num: number, size = 2) => num.toString().padStart(size, "0")

    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}.${pad(milliseconds)}`
  }

  const catalogOptions = useMemo(() => {
    return sectionedTreeData
      .flatMap((section) => section.items)
      .map((catalog) => ({
        label: catalog.name,
        value: catalog.name,
      }))
  }, [sectionedTreeData])

  const schemaOptions = useMemo(() => {
    const catalog = sectionedTreeData
      .flatMap((section) => section.items)
      .find((c) => c.name === selectedCatalog)
    return (
      catalog?.children?.map((schema) => ({
        label: schema.name,
        value: schema.name,
      })) || []
    )
  }, [selectedCatalog, sectionedTreeData])

  const handleSaveQuery = () => {
    if (!activeTabId) return
    const catalog = sectionedTreeData
      .flatMap((section) => section.items)
      .find((c) => c.name === selectedCatalog)
    const dbId = catalog?.pk
    if (!dbId) {
      toast.error("Please select a valid catalog first. 1")
      return
    }
    saveQuery(activeTabId, dbId, selectedSchema)
  }

  const handleExecuteQuery = () => {
    if (!activeTabId) return

    // Check if there's SQL content to execute
    const activeTab = tabs.find((tab) => tab.id === activeTabId)
    if (!activeTab || !activeTab.sql.trim()) {
      toast.error("Please enter a SQL query to execute")
      return
    }

    const catalog = sectionedTreeData
      .flatMap((section) => section.items)
      .find((c) => c.name === selectedCatalog)
    const dbId = catalog?.pk

    if (!dbId) {
      toast.error("Please select a valid catalog first")
      return
    }
    executeQuery(activeTabId, String(dbId), selectedSchema)
  }

  const handleExecuteSelection = () => {
    if (!activeTabId || !queryEditorRef.current) return

    // Check if there's SQL content first
    const activeTab = tabs.find((tab) => tab.id === activeTabId)
    if (!activeTab || !activeTab.sql.trim()) {
      toast.error("Please enter a SQL query to execute")
      return
    }

    const selectedText = queryEditorRef.current.getSelectedTextOrCurrentLine()
    if (!selectedText.trim()) {
      toast.error(
        "No SQL selected to execute. Please select text or position cursor on a line.",
      )
      return
    }

    const catalog = sectionedTreeData
      .flatMap((section) => section.items)
      .find((c) => c.name === selectedCatalog)
    const dbId = catalog?.pk
    if (!dbId) {
      toast.error("Please select a valid catalog first")
      return
    }
    executeQuerySelection(
      activeTabId,
      String(dbId),
      selectedSchema,
      selectedText,
    )
  }

  // const handleRunSelectionFromEditor = (selectedText: string) => {
  //   if (!activeTabId) return

  //   const catalog = sectionedTreeData
  //     .flatMap((section) => section.items)
  //     .find((c) => c.name === selectedCatalog)
  //   const dbId = catalog?.pk
  //   if (!dbId) {
  //     toast.error("Please select a valid catalog first. 4")
  //     return
  //   }
  //   executeQuerySelection(
  //     activeTabId,
  //     String(dbId),
  //     selectedSchema,
  //     selectedText,
  //   )
  // }

  useEffect(() => {
    if (sectionedTreeData.length > 0 && !selectedCatalog) {
      setSelectedCatalog(sectionedTreeData[0].items[0]?.name || "")
    }
  }, [sectionedTreeData, selectedCatalog])

  useEffect(() => {
    const loadSchemasForSelectedCatalog = async () => {
      if (selectedCatalog) {
        const catalog = sectionedTreeData
          .flatMap((section) => section.items)
          .find((c) => c.name === selectedCatalog)
        if (
          catalog &&
          !catalog.childrenLoaded &&
          catalog.children?.length === 0
        ) {
          await fetchChildrenForItem(catalog.id)
        }
      }
    }
    loadSchemasForSelectedCatalog()
  }, [selectedCatalog, sectionedTreeData, fetchChildrenForItem])

  useEffect(() => {
    if (schemaOptions.length > 0) {
      const currentSchemaExists = schemaOptions.some(
        (opt) => opt.value === selectedSchema,
      )
      if (!currentSchemaExists) {
        setSelectedSchema(schemaOptions[0].value)
      }
    } else {
      setSelectedSchema("")
    }
  }, [selectedCatalog, schemaOptions])

  const tabItemsForDisplay = useMemo(() => {
    return tabs.map((tab) => ({
      id: tab.id,
      label: tab.name,
      active: tab.id === activeTabId,
      onClose: () => closeTab(tab.id),
      iconLeft: <IconPencil size={16} />,
      onIconLeftClick: () => setRenameModalInfo({ id: tab.id, name: tab.name }),
    }))
  }, [tabs, activeTabId, closeTab])

  useGlobalShortcut([
    {
      mac: "Ctrl+Enter",
      windows: "Ctrl+Enter",
      handler: () => {
        handleExecuteQuery()
      },
      preventDefault: true,
    },
    {
      mac: "Ctrl+Shift+Enter",
      windows: "Ctrl+Shift+Enter",
      handler: () => {
        handleExecuteSelection()
      },
      preventDefault: true,
    },
  ])

  useEffect(() => {
    const activeTab = tabs.find((tab) => tab.id === activeTabId);
    if (activeTab) {
      if (activeTab.catalog && catalogOptions.some(opt => opt.value === activeTab.catalog)) {
        setSelectedCatalog(activeTab.catalog);
      }
      if (activeTab.schema) {
        setSelectedSchema(activeTab.schema);
      }
    }
  }, [activeTabId, tabs]);

  return (
    <div className={styles.container}>
      <div className="sqlMenu">
        <SQLMenu />
      </div>
      <div className="flex-1 h-[calc(100vh-120px)] min-w-0 flex flex-col relative">
        <Tabs
          items={tabItemsForDisplay}
          className={styles.sqlTabsContainer}
          headerClassName={styles.sqlTabsHeader}
          addButtonClassName={styles.sqlTabAddButton}
          showCount={true}
          onAddClick={addTab}
          onClick={(tab) => setActiveTabId(tab.id!)}
          renderContent={() => {
            const activeTab = tabs.find((tab) => tab.id === activeTabId)
            if (!activeTab) {
              return (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <p>No active query.</p>
                  </div>
                </div>
              )
            }

            const addVisualizationItems = [
              {
                label: (
                  <div className="flex items-center gap-2">
                    <IconChartBar size={16} /> <span>Visualization</span>
                  </div>
                ),
                onClick: () => {},
              },
              {
                label: (
                  <div className="flex items-center gap-2">
                    <IconFilter size={16} /> <span>Filter</span>
                  </div>
                ),
                onClick: () => {},
              },
              {
                label: (
                  <div className="flex items-center gap-2">
                    <IconCode size={16} /> <span>Parameter</span>
                  </div>
                ),
                onClick: () => {},
              },
            ]

            const sortedData = useMemo(() => {
              if (!sortColumn) return activeTab.results
              return [...activeTab.results].sort((a: any, b: any) => {
                const aValue = a[sortColumn] ?? ""
                const bValue = b[sortColumn] ?? ""
                if (aValue < bValue) return sortDirection === "asc" ? -1 : 1
                if (aValue > bValue) return sortDirection === "asc" ? 1 : -1
                return 0
              })
            }, [activeTab.results, sortColumn, sortDirection])

            const filteredAndSortedData = useMemo(() => {
              if (!tableSearchTerm) return sortedData
              return sortedData.filter((row: any) =>
                Object.values(row).some((val) =>
                  String(val)
                    .toLowerCase()
                    .includes(tableSearchTerm.toLowerCase()),
                ),
              )
            }, [sortedData, tableSearchTerm])

            const paginatedData = useMemo(() => {
              const startIndex = (currentPage - 1) * PAGE_SIZE
              const endIndex = startIndex + PAGE_SIZE
              return filteredAndSortedData.slice(startIndex, endIndex)
            }, [filteredAndSortedData, currentPage])

            const totalRecords = filteredAndSortedData.length
            const totalPages = Math.ceil(totalRecords / PAGE_SIZE)

            // Check if SQL editor has content
            const hasSQLContent = activeTab.sql.trim().length > 0

            return (
              <div className="flex flex-col h-full">
                <div
                  className={clsx(
                    !isResultsOpen && "flex-grow",
                    isResultsMaximized && "hidden",
                  )}
                >
                  <div className="w-full overflow-x-auto">
                    <div className="flex items-center justify-between px-[15px] flex-nowrap min-w-fit gap-2 py-4 pb-8">
                      <div className="flex items-center gap-6 flex-shrink-0">
                        <div className="flex items-center">
                          <Button
                            variant="solid"
                            color="primary"
                            size="md"
                            label={
                              isExecuteLoading
                                ? "Stop"
                                : hasSelection
                                  ? "Run Selection"
                                  : "Run All"
                            }
                            iconLeft={
                              isExecuteLoading ? (
                                <IconPlayerStopFilled size={16} />
                              ) : (
                                <IconPlayerPlayFilled size={16} />
                              )
                            }
                            onClick={
                              isExecuteLoading
                                ? cancelExecution
                                : hasSelection
                                  ? handleExecuteSelection
                                  : handleExecuteQuery
                            }
                            className="rounded-r-none border-r-0"
                            disabled={!hasSQLContent}
                          />
                          {/* <Dropdown
                            items={[
                              {
                                label: "Run All (Ctrl+Enter)",
                                onClick: handleExecuteQuery,
                              },
                              {
                                label: "Run Selection (Ctrl+Shift+Enter)",
                                onClick: handleExecuteSelection,
                              },
                            ]}
                            theme="primary"
                            size="md"
                            showArrow={true}
                            label=""
                            className="!min-w-0 !w-8 rounded-l-none border-l border-primary-600"
                          /> */}
                        </div>
                        <div className="flex items-center gap-3">
                          <Select
                            options={catalogOptions}
                            value={selectedCatalog}
                            onChange={(val) => setSelectedCatalog(String(val))}
                            className="!w-[180px]"
                          />
                          <Select
                            options={schemaOptions}
                            value={selectedSchema}
                            onChange={(val) => setSelectedSchema(String(val))}
                            className="!w-[180px]"
                            placeholder="No schema"
                            disabled={schemaOptions.length === 0}
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Dropdown
                          items={[
                            { label: "Clone", onClick: () => {} },
                            {
                              label: "Format SQL",
                              onClick: () => formatSql(activeTab.id),
                            },
                          ]}
                          theme="default"
                          size="md"
                          showArrow={false}
                          label={<IconDotsVertical size={20} />}
                        />
                        {/* <div className="w-7 h-7 flex items-center justify-center">
                          <BsStar className=" text-black" />
                        </div> */}
                        {/* <Select
                          options={options}
                          value={"cdp"}
                          onChange={() => {}}
                          placeholder="Created by"
                          className="!w-[180px]"
                        /> */}
                        <Button
                          variant="outline"
                          color="primary"
                          size="md"
                          label="Save"
                          onClick={handleSaveQuery}
                        />
                        <Button
                          variant="outline"
                          color="primary"
                          size="md"
                          label="Schedule"
                        />
                        <Button
                          variant="outline"
                          color="primary"
                          size="md"
                          showLabel={false}
                          iconLeft={<GoShareAndroid size={20} />}
                          onClick={openShareModal}
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <QueryEditor
                      ref={queryEditorRef}
                      theme="light"
                      height={isResultsOpen ? "180px" : "calc(100vh - 255px)"}
                      databaseStructure={sectionedTreeData}
                      value={activeTab.sql}
                      onChange={(value) =>
                        updateTabSql(activeTab.id, value || "")
                      }
                      onSelectionChange={setHasSelection}
                      onRun={
                        hasSelection
                          ? handleExecuteSelection
                          : handleExecuteQuery
                      }
                      // onRunSelection={handleRunSelectionFromEditor}
                    />
                    {errorResult && (
                      <div className="bg-red-50 border-t border-red-200 text-red-800 p-3 text-xs">
                        <div className="flex items-start gap-2">
                          <IconAlertCircle
                            size={16}
                            className="flex-shrink-0 mt-0.5"
                          />
                          <pre className="font-sans whitespace-pre-wrap">
                            {errorResult}
                          </pre>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                {isResultsOpen && (
                  <div
                    className={clsx(
                      "border-t-2 flex flex-col",
                      isResultsMaximized && "flex-grow min-h-0",
                    )}
                  >
                    <div className="flex justify-between items-center p-3 relative border-b flex-shrink-0">
                      <div className="flex items-center">
                        <Tabs
                          items={tabTable}
                          showCount={false}
                          showDropdown={true}
                          dropdownOptions={[
                            {
                              label: "Download as CSV",
                              onClick: () => downloadAsCSV(activeTab.results),
                              disabled: activeTab.results.length === 0,
                            },
                            {
                              label: "Download as TSV",
                              onClick: () => downloadAsTSV(activeTab.results),
                              disabled: activeTab.results.length === 0,
                            },
                            {
                              label: "Download as Excel",
                              onClick: () => downloadAsExcel(activeTab.results),
                              disabled: activeTab.results.length === 0,
                            },
                          ]}
                          renderContent={() => null}
                        />
                        <Dropdown
                          items={addVisualizationItems}
                          theme="link"
                          size="sm"
                          showArrow={false}
                          label={
                            <IconPlus
                              size={18}
                              className="ml-2 text-gray-500 hover:text-black"
                            />
                          }
                        />
                      </div>
                      <div className="flex items-center gap-4">
                        {showTableSearch && (
                          <Search
                            value={tableSearchTerm}
                            onChange={(e) => setTableSearchTerm(e.target.value)}
                            placeholder="Search results..."
                            className="transition-all duration-300"
                          />
                        )}
                        <button
                          onClick={() => setShowTableSearch((prev) => !prev)}
                          className="text-gray-500 hover:text-black"
                        >
                          <BiSearch />
                        </button>
                        <button
                          onClick={() => setIsResultsMaximized((prev) => !prev)}
                          className="text-gray-500 hover:text-black"
                        >
                          <BiFullscreen />
                        </button>
                        <button
                          onClick={() => {
                            setIsResultsOpen(false)
                            setIsResultsMaximized(false)
                          }}
                          className="text-gray-500 hover:text-black"
                        >
                          <IconX size={18} />
                        </button>
                      </div>
                    </div>
                    <div
                      className={clsx(
                        "w-full flex-grow",
                        isResultsMaximized
                          ? "h-[calc(100vh-250px)] overflow-auto"
                          : "h-[calc(100vh-500px)] overflow-auto",
                      )}
                    >
                      {isExecuteLoading ? (
                        <div className="w-full h-full flex items-center justify-center flex-col text-center text-gray-500">
                          <svg
                            className="animate-spin h-8 w-8 text-primary mb-4"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          <p className="text-heading-6 font-bold">
                            Executing Query...
                          </p>
                          <p className="text-body-medium">
                            Please wait a moment.
                          </p>
                        </div>
                      ) : activeTab.results.length > 0 ? (
                        <>
                          <Table.Table
                            className="!w-auto min-w-full"
                            theme="query"
                          >
                            <Table.TableHeader
                              columns={columnTable}
                              onSort={handleSort}
                              sortColumn={sortColumn}
                              sortDirection={sortDirection}
                            />
                            <Table.TableBody>
                              {paginatedData.map((item, index) => (
                                <Table.TableRow key={index}>
                                  <Table.TableCell>
                                    {(currentPage - 1) * PAGE_SIZE + index + 1}
                                  </Table.TableCell>
                                  {columnTable.slice(1).map((col) => (
                                    <Table.TableCell key={col.key}>
                                      {String(item[col.key] ?? "")}
                                    </Table.TableCell>
                                  ))}
                                </Table.TableRow>
                              ))}
                            </Table.TableBody>
                          </Table.Table>
                          <div className="mt-4 flex items-center justify-between w-full">
                            <Pagination
                              currentPage={currentPage}
                              pageSize={PAGE_SIZE}
                              totalPages={totalPages}
                              totalRecords={totalRecords}
                              onPageChange={setCurrentPage}
                            />
                          </div>
                        </>
                      ) : (
                        <div className="empty-state w-full h-full flex items-center justify-center flex-col max-w-[416px] text-center mx-auto">
                          <img
                            src={hugIcon}
                            alt="hug"
                            className="w-[100px] h-[100px] mb-7"
                          />
                          <div className="text flex flex-col items-center justify-center">
                            <div className="span text-heading-6 font-bold text-black/50">
                              Run a query to see results
                            </div>
                            <div className="description text-black/50 text-body-medium">
                              To get started, run a query or a query from your
                              history.
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {activeTab.estimate && (
                      <div className="flex flex-row gap-2 items-center px-2 text-primary-700 text-body-small">
                        <div>total Rows : {activeTab.estimate.totalRows}</div>
                        <div>CPU Cost : {activeTab.estimate.cpuCost}</div>
                        <div>Output Size : {activeTab.estimate.outputSize}</div>

                        {isExecuteLoading ? (
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-800 text-white">
                            {formatLiveDuration(elapsedTime)}
                          </span>
                        ) : (
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-800 text-white">
                            {formatLiveDuration(elapsedTime)}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          }}
        />
        {!isResultsOpen && (
          <button
            className="absolute bottom-4 right-4 p-2 bg-primary text-white rounded-full shadow-lg hover:bg-primary-dark"
            onClick={() => setIsResultsOpen(true)}
            title="Show results panel"
          >
            <IconLayoutSidebarRightCollapse size={20} />
          </button>
        )}
        {/* <button
          className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full shadow hover:bg-gray-200 z-10"
          onClick={() => setIsHistoryPanelOpen((prev) => !prev)}
          title={isHistoryPanelOpen ? "Hide History" : "Show History"}
        >
          <TiTime />
        </button> */}
      </div>
      {isSidePanelOpen && (
        <div className="sqlMenu border-l">
          {activeSideTab === "history" && (
            <SQLHistory onClose={() => setIsSidePanelOpen(false)} />
          )}
        </div>
      )}
      <div className={`${styles.sidebar}`}>
        {sidebarItems.map((item) => (
          <div
            key={item.id}
            className={clsx(
              styles.item,
              activeSideTab === item.id && isSidePanelOpen && styles.active,
            )}
            onClick={() => {
              const newTab =
                activeSideTab === "history" && isSidePanelOpen
                  ? null
                  : "history"
              setActiveSideTab(newTab)
              setIsSidePanelOpen(!!newTab)
            }}
          >
            {item.icon}
          </div>
        ))}
      </div>
      {renameModalInfo && (
        <SQLRenameTabModal
          tabId={renameModalInfo.id}
          currentName={renameModalInfo.name}
          onClose={() => setRenameModalInfo(null)}
        />
      )}
    </div>
  )
}

const SQLEditor = () => {
  const { isShareModalOpen } = useQuery()
  return (
    <>
      <SQLEditorComponent />
      {isShareModalOpen && <ShareQueryModal />}
    </>
  )
}

export default SQLEditor
