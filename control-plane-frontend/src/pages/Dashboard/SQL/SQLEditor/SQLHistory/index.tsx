import { useState, useRef } from "react"
import { useQuery } from "@context/query/QueryContext"
import { IconCircleCheck, IconAlertCircle, IconX } from "@tabler/icons-react"
import styles from "./SQLHistory.module.scss"
import { Tooltip } from "@components/commons"
import { formatDistanceToNow } from "date-fns"

const SQLHistory = ({ onClose }: { onClose: () => void }) => {
  const { queryHistory, updateTabSql, activeTabId } = useQuery()
  const [panelWidth, setPanelWidth] = useState(350)
  const panelRef = useRef<HTMLDivElement>(null)

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    const startWidth = panelRef.current?.offsetWidth || panelWidth
    const startX = e.clientX

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const newWidth = startWidth - (moveEvent.clientX - startX)
      const clampedWidth = Math.min(400, Math.max(200, newWidth))
      setPanelWidth(clampedWidth)
    }

    const handleMouseUp = () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseup", handleMouseUp)
    }

    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("mouseup", handleMouseUp)
  }

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "success":
      case "finished":
        return (
          <IconCircleCheck size={20} className="text-green-500 flex-shrink-0" />
        )
      case "failed":
        return (
          <IconAlertCircle size={20} className="text-red-500 flex-shrink-0" />
        )
      default:
        return (
          <IconAlertCircle size={20} className="text-gray-400 flex-shrink-0" />
        )
    }
  }

  const handleHistoryClick = (sql: string) => {
    if (activeTabId) {
      updateTabSql(activeTabId, sql)
    }
  }

  return (
    <div className="flex h-[calc(100vh-120px)]">
      <div className={styles.resizer} onMouseDown={handleMouseDown} />
      <aside
        ref={panelRef}
        className={styles.historyPanel}
        style={{ width: panelWidth }}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h2 className="font-bold text-lg">Past Execution</h2>
          <button className="hover:bg-gray-100 p-1" onClick={onClose}>
            <IconX size={18} className="text-gray-600" />
          </button>
        </div>
        <div className={styles.historyList}>
          {queryHistory.length === 0 ? (
            <p className="p-4 text-sm text-gray-500">No query history yet.</p>
          ) : (
            queryHistory.map((item) => (
              <Tooltip key={item.id} text="Click to copy SQL to editor">
                <div
                  className={styles.historyItem}
                  onClick={() => handleHistoryClick(item.sql)}
                >
                  <div className="flex items-start gap-2">
                    {getStatusIcon(item.status)}
                    <pre className={styles.historySql}>{item.sql}</pre>
                  </div>
                  <span className={styles.historyTimestamp}>
                    {formatDistanceToNow(new Date(item.start_time), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
              </Tooltip>
            ))
          )}
        </div>
      </aside>
    </div>
  )
}

export default SQLHistory
