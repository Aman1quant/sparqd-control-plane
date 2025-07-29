import ListCompute from "./Compute"
import ListRole from "./Role"
import ListUser from "./User"
import ListWorkspace from "./Workspace"

interface MenuListDataProps {
  activeTab: "workspace" | "compute" | "user" | "role"
}

const MenuListData = ({ activeTab }: MenuListDataProps) => {
  return (
    <div>
      {activeTab === "workspace" && <ListWorkspace />}
      {activeTab === "compute" && <ListCompute />}
      {activeTab === "user" && <ListUser />}
      {activeTab === "role" && <ListRole />}
    </div>
  )
}

export default MenuListData
