import { useCreateWorkspace } from "@context/workspace/CreateWorkspace"
import { Button } from "@components/commons"

import WorkspaceTabbedLayout from "./TabbedLayout"

const WorkspaceMainContent = () => {
  const { tabs, closeTab, handleNewTab } = useCreateWorkspace()

  const handleCloseTab = (id: string) => {
    closeTab(id)
  }

  return tabs.length === 0 ? (
    <div className="w-full h-full flex flex-col items-center justify-center">
      <span className="text-gray-400 text-lg mb-4">No workspace tabs open</span>
      <Button onClick={() => handleNewTab({ type: "code" })}>
        New Notebook
      </Button>
    </div>
  ) : (
    <WorkspaceTabbedLayout
      tabs={tabs}
      onAddTab={() => handleNewTab({ type: "code" })}
      onCloseTab={handleCloseTab}
    />
  )
}

export default WorkspaceMainContent
