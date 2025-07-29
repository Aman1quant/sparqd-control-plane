import { useState, useEffect } from "react"
import clsx from "clsx"

import Editor from "@monaco-editor/react"
import {
  IconArrowNarrowDown,
  IconArrowNarrowUp,
  IconCode,
  IconCopyPlus,
  IconDatabase,
  IconMarkdown,
  IconPlayerPlayFilled,
  IconRowInsertBottom,
  IconRowInsertTop,
  IconTrashFilled,
} from "@tabler/icons-react"

import { Button, Table } from "@components/commons"
import Dropdown from "@components/commons/Dropdown"
import { useGlobalShortcut } from "@hooks/useGlobalShorcut"

import {
  useCreateWorkspace,
  type Cell,
  type TabType,
} from "@context/workspace/CreateWorkspace"

import styles from "./CreateBlank.module.scss"

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
  } = useCreateWorkspace()

  const [cells, setCells] = useState<Cell[]>([
    { id: "1", content: "", type: "code", output: "", outputs: [] },
  ])

  useEffect(() => {
    const loadedCells = (tab.content || []).map((c) => ({
      ...c,
      type: c.type || "code",
    }))
    setCells(loadedCells)
  }, [tab])

  useGlobalShortcut([
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
  ])

  return (
    <div className={styles.wrapper}>
      {cells.map((cell, index) => (
        <div
          key={cell.id}
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
                  color="primary"
                  size="sm"
                  className="!px-1"
                  showLabel={false}
                  iconLeft={<IconPlayerPlayFilled size={18} />}
                  title="Run Cell"
                  onClick={() => handleRunCell(tab.id, cell.id)}
                />
              </div>
              <div className={styles.actionsRight}>
                <Dropdown
                  items={[
                    {
                      label: "Code",
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
              onChange={(val) => handleChangeCellContent(tab.id, cell.id, val)}
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
                fontSize: 14,
                scrollBeyondLastLine: false,
                wordWrap: "off",
                automaticLayout: true,
                lineNumbers: "off",
                padding: {
                  top: 12,
                  bottom: 12,
                },
              }}
            />

            {cell.output && (
              <pre
                className={
                  /error|traceback|exception/i.test(cell.output)
                    ? styles.outputError
                    : styles.output
                }
              >
                {cell.output}
              </pre>
            )}

            {Array.isArray(cell?.data) && (
              <DynamicTableWithPagination cell={{ data: cell.data }} />
            )}

            {/* {cell.outputs?.map((output, i) => (
              <div key={i}>
                {output.data?.["text/html"] && (
                  <div
                    dangerouslySetInnerHTML={{
                      __html: output.data["text/html"],
                    }}
                  />
                )}
                {output.data?.["text/plain"] && (
                  <pre>{output?.data["text/plain"]}</pre>
                )}
                {output.text && <pre>{output.text.join("")}</pre>}
              </div>
            ))} */}
          </div>
        </div>
      ))}
    </div>
  )
}

const ROWS_PER_PAGE = 50

const DynamicTableWithPagination = ({ cell }: { cell: { data: any[] } }) => {
  const [currentPage, setCurrentPage] = useState(1)

  if (!Array.isArray(cell?.data) || cell.data.length === 0) return null

  const headers = Object.keys(cell.data[0])
  const totalRows = cell.data.length
  const totalPages = Math.ceil(totalRows / ROWS_PER_PAGE)

  const paginatedData = cell.data.slice(
    (currentPage - 1) * ROWS_PER_PAGE,
    currentPage * ROWS_PER_PAGE,
  )

  const handlePageChange = (direction: "next" | "prev") => {
    setCurrentPage((prev) => {
      if (direction === "prev") return Math.max(prev - 1, 1)
      if (direction === "next") return Math.min(prev + 1, totalPages)
      return prev
    })
  }

  return (
    <div className="bg-white border-t border-black-100">
      <div className="overflow-auto max-h-96">
        <Table.Table className="!w-auto min-w-[1000px]" theme="query">
          <Table.TableHeader
            columns={[
              { label: "#" },
              ...headers.map((key) => ({ label: key })),
            ]}
          />
          <Table.TableBody>
            {paginatedData.map((row, rowIndex) => (
              <Table.TableRow key={rowIndex}>
                <Table.TableCell>
                  {(currentPage - 1) * ROWS_PER_PAGE + rowIndex + 1}
                </Table.TableCell>
                {headers.map((key) => (
                  <Table.TableCell key={key}>{row[key]}</Table.TableCell>
                ))}
              </Table.TableRow>
            ))}
          </Table.TableBody>
        </Table.Table>
      </div>
      <div className="flex justify-between items-center gap-4 px-4 py-2">
        <span className="text-body-small text-black-600">
          Page {currentPage} of {totalPages}
        </span>
        <div className="flex gap-2">
          <Button
            variant="outline"
            color="primary"
            size="sm"
            label="Previous"
            onClick={() => handlePageChange("prev")}
            disabled={currentPage === 1}
          />

          <Button
            variant="outline"
            color="primary"
            size="sm"
            label="Next"
            onClick={() => handlePageChange("next")}
            disabled={currentPage === totalPages}
          />
        </div>
      </div>
    </div>
  )
}

export default WorkspaceCreateBlank
