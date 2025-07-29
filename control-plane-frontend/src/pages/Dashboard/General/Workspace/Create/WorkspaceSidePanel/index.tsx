import { useState } from "react"
import { SideCatalog } from "@components/SideNav/SideCatalog"
import { SideLeft } from "@components/SideNav/SideLeft"

import type { TabType } from "../../../../../../types/tabs"

type WorkspaceSidePanelProps = {
  isCatalogOpen: boolean
  setIsCatalogOpen: React.Dispatch<React.SetStateAction<boolean>>
}

const WorkspaceSidePanel = ({
  isCatalogOpen,
  setIsCatalogOpen,
}: WorkspaceSidePanelProps) => {
  const [panelWidth, setPanelWidth] = useState(280)
  const [activeTab, setActiveTab] = useState<TabType | null>("file_browser")
  // const [isCatalogOpen, setIsCatalogOpen] = useState(true)

  const handleResize = (e: React.MouseEvent) => {
    const startX = e.clientX
    const startWidth = panelWidth

    document.body.style.cursor = "col-resize"

    const onMouseMove = (moveEvent: MouseEvent) => {
      const newWidth = Math.min(
        Math.max(280, startWidth + moveEvent.clientX - startX),
        400,
      )
      setPanelWidth(newWidth)
    }

    const onMouseUp = () => {
      window.removeEventListener("mousemove", onMouseMove)
      window.removeEventListener("mouseup", onMouseUp)
      document.body.style.cursor = "default"
    }

    window.addEventListener("mousemove", onMouseMove)
    window.addEventListener("mouseup", onMouseUp)
  }

  const handleTabClick = (tab: TabType) => {
    setActiveTab(tab)
    setIsCatalogOpen(true)
  }

  const handleCloseCatalog = () => {
    setActiveTab(null)
    setIsCatalogOpen(false)
  }
  return (
    <div className="flex bg-white rounded-l-2xl min-h-[80vh]">
      <SideLeft activeTab={activeTab} setActiveTab={handleTabClick} />
      {isCatalogOpen && activeTab && (
        <div className="flex" style={{ width: panelWidth }}>
          <SideCatalog activeTab={activeTab} onClose={handleCloseCatalog} />
          <div
            onMouseDown={handleResize}
            className="w-[6px] cursor-col-resize z-40"
            style={{
              marginLeft: "-3px",
              marginRight: "-3px",
            }}
          />
        </div>
      )}
    </div>
  )
}

export default WorkspaceSidePanel
