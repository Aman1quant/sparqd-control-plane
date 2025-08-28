import { useState, useEffect, useRef } from "react"
import {
  IconClipboard,
  IconCopy,
  IconDeviceFloppy,
  IconPlayerPlay,
  IconPlayerStop,
  IconPlayerTrackNext,
  IconPlus,
  IconRotateClockwise,
  IconScissors,
  IconX,
} from "@tabler/icons-react"

import {
  useCreateWorkspace,
  type TabType,
} from "@context/workspace/CreateWorkspace"

import WorkspaceCreateBlank from "../CreateBlank"
import styles from "./TabbedLayout.module.scss"
import { Button } from "@components/commons"

type Props = {
  tabs: TabType[]
  onAddTab: () => void
  onCloseTab: (id: string) => void
}

const WorkspaceTabbedLayout = ({ tabs, onAddTab, onCloseTab }: Props) => {
  const { handleRunAllCells, activeTabId, setActiveTabId, handleInsertCell } =
    useCreateWorkspace()

  const tabBarRef = useRef<HTMLDivElement>(null)
  const [isOverflowing, setIsOverflowing] = useState(false)

  useEffect(() => {
    const el = tabBarRef.current
    if (!el) return

    const observer = new ResizeObserver(() => {
      setIsOverflowing(el.scrollWidth > el.clientWidth)
    })

    observer.observe(el)

    return () => observer.disconnect()
  }, [tabs])

  useEffect(() => {
    if (!tabs.some((tab) => tab.id === activeTabId)) {
      setActiveTabId(tabs[0]?.id || "")
    }
  }, [tabs, activeTabId])

  const activeTab = tabs.find((tab) => tab.id === activeTabId)

  return (
    <div className={styles.tabbedWrapper}>
      {/* Tab Bar */}
      <div className={styles.tabBarContainer}>
        <div ref={tabBarRef} className={styles.tabBar}>
          {tabs.map((tab) => (
            <div
              key={tab.id}
              className={`${styles.tab} ${
                tab.id === activeTabId ? styles.activeTab : ""
              }`}
              onClick={() => setActiveTabId(tab.id)}
              title={tab.name}
            >
              <span className={styles.tabName}>{tab.name}</span>
              <button
                className={styles.closeBtn}
                onClick={(e) => {
                  e.stopPropagation()
                  onCloseTab(tab.id)
                }}
              >
                <IconX size={16} />
              </button>
            </div>
          ))}
          {!isOverflowing && (
            <button className={styles.addTabBtn} onClick={onAddTab}>
              <IconPlus size={16} />
            </button>
          )}
        </div>

        {isOverflowing && (
          <button
            className={`${styles.addTabBtn} ${styles.floatingAddBtn}`}
            onClick={onAddTab}
          >
            <IconPlus size={16} />
          </button>
        )}
      </div>

      {/* Toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.toolbarLeft}>
          <div className="gap-x-4 flex items-center overflow-x-auto md:overflow-x-hidden flex-nowrap">
            <Button
              variant="link"
              color="default"
              size="sm"
              showLabel={false}
              iconLeft={<IconDeviceFloppy size={18} />}
              className="!px-2 md:!px-1"
              title="Save"
            />
            <Button
              variant="link"
              color="default"
              size="sm"
              showLabel={false}
              iconLeft={<IconPlus size={18} />}
              className="!px-2 md:!px-1"
              title="Inser a cell below"
              onClick={() => handleInsertCell(activeTabId || "")}
            />
            <Button
              variant="link"
              color="default"
              size="sm"
              showLabel={false}
              iconLeft={<IconScissors size={18} />}
              className="!px-2 md:!px-1"
              title="Cut this cell"
            />
            <Button
              variant="link"
              color="default"
              size="sm"
              showLabel={false}
              iconLeft={<IconCopy size={18} />}
              className="!px-2 md:!px-1"
              title="Copy this cell"
            />
            <Button
              variant="link"
              color="default"
              size="sm"
              showLabel={false}
              iconLeft={<IconClipboard size={18} />}
              className="!px-2 md:!px-1"
              title="Paste this cell from the clipboard"
            />
            <Button
              variant="link"
              color="default"
              size="sm"
              showLabel={false}
              iconLeft={<IconPlayerPlay size={18} />}
              className="!px-2 md:!px-1"
              onClick={() => handleRunAllCells(activeTabId || "")}
              title="Run all cell"
            />
            <Button
              variant="link"
              color="default"
              size="sm"
              showLabel={false}
              iconLeft={<IconPlayerStop size={18} />}
              className="!px-2 md:!px-1"
              title="Interrupt the kernel"
            />
            <Button
              variant="link"
              color="default"
              size="sm"
              showLabel={false}
              iconLeft={<IconRotateClockwise size={18} />}
              className="!px-2 md:!px-1"
              title="Restart the kernel"
            />
            <Button
              variant="link"
              color="default"
              size="sm"
              showLabel={false}
              iconLeft={<IconPlayerTrackNext size={18} />}
              className="!px-2 md:!px-1"
              title="Restart the kernel and run all cell"
            />
          </div>
        </div>
        <div className={styles.toolbarRight}>
          <div className={styles.kernelStatus}>
            <span className={styles.statusDot} />
            Python 3.13 (XPython)
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className={styles.tabContent}>
        {activeTab && (
          <div key={activeTab.id} className={styles.tabPanel}>
            <WorkspaceCreateBlank tab={activeTab} />
          </div>
        )}
      </div>
    </div>
  )
}

export default WorkspaceTabbedLayout
