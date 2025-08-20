import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useHeader } from "@context/layout/header/HeaderContext"
import { Button, Tabs } from "@components/commons"
import styles from "./Queries.module.scss"
import SavedQueries from "./SavedQueries"
import QueryHistory from "./QueryHistory/"
import { useQuery } from "@context/query/QueryContext"
import QueryPreviewModal from "./QueryPreviewModal"

const Queries = () => {
  const navigate = useNavigate()
  const { queriesPageTab, setQueriesPageTab, savedQueries, queryHistory } = useQuery()
  const { dispatch } = useHeader()

  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [currentPreviewIndex, setCurrentPreviewIndex] = useState(0)
  const [activePreviewId, setActivePreviewId] = useState<
    number | string | null
  >(null)

  useEffect(() => {
    dispatch({
      type: "SET_HEADER",
      payload: { title: "", search: true },
    })
  }, [dispatch])

  const handleOpenPreview = (id: number | string) => {
    const dataList =
      queriesPageTab === "Saved queries" ? savedQueries : queryHistory
    const index = dataList.findIndex((q) => q.id === id)
    if (index !== -1) {
      setCurrentPreviewIndex(index)
      setActivePreviewId(id)
      setIsPreviewOpen(true)
    }
  }

  const handleClosePreview = () => {
    setIsPreviewOpen(false)
    setActivePreviewId(null)
  }

  const handleNavigatePreview = (direction: "next" | "previous") => {
    const newIndex =
      direction === "next" ? currentPreviewIndex + 1 : currentPreviewIndex - 1
    const dataList =
      queriesPageTab === "Saved queries" ? savedQueries : queryHistory
    setCurrentPreviewIndex(newIndex)
    setActivePreviewId(dataList[newIndex]?.id || null)
  }

  const getCurrentPreviewQuery = () => {
    const dataList =
      queriesPageTab === "Saved queries" ? savedQueries : queryHistory
    return dataList[currentPreviewIndex] || null
  }

  const dataListForPreview =
    queriesPageTab === "Saved queries" ? savedQueries : queryHistory

  const tabItems = [
    {
      id: "saved",
      label: "Saved queries",
      active: queriesPageTab === "Saved queries",
    },
    {
      id: "history",
      label: "Query history",
      active: queriesPageTab === "Query history",
    },
  ]

  return (
    <div className={styles.queriesContentWrapper}>
      <div className={styles.topSection}>
        <div className="flex items-center justify-between mt-2">
          <label className="text-black text-heading-6 font-medium">
            Queries
          </label>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              color="primary"
              size="md"
              label="Open Editor"
              onClick={() => navigate("/admin/sql")}
            />
            <Button
              variant="solid"
              color="primary"
              size="md"
              label="Create Query"
              onClick={() => navigate("/admin/sql")}
            />
          </div>
        </div>
      </div>

      <div className={styles.queriesTabsTable}>
        <Tabs
          items={tabItems}
          onClick={(tab) => setQueriesPageTab(tab.label)}
          renderContent={() => (
            <>
              {queriesPageTab === "Saved queries" && (
                <SavedQueries
                  onPreview={handleOpenPreview}
                  activePreviewId={activePreviewId}
                />
              )}
              {queriesPageTab === "Query history" && (
                <QueryHistory
                  onPreview={handleOpenPreview}
                  activePreviewId={activePreviewId}
                />
              )}
            </>
          )}
        />
      </div>
      <QueryPreviewModal
        isOpen={isPreviewOpen}
        onClose={handleClosePreview}
        query={getCurrentPreviewQuery()}
        onNext={() => handleNavigatePreview("next")}
        onPrevious={() => handleNavigatePreview("previous")}
        hasNext={currentPreviewIndex < dataListForPreview.length - 1}
        hasPrevious={currentPreviewIndex > 0}
        showQueryTabs={queriesPageTab === "Query history"}
      />
    </div>
  )
}

export default Queries
