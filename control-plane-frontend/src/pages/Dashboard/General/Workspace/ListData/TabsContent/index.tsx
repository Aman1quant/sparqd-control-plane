import WorkspaceTableFavorites from "./Favorites"
import WorkspaceTableHome from "./Home"
import WorkspaceTableTrash from "./Trash"

interface ListDataProps {
  activeTab: "home" | "favorites" | "trash"
  selectedPath: string
  setSelectedPath: (path: string) => void
}

const ListData = ({ activeTab, selectedPath, setSelectedPath }: ListDataProps) => {
  return (
    <div>
      {activeTab === "home" && (
        <WorkspaceTableHome
          selectedPath={selectedPath}
          setSelectedPath={setSelectedPath}
        />
      )}
      {activeTab === "favorites" && <WorkspaceTableFavorites />}
      {activeTab === "trash" && <WorkspaceTableTrash />}
    </div>
  )
}

export default ListData