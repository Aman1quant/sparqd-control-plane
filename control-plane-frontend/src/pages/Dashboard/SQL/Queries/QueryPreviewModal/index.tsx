import React, {useState} from "react"
import { useNavigate } from "react-router-dom"
import ReactDOM from "react-dom"
import { Button } from "@components/commons"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { darkula } from "react-syntax-highlighter/dist/cjs/styles/hljs"
import type { SavedQuery } from "@/types/savedQuery"
import { IconX } from "@tabler/icons-react"
import styles from "./QueryPreviewModal.module.scss"
import { useQuery } from "@context/query/QueryContext"

interface QueryPreviewModalProps {
  isOpen: boolean
  onClose: () => void
  query: SavedQuery | null
  onNext: () => void
  onPrevious: () => void
  hasNext: boolean
  hasPrevious: boolean
  showQueryTabs?: boolean
}

const QueryPreviewModal: React.FC<QueryPreviewModalProps> = ({
  isOpen,
  onClose,
  query,
  onNext,
  onPrevious,
  hasNext,
  hasPrevious,
  showQueryTabs = false,
}) => {
  if (!isOpen || !query) return null
  const { addTab } = useQuery()
  const navigate = useNavigate()
  const [activeSqlTab, setActiveSqlTab] = useState("user")

  const handleOpenInSqlLab = (query: any) => {
    addTab(query);
    navigate("/admin/sql");
  };

  const sqlToDisplay = activeSqlTab === 'user' ? query.sql : query.executed_sql;

  return ReactDOM.createPortal(
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Query preview</h2>
          <button onClick={onClose} className={styles.closeButton}>
            <IconX size={20} />
          </button>
        </div>
        <div className={styles.content}>
          <div className="text-sm text-gray-500 mb-2">QUERY NAME</div>
          <h3 className="text-lg font-semibold mb-4">{query.label || query.tab_name}</h3>
          {showQueryTabs ? (
             <div>
                <div className="flex border-b mb-2">
                    <button 
                        className={`${styles.sqlTab} ${activeSqlTab === 'user' ? styles.activeSqlTab : ''}`}
                        onClick={() => setActiveSqlTab('user')}
                    >
                        User query
                    </button>
                    <button 
                        className={`${styles.sqlTab} ${activeSqlTab === 'executed' ? styles.activeSqlTab : ''}`}
                        onClick={() => setActiveSqlTab('executed')}
                    >
                        Executed query
                    </button>
                </div>
                <div className="border rounded-md bg-gray-50 max-h-96 overflow-auto">
                    <SyntaxHighlighter 
                    language="sql"
                    style={darkula}
                    customStyle={{
                      margin: 0,
                      padding: "1rem",
                      fontSize: "0.85rem",
                      whiteSpace: "pre-line",
                      overflow: "scroll",
                      minWidth: "fit-content",
                      maxHeight: "300px",
                      wordBreak: "break-all",
                    }}
                    codeTagProps={{
                      style: {
                        whiteSpace: "pre-line",
                        overflowX: "auto",
                      },
                    }}
                    wrapLines={true}
                    wrapLongLines={false}
                    >
                        {sqlToDisplay || ""}
                    </SyntaxHighlighter>
                </div>
             </div>
          ) : (
            <div className="border rounded-md bg-gray-50 max-h-96 overflow-auto">
                <SyntaxHighlighter
                  language="sql"
                  style={darkula}
                  customStyle={{
                    margin: 0,
                    padding: "1rem",
                    fontSize: "0.85rem",
                    whiteSpace: "pre-line",
                    overflow: "scroll",
                    minWidth: "fit-content",
                    maxHeight: "300px",
                    wordBreak: "break-all",
                  }}
                  codeTagProps={{
                    style: {
                      whiteSpace: "pre-line",
                      overflowX: "auto",
                    },
                  }}
                  wrapLines={true}
                  wrapLongLines={false}
                >
                    {query.sql || ""}
                </SyntaxHighlighter>
            </div>
          )}
          {/* <div className="border rounded-md bg-gray-50 max-h-96 overflow-auto">
            <SyntaxHighlighter
              language="sql"
              style={darkula}
              customStyle={{
                margin: 0,
                padding: "1rem",
                fontSize: "0.85rem",
                whiteSpace: "pre-line",
                overflow: "scroll",
                minWidth: "fit-content",
                maxHeight: "300px",
                wordBreak: "break-all",
              }}
              codeTagProps={{
                style: {
                  whiteSpace: "pre-line",
                  overflowX: "auto",
                },
              }}
              wrapLines={true}
              wrapLongLines={false}
            >
              {query.sql || ""}
            </SyntaxHighlighter>
          </div> */}
        </div>
        <div className={styles.footer}>
          <Button
            variant="outline"
            color="primary"
            size="sm"
            label="Previous"
            onClick={onPrevious}
            disabled={!hasPrevious}
          />
          <Button
            variant="outline"
            color="primary"
            size="sm"
            label="Next"
            onClick={onNext}
            disabled={!hasNext}
          />
          <Button
            variant="solid"
            color="primary"
            size="sm"
            label="Open in SQL Lab"
            onClick={() => handleOpenInSqlLab(query)}
          />
        </div>
      </div>
    </div>,
    document.body
  )
}

export default QueryPreviewModal