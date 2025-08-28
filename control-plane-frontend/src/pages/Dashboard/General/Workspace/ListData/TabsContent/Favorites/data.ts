export interface WorkspaceTableFavoritesData {
  id: number
  name: string
  type: string
  owner: string
  location: string
}

export const dataWorkspaceTableFavorites: WorkspaceTableFavoritesData[] = [
  {
    id: 1,
    name: "Test",
    type: "Folder",
    owner: "lenin.sv@mediacorp.sg",
    location: "/Users/hello.soladev@gmail.com/",
  },
  {
    id: 2,
    name: "Untitled Notebook 2025-05-07 11:49:23",
    type: "Notebook",
    owner: "lenin.sv@mediacorp.sg",
    location: "/Users/hello.soladev@gmail.com/",
  },
]
