export interface WorkspaceTableTrashData {
  id: number
  name: string
  type: string
  owner: string
  created: string
}

export const dataWorkspaceTableTrash: WorkspaceTableTrashData[] = [
  {
    id: 1,
    name: "Test",
    type: "Folder",
    owner: "lenin.sv@mediacorp.sg",
    created: "Mar 19, 2025  18:00:00",
  },
  {
    id: 2,
    name: "Untitled Notebook 2025-05-07 11:49:23",
    type: "Notebook",
    owner: "lenin.sv@mediacorp.sg",
    created: "Mar 19, 2025  18:00:00",
  },
]
