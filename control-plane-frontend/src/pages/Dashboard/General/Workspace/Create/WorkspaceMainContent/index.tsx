import { v4 as uuid } from "uuid"

import { useCreateWorkspace } from "@context/workspace/CreateWorkspace"

import WorkspaceLauncher from "./Launcher"
import WorkspaceTabbedLayout from "./TabbedLayout"

const WorkspaceMainContent = () => {
  const { tabs, addTab, closeTab } = useCreateWorkspace()

  const emptyTab = {
    id: uuid(),
    name: "Untitled",
    content: [
      {
        id: uuid(),
        content: "",
        output: "",
        type: "code" as const,
      },
    ],
  }

  const handleOpen = () => {
    const tab = {
      ...emptyTab,
      id: uuid(),
      content: emptyTab.content.map((item) => ({
        ...item,
        id: uuid(),
      })),
    }
    addTab(tab)
  }

  const handleAddTab = () => {
    const name = `Untitled ${tabs.length + 1}`
    const tab = {
      ...emptyTab,
      id: uuid(),
      name,
      content: emptyTab.content.map((item) => ({
        ...item,
        id: uuid(),
      })),
    }
    addTab(tab)
  }

  const handleCloseTab = (id: string) => {
    closeTab(id)
  }

  return tabs.length === 0 ? (
    <WorkspaceLauncher onOpen={() => handleOpen()} />
  ) : (
    <WorkspaceTabbedLayout
      tabs={tabs}
      onAddTab={handleAddTab}
      onCloseTab={handleCloseTab}
    />
  )
}

export default WorkspaceMainContent
