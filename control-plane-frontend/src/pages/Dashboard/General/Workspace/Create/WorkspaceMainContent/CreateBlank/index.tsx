import { useEffect, useState, useMemo } from "react"
import clsx from "clsx"
import Editor from "@monaco-editor/react"
import {
  IconArrowNarrowDown,
  IconArrowNarrowUp,
  IconCaretDownFilled,
  IconCaretRightFilled,
  IconCode,
  IconCopyPlus,
  IconDatabase,
  IconMarkdown,
  IconPlayerPlayFilled,
  IconPlayerStopFilled,
  IconRowInsertBottom,
  IconRowInsertTop,
  IconSearch,
  IconTable,
  IconTrashFilled,
} from "@tabler/icons-react"
import { Button, Table, Tabs } from "@components/commons"
import { Pagination } from "@components/commons/Table"
import Dropdown from "@components/commons/Dropdown"
import { useGlobalShortcut } from "@hooks/useGlobalShorcut"
import {
  downloadAsExcel,
  downloadAsCSV,
  downloadAsTSV,
  copyDataToClipboard,
} from "@utils/downloadUtils"
import {
  useCreateWorkspace,
  type Cell,
  type TabType,
} from "@context/workspace/CreateWorkspace"
import styles from "./CreateBlank.module.scss"
import { Search } from "@components/commons/Search"

