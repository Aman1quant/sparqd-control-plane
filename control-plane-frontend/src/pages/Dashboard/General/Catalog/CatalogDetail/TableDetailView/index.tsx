import { useMemo, useState, useEffect, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useCatalog, type IColumn } from "@context/catalog/CatalogContext"
import {
  IconTable,
  IconStar,
  IconChevronRight,
  IconChevronDown,
} from "@tabler/icons-react"
import { Button, Search, Table, Tabs } from "@components/commons"
import DescriptionBox from "../DescriptionBox"
import styles from "../CatalogDetail.module.scss"
import { httpNodeSuperset } from "@http/axios"
import endpoint from "@http/endpoint"
import MetadataSidebar from "../MetadataSidebar"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { darkula } from "react-syntax-highlighter/dist/cjs/styles/hljs"
import clsx from "clsx"
import TableSkeleton from "@components/commons/Table/TableSkeleton";
import { useQuery } from "@context/query/QueryContext"

interface TableData {
  [key: string]: any
}

interface Column {
  column_name: string
}

const tabItems = [
  { label: "Overview" },
  { label: "Sample Data" },
  { label: "Details" },
  { label: "Permissions", disabled: true },
  { label: "History" },
  { label: "Lineage", disabled: true },
  { label: "Insights", disabled: true },
  { label: "Quality", disabled: true },
]

