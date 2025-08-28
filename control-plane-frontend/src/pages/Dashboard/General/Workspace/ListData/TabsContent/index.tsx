import WorkspaceTableFavorites from "./Favorites"
import WorkspaceTableHome from "./Home"
import WorkspaceTableTrash from "./Trash"

interface ListDataProps {
  activeTab: "home" | "favorites" | "trash"
}

const ListData = ({ activeTab }: ListDataProps) => {
  return (
    <div>
      {activeTab === "home" && <WorkspaceTableHome />}
      {activeTab === "favorites" && <WorkspaceTableFavorites />}
      {activeTab === "trash" && <WorkspaceTableTrash />}
    </div>
  )
}

export default ListData