const WorkspaceCreateBlank = ({ tab }: { tab: TabType }) => {
  const {
    handleRunCell,
    handleRunAllCells,
    handleChangeCellContent,
    handleInsertAbove,
    handleInsertBelow,
    handleDuplicateCell,
    handleDeleteCell,
    handleSelectAllCells,
    handleMoveCell,
    handleSelectCell,
    activeTabId,
    activeCellId,
    setActiveCellId,
    selectedCellId,
    handleShiftArrowSelection,
    handleCopyCells,
    handleCutCells,
    handlePasteCells,
    saveFile,
    runningCells,
    cancelCellExecution,
  } = useCreateWorkspace()

  const [cells, setCells] = useState<Cell[]>([])

  useEffect(() => {
    const loadedCells = (tab.content || []).map((c) => ({
      ...c,
      type: c.type || "code",
    }))
    setCells(loadedCells)
  }, [tab])

  useGlobalShortcut([
    {
      mac: "Meta+S",
      windows: "Ctrl+S",
      handler: () => {
        saveFile()
      },
      preventDefault: true,
    },
    {
      mac: "Meta+Enter",
      windows: "Control+Enter",
      handler: () => {
        handleRunAllCells(activeTabId)
      },
      preventDefault: true,
    },
    {
      mac: "Ctrl+Enter",
      windows: "Ctrl+Enter",
      handler: () => {
        handleRunAllCells(activeTabId)
      },
      preventDefault: true,
    },
    {
      mac: "Shift+Enter",
      windows: "Shift+Enter",
      handler: () => {
        if (activeCellId) {
          handleRunCell(tab.id, activeCellId)
        }
      },
      preventDefault: true,
    },
    {
      mac: "Shift+ArrowDown",
      windows: "Shift+ArrowDown",
      handler: () => handleShiftArrowSelection("down"),
      preventDefault: true,
    },
    {
      mac: "Shift+ArrowUp",
      windows: "Shift+ArrowUp",
      handler: () => handleShiftArrowSelection("up"),
      preventDefault: true,
    },
    {
      mac: "Backspace",
      windows: "Backspace",
      handler: () => {
        if (selectedCellId.length > 0) {
          selectedCellId.forEach((id) => handleDeleteCell(tab.id, id))
        }
      },
      preventDefault: true,
    },
    {
      mac: "Delete",
      windows: "Delete",
      handler: () => {
        if (selectedCellId.length > 0) {
          selectedCellId.forEach((id) => handleDeleteCell(tab.id, id))
        }
      },
      preventDefault: true,
    },
    {
      mac: "Meta+A",
      windows: "Control+A",
      handler: () => handleSelectAllCells(tab.id),
      preventDefault: true,
    },
    {
      mac: "Ctrl+Shift+ArrowUp",
      windows: "Ctrl+Shift+ArrowUp",
      handler: () => {
        handleMoveCell(activeTabId, activeCellId, "up")
      },
      preventDefault: true,
    },
    {
      mac: "Ctrl+Shift+ArrowDown",
      windows: "Ctrl+Shift+ArrowDown",
      handler: () => {
        handleMoveCell(activeTabId, activeCellId, "down")
      },
      preventDefault: true,
    },
    {
      mac: "Alt+ArrowDown",
      windows: "Alt+ArrowDown",
      handler: () => {
        handleInsertBelow(activeTabId, activeCellId)
      },
      preventDefault: true,
    },
    {
      mac: "Alt+ArrowUp",
      windows: "Alt+ArrowUp",
      handler: () => {
        handleInsertAbove(activeTabId, activeCellId)
      },
      preventDefault: true,
    },
    {
      mac: "Meta+C",
      windows: "Control+C",
      handler: () => {
        handleCopyCells()
      },
      preventDefault: true,
    },
    {
      mac: "Meta+X",
      windows: "Control+X",
      handler: () => {
        handleCutCells()
      },
      preventDefault: true,
    },
    {
      mac: "Meta+V",
      windows: "Control+V",
      handler: () => {
        handlePasteCells(tab.id)
      },
      preventDefault: true,
    },
  ])

  const renderOutput = (cell: Cell) => {
    if (!cell.output) return null

    if (Array.isArray(cell.output)) {
      return (
        <>
          {cell.output.map((output, idx) => {
            if (output.type === "stream") {
              return (
                <pre key={idx} className={styles.output}>
                  {output.text || ""}
                </pre>
              )
            } else if (output.type === "error") {
              return (
                <pre key={idx} className={styles.outputError}>
                  {output.evalue || ""}
                </pre>
              )
            } else if (output.type === "html") {
              return (
                <div
                  key={idx}
                  className={styles.outputHtml}
                  dangerouslySetInnerHTML={{ __html: output.value || "" }}
                />
              )
            } else if (output.type === "table") {
              return (
                <DynamicTableWithPagination cell={{ data: output.data.rows }} />
              )
            } else if (output.type === "text") {
              return (
                <pre key={idx} className={styles.output}>
                  {output.value || ""}
                </pre>
              )
            } else if (output.type === "json") {
              return (
                <div key={idx}>
                  <DynamicJsonViewer
                    data={output.data || output.value || output}
                  />
                </div>
              )
            }
          })}
        </>
      )
    }

    // Handle other output types if needed
    // Handle case where output is a string that might be JSON
    if (typeof cell.output === "string") {
      try {
        const parsedOutput = JSON.parse(cell.output)
        if (typeof parsedOutput === "object" && parsedOutput !== null) {
          return <DynamicJsonViewer data={parsedOutput} />
        }
      } catch {
        // Not JSON, treat as regular text
      }
    }

    // Handle case where cell.output is directly an object/array
    if (typeof cell.output === "object" && cell.output !== null) {
      return <DynamicJsonViewer data={cell.output} />
    }

    return <pre className={styles.output}>{cell.output}</pre>
  }

  return (
    <div className={styles.wrapper}>
      {cells.map((cell, index) => (
        <div
          key={cell.id}
          className="flex w-full items-center align-middle gap-x-2"
        >
          <div className="text-body-medium text-black-500 flex items-center justify-center w-8 h-8">
            [ {cell.runningNumber} ]
          </div>
          <div
            className={clsx(styles.cell, {
              [styles.active]: activeCellId === cell.id,
              [styles.selected]: selectedCellId.includes(cell.id),
            })}
            onClick={(e) => handleSelectCell(e, cell.id)}
          >
            <div className={styles.editorWrapper}>
              <div className={styles.actions}>
                <div className={styles.actionsLeft}>
                  <Button
                    variant="link"
                    size="sm"
                    className="!px-1"
                    showLabel={false}
                    color={runningCells.has(cell.id) ? "default" : "primary"}
                    iconLeft={
                      runningCells.has(cell.id) ? (
                        <div className="flex items-center gap-x-1">
                          <IconPlayerStopFilled size={18} />
                          <span>Interrupt</span>
                        </div>
                      ) : (
                        <IconPlayerPlayFilled size={18} />
                      )
                    }
                    title={
                      runningCells.has(cell.id)
                        ? "Cancel Execution"
                        : "Run Cell"
                    }
                    onClick={() =>
                      runningCells.has(cell.id)
                        ? cancelCellExecution(cell.id)
                        : handleRunCell(tab.id, cell.id)
                    }
                  />
                </div>
                <div className={styles.actionsRight}>
                  <Dropdown
                    items={[
                      {
                        label: "Python",
                        onClick: () => {
                          handleChangeCellContent(
                            tab.id,
                            cell.id,
                            cell.content,
                            "type",
                            "code",
                          )
                        },
                      },
                      {
                        label: "Markdown",
                        onClick: () => {
                          handleChangeCellContent(
                            tab.id,
                            cell.id,
                            cell.content,
                            "type",
                            "markdown",
                          )
                        },
                      },
                      {
                        label: "SQL",
                        onClick: () => {
                          handleChangeCellContent(
                            tab.id,
                            cell.id,
                            cell.content,
                            "type",
                            "sql",
                          )
                        },
                      },
                    ]}
                    theme="link"
                    size="sm"
                    className="!px-0"
                    showArrow={true}
                    label={
                      cell.type === "code" ? (
                        <IconCode size={18} />
                      ) : cell.type === "markdown" ? (
                        <IconMarkdown size={18} />
                      ) : (
                        <IconDatabase size={18} />
                      )
                    }
                  />
                  <Button
                    variant="link"
                    color="default"
                    size="sm"
                    className="!px-1"
                    showLabel={false}
                    iconLeft={<IconCopyPlus size={18} />}
                    title="Duplicate Cell"
                    onClick={() => handleDuplicateCell(tab.id, cell.id)}
                  />
                  <Button
                    variant="link"
                    color="default"
                    size="sm"
                    className="!px-1"
                    showLabel={false}
                    iconLeft={<IconArrowNarrowUp size={18} />}
                    title="Move Up"
                    onClick={() => handleMoveCell(tab.id, cell.id, "up")}
                  />
                  <Button
                    variant="link"
                    color="default"
                    size="sm"
                    className="!px-1"
                    showLabel={false}
                    iconLeft={<IconArrowNarrowDown size={18} />}
                    title="Move Down"
                    onClick={() => handleMoveCell(tab.id, cell.id, "down")}
                  />
                  <Button
                    variant="link"
                    color="default"
                    size="sm"
                    className="!px-1"
                    showLabel={false}
                    iconLeft={<IconRowInsertTop size={18} />}
                    title="Insert Cell Above"
                    onClick={() => handleInsertAbove(tab.id, cell.id)}
                  />
                  <Button
                    variant="link"
                    color="default"
                    size="sm"
                    className="!px-1"
                    showLabel={false}
                    iconLeft={<IconRowInsertBottom size={18} />}
                    title="Insert Cell Below"
                    onClick={() => handleInsertBelow(tab.id, cell.id)}
                  />
                  <Button
                    variant="link"
                    color="default"
                    size="sm"
                    className="!px-1"
                    showLabel={false}
                    iconLeft={<IconTrashFilled size={18} />}
                    title="Delete Cell"
                    onClick={() => handleDeleteCell(tab.id, cell.id)}
                    disabled={cells.length <= 1}
                  />
                </div>
              </div>
              <Editor
                height="auto"
                language={
                  cell.type === "code"
                    ? "python"
                    : cell.type === "markdown"
                      ? "markdown"
                      : "sql"
                }
                theme="vs"
                value={cell.content}
                onChange={(val) =>
                  handleChangeCellContent(tab.id, cell.id, val)
                }
                onMount={(editor) => {
                  const updateHeight = () => {
                    const contentHeight = editor.getContentHeight()
                    editor.layout({
                      width: editor.getLayoutInfo().width,
                      height: contentHeight,
                    })
                  }
                  updateHeight()
                  editor.onDidContentSizeChange(updateHeight)
                  editor.onDidFocusEditorWidget(() => {
                    setActiveCellId(cell.id)
                  })
                  if (index === 0) {
                    editor.focus()
                  }
                }}
                options={{
                  minimap: { enabled: false },
                  fontSize: 13,
                  scrollBeyondLastLine: false,
                  wordWrap: "off",
                  automaticLayout: true,
                  padding: {
                    top: 12,
                    bottom: 12,
                  },
                }}
              />

              {renderOutput(cell)}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

const ROWS_PER_PAGE = 50

// Component untuk menampilkan JSON data secara dinamis
const DynamicJsonViewer = ({ data }: { data: any }) => {
  const [expanded, setExpanded] = useState(false)
  const [selectedTab, setSelectedTab] = useState("Schema")

  // Menentukan nama dan tipe dari data JSON
  const getDataInfo = (data: any) => {
    if (Array.isArray(data)) {
      return {
        name: "array",
        type: `Array[${data.length}]`,
        fields: data.length > 0 ? Object.keys(data[0]) : [],
        itemCount: data.length,
        sampleData: data.length > 0 ? data[0] : null,
      }
    } else if (typeof data === "object" && data !== null) {
      return {
        name: "object",
        type: "Object",
        fields: Object.keys(data),
        itemCount: Object.keys(data).length,
        sampleData: data,
      }
    } else {
      return {
        name: "primitive",
        type: typeof data,
        fields: [],
        itemCount: 0,
        sampleData: data,
      }
    }
  }

  const { name, type, fields, itemCount, sampleData } = getDataInfo(data)
  const toggleExpand = () => setExpanded(!expanded)

  const visibleFields = expanded ? fields : fields.slice(0, 3)
  const remainingCount = fields.length - visibleFields.length

  const tabsData = [
    { label: "Schema", active: selectedTab === "Schema" },
    { label: "Preview", active: selectedTab === "Preview" },
    { label: "Raw JSON", active: selectedTab === "Raw JSON" },
  ]

  const getFieldType = (field: string) => {
    if (Array.isArray(data) && data.length > 0) {
      const value = data[0][field]
      if (Array.isArray(value)) return "array"
      if (value === null) return "null"
      if (typeof value === "object") return "object"
      return typeof value
    } else if (typeof data === "object" && data !== null) {
      const value = data[field]
      if (Array.isArray(value)) return "array"
      if (value === null) return "null"
      if (typeof value === "object") return "object"
      return typeof value
    }
    return "unknown"
  }

  const renderTabContent = () => {
    switch (selectedTab) {
      case "Schema":
        return (
          <div className="px-4 py-2 mt-2 border border-black-100 text-gray-600">
            {fields.length === 0 ? (
              <div className="text-gray-500 italic">No fields available</div>
            ) : (
              fields.map((field, idx) => (
                <div key={idx} className="py-1 font-mono text-sm">
                  <span className="text-blue-600">{field}</span>
                  <span className="text-gray-500">: </span>
                  <span className="text-green-600">{getFieldType(field)}</span>
                </div>
              ))
            )}
          </div>
        )
      case "Preview":
        return (
          <div className="px-4 py-2 mt-2 border border-black-100 text-gray-600">
            <div>
              <strong>Type:</strong> {type}
            </div>
            <div>
              <strong>Count:</strong> {itemCount}{" "}
              {Array.isArray(data) ? "items" : "properties"}
            </div>
            {sampleData && (
              <div className="mt-2">
                <strong>Sample Data:</strong>
                <div className="mt-1 p-2 bg-gray-50 rounded text-xs overflow-auto max-h-32">
                  {Array.isArray(data) ? (
                    <div className="space-y-1">
                      {data.slice(0, 3).map((item, idx) => (
                        <div
                          key={idx}
                          className="border-b border-gray-200 pb-1"
                        >
                          <strong>Item {idx + 1}:</strong>
                          <pre className="mt-1 text-xs">
                            {JSON.stringify(item, null, 2)}
                          </pre>
                        </div>
                      ))}
                      {data.length > 3 && (
                        <div className="text-gray-500 italic">
                          ... and {data.length - 3} more items
                        </div>
                      )}
                    </div>
                  ) : (
                    <pre className="text-xs">
                      {JSON.stringify(sampleData, null, 2)}
                    </pre>
                  )}
                </div>
              </div>
            )}
          </div>
        )
      case "Raw JSON":
        return (
          <div className="px-4 py-2 mt-2 border border-black-100">
            <pre className="text-xs bg-gray-50 p-2 rounded overflow-auto max-h-64 whitespace-pre-wrap">
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        )
      default:
        return null
    }
  }

  // For primitive data types, show simplified view
  if (fields.length === 0 && typeof data !== "object") {
    return (
      <div className="py-2 bg-gray-100 rounded-md font-mono text-sm text-gray-800">
        <div className="px-4 py-1 border-b border-black-100">
          <span className="flex align-middle items-center gap-x-2">
            <IconTable size={16} /> {name}
          </span>
          <span className="text-black">
            : {type} = {String(data)}
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="py-2 bg-gray-100 rounded-md font-mono text-sm text-gray-800">
      <div className="flex items-center gap-2 border-b border-black-100 px-4 py-1">
        <button
          onClick={toggleExpand}
          className="text-black hover:text-gray-800"
        >
          {expanded ? (
            <IconCaretDownFilled size={16} />
          ) : (
            <IconCaretRightFilled size={16} />
          )}
        </button>
        <span className="flex align-middle items-center gap-x-2">
          <IconTable size={16} /> {name}
        </span>
        <span className="text-black">
          : {type}
          {!expanded &&
            fields.length > 0 &&
            ` = [${visibleFields.join(", ")}${remainingCount > 0 ? ` ... ${remainingCount} more fields` : ""}]`}
        </span>
      </div>

      {expanded && (
        <div className="px-4">
          <div className="mt-1">
            <Tabs
              variant="no-background"
              size="small"
              items={tabsData}
              renderContent={() => <div>{renderTabContent()}</div>}
              onClick={(tab) => setSelectedTab(tab.label)}
            />
          </div>
        </div>
      )}
    </div>
  )
}

const DynamicTableWithPagination = ({ cell }: { cell: { data: any[] } }) => {
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortConfig, setSortConfig] = useState<{
    key: string
    direction: "asc" | "desc"
  } | null>(null)

  if (!Array.isArray(cell?.data) || cell.data.length === 0) return null

  const headers = Object.keys(cell.data[0])

  const filteredData = useMemo(
    () =>
      cell.data.filter((row) => {
        if (!searchTerm) return true
        return headers.some((header) => {
          const value = row[header]
          return (
            value &&
            value.toString().toLowerCase().includes(searchTerm.toLowerCase())
          )
        })
      }),
    [cell.data, searchTerm, headers],
  )

  const sortedData = useMemo(() => {
    if (!sortConfig) return filteredData
    return [...filteredData].sort((a, b) => {
      const aValue = a[sortConfig.key]
      const bValue = b[sortConfig.key]
      if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1
      if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1
      return 0
    })
  }, [filteredData, sortConfig])

  const totalRows = sortedData.length
  const totalPages = Math.ceil(totalRows / ROWS_PER_PAGE)

  const paginatedData = useMemo(
    () =>
      sortedData.slice(
        (currentPage - 1) * ROWS_PER_PAGE,
        currentPage * ROWS_PER_PAGE,
      ),
    [sortedData, currentPage],
  )

  const handleSort = (columnKey: string) => {
    const direction =
      sortConfig &&
      sortConfig.key === columnKey &&
      sortConfig.direction === "asc"
        ? "desc"
        : "asc"
    setSortConfig({ key: columnKey, direction })
  }

  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
    setCurrentPage(1)
  }

  const handleDownloadExcel = () => {
    downloadAsExcel(filteredData, { filename: "table_data.xlsx" })
  }

  const handleDownloadCSV = () => {
    downloadAsCSV(filteredData, { filename: "table_data.csv" })
  }

  const handleDownloadTSV = () => {
    downloadAsTSV(filteredData, { filename: "table_data.tsv" })
  }

  const handleCopyToClipboard = async () => {
    try {
      await copyDataToClipboard(filteredData)
      console.log("Data copied to clipboard successfully")
    } catch (error) {
      console.error("Failed to copy data to clipboard:", error)
    }
  }

  const [showSearch, setShowSearch] = useState(false)
  const tabTable = [{ label: "Table", active: true }]

  const tableColumns = [
    { label: "#", key: "#", sortable: false },
    ...headers.map((key) => ({ label: key, key: key, sortable: true })),
  ]

  return (
    <div className="bg-white border-t border-black-100">
      <div className="border-t-2 min-h-12 flex justify-between p-3 relative">
        <Tabs
          items={tabTable}
          showCount={false}
          onAddClick={() => {}}
          showDropdown={true}
          dropdownOptions={[
            {
              label: "Create custom table",
              onClick: () => console.log("Create custom table"),
            },
            { label: "Download CSV", onClick: () => handleDownloadCSV() },
            { label: "Download TSV", onClick: () => handleDownloadTSV() },
            { label: "Download Excel", onClick: () => handleDownloadExcel() },
            {
              label: "Copy results to clipboard",
              onClick: () => handleCopyToClipboard(),
            },
          ]}
          renderContent={() => (
            <div>
              <div className="overflow-auto max-h-[395px]">
                <Table.Table className="!w-auto min-w-[1000px]" theme="query">
                  <Table.TableHeader
                    columns={tableColumns}
                    sortColumn={sortConfig?.key}
                    sortDirection={sortConfig?.direction}
                    onSort={handleSort}
                  />
                  <Table.TableBody>
                    {paginatedData.map((row, rowIndex) => (
                      <Table.TableRow key={rowIndex}>
                        <Table.TableCell>
                          {(currentPage - 1) * ROWS_PER_PAGE + rowIndex + 1}
                        </Table.TableCell>
                        {headers.map((key) => (
                          <Table.TableCell key={key}>
                            {row[key]}
                          </Table.TableCell>
                        ))}
                      </Table.TableRow>
                    ))}
                  </Table.TableBody>
                </Table.Table>
              </div>
              <div className="w-full py-4">
                <Pagination
                  currentPage={currentPage}
                  pageSize={ROWS_PER_PAGE}
                  totalPages={totalPages}
                  totalRecords={totalRows}
                  onPageChange={setCurrentPage}
                />
              </div>
            </div>
          )}
        />
        <div className="option flex justify-center gap-4 absolute right-3 top-[15px]">
          <div>
            {showSearch && (
              <Search
                placeholder="Search here..."
                sizes="sm"
                type="default"
                value={searchTerm}
                onChange={(e) => {
                  handleSearchChange(e.target.value)
                }}
              />
            )}
          </div>
          <Button
            variant="link"
            color="default"
            size="sm"
            showLabel={false}
            className="!px-0"
            iconLeft={<IconSearch size={16} />}
            onClick={() => setShowSearch((prev) => !prev)}
          />
        </div>
      </div>
    </div>
  )
}

export default WorkspaceCreateBlank