const TableDetailView = ({ tableName }: { tableName: string }) => {
  const { getColumnsForTable, openEditModal, sectionedTreeData } = useCatalog()
  const { catalogName, schemaName } = useParams()
  const { addTab } = useQuery();
  const navigate = useNavigate();

  const parsePythonDict = (str: string) => {
    try {
      let cleaned = str
        .replace(/'/g, '"')
        .replace(/None/g, "null")
        .replace(/True/g, "true")
        .replace(/False/g, "false")

      return JSON.parse(cleaned)
    } catch (e) {
      try {
        let manualCleaned = str.trim()

        manualCleaned = manualCleaned.replace(/\bNone\b/g, "null")
        manualCleaned = manualCleaned.replace(/\bTrue\b/g, "true")
        manualCleaned = manualCleaned.replace(/\bFalse\b/g, "false")

        manualCleaned = manualCleaned.replace(/'/g, '"')

        manualCleaned = manualCleaned.replace(/"\[/g, "[")
        manualCleaned = manualCleaned.replace(/\]"/g, "]")

        return JSON.parse(manualCleaned)
      } catch (e2) {
        try {
          const keyMatches = str.match(/['"']?(\w+)['"']?\s*:\s*/g)

          if (keyMatches && keyMatches.length > 0) {
            const keys = keyMatches
              .map((match) => {
                return match.replace(/['":\s]/g, "")
              })
              .filter((key) => key.length > 0)

            if (keys.length > 0) {
              const simplifiedObj: Record<string, any> = {}

              keys.forEach((key) => {
                const keyRegex = new RegExp(
                  `['"']?${key}['"']?\\s*:\\s*([^,}]+)`,
                )
                const valueMatch = str.match(keyRegex)

                if (valueMatch && valueMatch[1]) {
                  let valuePreview = valueMatch[1].trim()

                  if (valuePreview.length > 50) {
                    valuePreview = valuePreview.substring(0, 47) + "..."
                  }

                  valuePreview = valuePreview
                    .replace(/^['"']/, "")
                    .replace(/['"']$/, "")

                  simplifiedObj[key] = valuePreview
                } else {
                  simplifiedObj[key] = "..."
                }
              })

              return simplifiedObj
            }
          }

          if (str.includes("{") && str.includes("}")) {
            return {
              _structure: "Complex object detected",
              _preview: str.length > 100 ? str.substring(0, 97) + "..." : str,
            }
          }

          return null
        } catch (e3) {
          return null
        }
      }
    }
  }

  const [columns, setColumns] = useState<IColumn[]>([])
  const [isLoadingColumns, setIsLoadingColumns] = useState(true)
  const [filter, setFilter] = useState("")
  const [sampleDataSort, setSampleDataSort] = useState({
    key: "",
    direction: "asc",
  })
  const [historySort, setHistorySort] = useState({ key: "", direction: "asc" })

  const [columnSampleData, setColumnSampleData] = useState<Column[]>([])
  const [sampleData, setSampleData] = useState<TableData[]>([])
  const [columnSort, setColumnSort] = useState({
    key: "name",
    direction: "asc",
  })

  const [expandedCell, setExpandedCell] = useState<{
    rowIndex: number
    colKey: string
  } | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const handleSort =
    (
      setter: React.Dispatch<
        React.SetStateAction<{ key: string; direction: string }>
      >,
      currentConfig: { key: string; direction: string },
    ) =>
    (columnKey: string) => {
      const direction =
        currentConfig.key === columnKey && currentConfig.direction === "asc"
          ? "desc"
          : "asc"
      setter({ key: columnKey, direction })
    }

  const [columnHistory, setColumnHistory] = useState<TableData[]>([])
  const [historyData, setHistoryData] = useState<TableData[]>([])

  const { item, dbId } = useMemo(() => {
    if (!catalogName || !schemaName) {
      return { item: null, dbId: null }
    }
    const catalog = sectionedTreeData
      .flatMap((s) => s.items)
      .find((c) => c.name === catalogName)

    const schema = catalog?.children?.find((s) => s.name === schemaName)
    const tableItem = schema?.children?.find((t) => t.name === tableName)

    return { item: tableItem || null, dbId: catalog?.pk || null }
  }, [catalogName, schemaName, tableName, sectionedTreeData])

  useEffect(() => {
    if (dbId && schemaName && tableName) {
      setIsLoadingColumns(true)
      getColumnsForTable(dbId, schemaName, tableName)
        .then(async (data) => {
          await sampleDataTab(data.query || "")

          await historyDataTab(
            `SELECT * FROM ${schemaName}."${tableName}$history" ORDER BY version DESC` ||
              "",
          )
          setColumns(data.data)
        })
        .finally(() => {
          setIsLoadingColumns(false)
        })
    }
  }, [tableName])

  const filteredColumns = useMemo(() => {
    if (!filter) return columns
    return columns.filter((c) =>
      c.name.toLowerCase().includes(filter.toLowerCase()),
    )
  }, [filter, columns])

  const sortedColumns = useMemo(() => {
    return [...filteredColumns].sort((a, b) => {
      const aValue = a[columnSort.key as keyof IColumn] || ""
      const bValue = b[columnSort.key as keyof IColumn] || ""
      if (aValue < bValue) return columnSort.direction === "asc" ? -1 : 1
      if (aValue > bValue) return columnSort.direction === "asc" ? 1 : -1
      return 0
    })
  }, [filteredColumns, columnSort])

  const sortedSampleData = useMemo(() => {
    if (!sampleDataSort.key) return sampleData
    return [...sampleData].sort((a, b) => {
      const aValue = a[sampleDataSort.key] || ""
      const bValue = b[sampleDataSort.key] || ""
      if (aValue < bValue) return sampleDataSort.direction === "asc" ? -1 : 1
      if (aValue > bValue) return sampleDataSort.direction === "asc" ? 1 : -1
      return 0
    })
  }, [sampleData, sampleDataSort])

  const formatTimestamp = (isoString: string) => {
    if (!isoString) return "-"
    return new Date(isoString).toLocaleString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
  }

  const sortedHistoryData = useMemo(() => {
    if (!historySort.key) return historyData
    return [...historyData].sort((a, b) => {
      const aValue = a[historySort.key] || ""
      const bValue = b[historySort.key] || ""
      if (aValue < bValue) return historySort.direction === "asc" ? -1 : 1
      if (aValue > bValue) return historySort.direction === "asc" ? 1 : -1
      return 0
    })
  }, [historyData, historySort])

  const sampleDataTab = async (query: string) => {
    try {
      const payload = {
        database_id: +dbId!,
        json: true,
        runAsync: false,
        catalog: null,
        schema: schemaName,
        sql: query,
        sql_editor_id: null,
        tab: "",
        tmp_table_name: "",
        select_as_cta: false,
        ctas_method: "TABLE",
        templateParams: null,
        queryLimit: 10,
        expand_data: true,
      }

      const response = await httpNodeSuperset.post(
        endpoint.superset.node.sqllab.execute,
        payload,
      )

      setColumnSampleData(response.data.columns || [])
      setSampleData(response.data.data || [])
    } catch (error) {
      console.error("Error fetching sample data:", error)
      return <div>Error loading sample data.</div>
    }
  }

  const tableColumns = [
    { label: "Column", key: "name", sortable: true },
    { label: "Type", key: "type", sortable: true },
    { label: "Comment", key: "comment", sortable: false },
  ]
  const historyDataTab = async (query: string) => {
    try {
      const payload = {
        database_id: +dbId!,
        json: true,
        runAsync: false,
        catalog: null,
        schema: schemaName,
        sql: query,
        sql_editor_id: null,
        tab: "",
        tmp_table_name: "",
        select_as_cta: false,
        ctas_method: "TABLE",
        templateParams: null,
        queryLimit: 10,
        expand_data: true,
      }

      const response = await httpNodeSuperset.post(
        endpoint.superset.node.sqllab.execute,
        payload,
      )

      setColumnHistory(response.data.columns || [])
      setHistoryData(response.data.data || [])
    } catch (error) {
      console.error("Error fetching sample data:", error)
      return <div>Error loading sample data.</div>
    }
  }

  const handleQueryTable = () => {
    if (!catalogName || !schemaName || !tableName) return;

    const query = {
      label: `Query for ${tableName}`,
      sql: `SELECT * FROM ${tableName} LIMIT 1000;`,
      catalog: catalogName,
      schema: schemaName,
    };
    
    addTab(query as any);
    navigate("/admin/sql");
  };

  return (
    <div className="h-full">
      <div className={styles.header}>
        <IconTable size={32} /> <h1 className={styles.title}>{tableName}</h1>
        <IconStar
          size={20}
          onClick={() => console.log("set favorite")}
          className="cursor-pointer"
        />
        <div className="ml-auto">
          <Button label="Query" onClick={handleQueryTable} />
        </div>
      </div>
      <Tabs
        className="w-full h-full overflow-x-auto"
        items={tabItems}
        renderContent={(activeTab) => {
          if (activeTab === "Overview") {
            return (
              <div className="flex h-full">
                <div className={`flex-1 min-h-0 overflow-y-auto ${styles.content}`}>
                  {item && (
                    <DescriptionBox
                      description={item.description}
                      onEdit={() => openEditModal(item)}
                    />
                  )}
                  <Search
                    placeholder="Filter columns"
                    className="max-w-xs"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                  />
                  <div className="mt-4">
                    <Table.Table>
                      <Table.TableHeader
                        columns={tableColumns}
                        sortColumn={columnSort.key}
                        sortDirection={columnSort.direction as "asc" | "desc"}
                        onSort={handleSort(setColumnSort, columnSort)}
                      />
                      <Table.TableBody>
                        {isLoadingColumns ? (
                          <TableSkeleton columns={7} rows={10} />
                        ) : sortedColumns.length > 0 ? (
                          sortedColumns.map((c: IColumn) => (
                            <Table.TableRow key={c.name}>
                              <Table.TableCell>{c.name}</Table.TableCell>
                              <Table.TableCell>{c.type}</Table.TableCell>
                              <Table.TableCell>{c.comment}</Table.TableCell>
                            </Table.TableRow>
                          ))
                        ) : (
                          <Table.TableRow>
                            <Table.TableCell colSpan={columns.length} className="text-center">
                              No column found.
                            </Table.TableCell>
                          </Table.TableRow>
                        )}
                      </Table.TableBody>
                    </Table.Table>
                  </div>
                  <div className="xl:hidden mt-5 p-2 xl:p-0 xl:mt-0">
                    {item && <MetadataSidebar item={item} />}
                  </div>
                </div>
                <div className="hidden xl:block">
                  {item && <MetadataSidebar item={item} />}
                </div>
              </div>
            )
          } else if (activeTab === "Sample Data") {
            return (
              <div className={styles.content}>
                <Table.Table>
                  <Table.TableHeader
                    columns={columnSampleData.map((col) => ({
                      label: col.column_name,
                      key: col.column_name,
                      sortable: true,
                    }))}
                    sortColumn={sampleDataSort.key}
                    sortDirection={sampleDataSort.direction as "asc" | "desc"}
                    onSort={handleSort(setSampleDataSort, sampleDataSort)}
                  />
                  <Table.TableBody>
                    {isLoadingColumns ? (
                      <TableSkeleton columns={columnSampleData.length || 5} rows={10} />
                    ) : sortedSampleData.length > 0 ? (
                      sortedSampleData.map((row, index) => (
                        <Table.TableRow key={index}>
                          {columnSampleData.map((col) => (
                            <Table.TableCell key={col.column_name}>
                              {row[col.column_name]}
                            </Table.TableCell>
                          ))}
                        </Table.TableRow>
                      ))
                    ) : (
                      <Table.TableRow>
                        <Table.TableCell
                          colSpan={columnSampleData.length || 1}
                          className="text-center"
                        >
                          No sample data available.
                        </Table.TableCell>
                      </Table.TableRow>
                    )}
                  </Table.TableBody>
                </Table.Table>
              </div>
            )
          } else if (activeTab === "History") {
            return (
              <div className={styles.content}>
                <div className="overflow-x-auto">
                <Table.Table>
                  <Table.TableHeader
                    columns={columnHistory.map((col) => ({
                      label: col.column_name,
                      key: col.column_name,
                      sortable: true, 
                    }))}
                    sortColumn={historySort.key}
                    sortDirection={historySort.direction as "asc" | "desc"}
                    onSort={handleSort(setHistorySort, historySort)}
                  />
                  <Table.TableBody>
                    {isLoadingColumns ? (
                      <TableSkeleton columns={columnHistory.length || 5} rows={10} />
                    ) : sortedHistoryData.length > 0 ? (
                      sortedHistoryData.map((row, index) => (
                        <Table.TableRow key={index}>
                          {columnHistory.map((col) => (
                            <Table.TableCell
                              key={col.column_name}
                              className="relative py-2 align-top border-b"
                            >
                              {(() => {
                                const value = row[col.column_name]

                                if (col.column_name === "timestamp") {
                                  return formatTimestamp(value)
                                }

                                const isJsonLike =
                                  typeof value === "string" &&
                                  value.trim().length > 0 &&
                                  (value.trim().startsWith("{") ||
                                    value.trim().startsWith("'{") ||
                                    value.trim().startsWith("[") ||
                                    value.trim().startsWith("'[") ||
                                    /^\s*\w+\s*:\s*.+/.test(value) ||
                                    (value.includes('"') && value.includes(":")))

                                if (isJsonLike) {
                                  const params = parsePythonDict(String(value))

                                  if (params !== null) {
                                    const paramCount = Object.keys(params).length

                                    return (
                                      <div>
                                        <span
                                          className="cursor-pointer"
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            const cellIdentifier = {
                                              rowIndex: index,
                                              colKey: col.column_name,
                                            }
                                            if (
                                              expandedCell?.rowIndex === index &&
                                              expandedCell?.colKey === col.column_name
                                            ) {
                                              setExpandedCell(null)
                                            } else {
                                              setExpandedCell(cellIdentifier)
                                            }
                                          }}
                                        >
                                          <div className="flex items-center gap-1">
                                            {expandedCell?.rowIndex === index &&
                                            expandedCell?.colKey === col.column_name ? (
                                              <>
                                                <IconChevronDown
                                                  className="text-gray-500"
                                                  size={16}
                                                />
                                                <span className="text-gray-400">{`{`}</span>
                                              </>
                                            ) : (
                                              <>
                                                <IconChevronRight
                                                  className="text-gray-500"
                                                  size={16}
                                                />
                                                <span className="text-gray-800">{`{ ... }`}</span>
                                                <span className="text-gray-500">{`// ${paramCount} items`}</span>
                                              </>
                                            )}
                                          </div>
                                        </span>
                                        {expandedCell?.rowIndex === index &&
                                          expandedCell?.colKey === col.column_name && (
                                            <div
                                              ref={dropdownRef}
                                              className={clsx(
                                                "mt-2 rounded-md bg-white ring-1 ring-black ring-opacity-5 p-1 text-left",
                                                expandedCell?.rowIndex === index &&
                                                  expandedCell?.colKey === col.column_name
                                                  ? "opacity-100 visible"
                                                  : "opacity-0 invisible",
                                              )}
                                            >
                                              <SyntaxHighlighter
                                                language="json"
                                                style={darkula}
                                                customStyle={{
                                                  margin: 0,
                                                  padding: "1rem",
                                                  fontSize: "0.85rem",
                                                  background: "#fff",
                                                }}
                                                wrapLines={true}
                                                wrapLongLines={true}
                                              >
                                                {(() => {
                                                  let jsonString = JSON.stringify(
                                                    params,
                                                    null,
                                                    2,
                                                  )
                                                  const firstNewlineIndex =
                                                    jsonString.indexOf("\n")

                                                  if (firstNewlineIndex !== -1) {
                                                    return jsonString.substring(
                                                      firstNewlineIndex + 1,
                                                    )
                                                  }

                                                  return jsonString
                                                })()}
                                              </SyntaxHighlighter>
                                            </div>
                                          )}
                                      </div>
                                    )
                                  } else {
                                    console.error("Failed to parse as JSON:", value)
                                    return (
                                      <div className="max-w-xs">
                                        <div className="text-xs text-gray-500 mb-1">
                                          Complex data (failed to parse as JSON)
                                        </div>
                                        <div
                                          className="text-sm bg-gray-50 p-2 rounded border overflow-auto max-h-32"
                                          title={String(value ?? "")}
                                        >
                                          <pre className="whitespace-pre-wrap text-xs">
                                            {String(value)}
                                          </pre>
                                        </div>
                                      </div>
                                    )
                                  }
                                }

                                if (typeof value === "boolean") {
                                  return value.toString()
                                }

                                if (typeof value === "string" && value.length > 50) {
                                  return (
                                    <div
                                      className="truncate max-w-xs"
                                      title={String(value ?? "")}
                                    >
                                      {value}
                                    </div>
                                  )
                                }

                                return value
                              })()}
                            </Table.TableCell>
                          ))}
                        </Table.TableRow>
                      ))
                    ) : (
                      <Table.TableRow>
                        <Table.TableCell
                          colSpan={columnHistory.length || 1}
                          className="text-center"
                        >
                          No sample data available.
                        </Table.TableCell>
                      </Table.TableRow>
                    )}
                  </Table.TableBody>
                </Table.Table>

                </div>
              </div>
            )
          }
          return <div className={styles.content}>Content for {activeTab}</div>
        }}
      />
    </div>
  )
}

export default TableDetailView
