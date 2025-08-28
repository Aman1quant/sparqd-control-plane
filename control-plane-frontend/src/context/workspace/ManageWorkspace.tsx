import { createContext, useContext, useState } from "react"

export interface IWorkspace {
  id: string
  name: string
  status: string
  workspace_url: string
  cloud: string
  region: string
  credential: string
  created: string
  // metastore: string
}

interface IWorkspaceManagementContext {
  workspace: IWorkspace[]
  filteredWorkspace: IWorkspace[]
  searchQuery: string
  setSearchQuery: (query: string) => void
}

const initialWorkspace: IWorkspace[] = [
  {
    id: "1",
    name: "Farhanspace",
    status: "Running",
    workspace_url: "uuid.domain.com",
    cloud: "AWS",
    region: "Singapore",
    credential: "Serverless only",
    created: "05/02/2025",
    // metastore: "metastore_aws_ap",
  },
  {
    id: "2",
    name: "Samplespace",
    status: "Running",
    workspace_url: "uuid.domain.com",
    cloud: "AWS",
    region: "Singapore",
    credential: "Serverless only",
    created: "05/02/2025",
    // metastore: "metastore_aws_ap",
  },
]

const WorkspaceManagementContext = createContext<
  IWorkspaceManagementContext | undefined
>(undefined)

export const WorkspaceManagementProvider = ({
  children,
}: {
  children: React.ReactNode
}) => {
  const [workspace] = useState<IWorkspace[]>(initialWorkspace)
  const [searchQuery, setSearchQuery] = useState("")
  const filteredWorkspace = workspace.filter((ws) =>
    ws.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <WorkspaceManagementContext.Provider
      value={{
        workspace,
        filteredWorkspace,
        searchQuery,
        setSearchQuery,
      }}
    >
      {children}
    </WorkspaceManagementContext.Provider>
  )
}

export const useWorkspaceManagement = () => {
  const context = useContext(WorkspaceManagementContext)
  if (context === undefined) {
    throw new Error(
      "useWorkspaceManagement must be used within a WorkspaceManagementProvider",
    )
  }
  return context
}
