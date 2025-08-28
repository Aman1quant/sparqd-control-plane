import {
  useWorkspaceManagement,
  WorkspaceManagementProvider,
} from "@context/workspace/ManageWorkspace"
import WorkspaceListData from "./ListData"
const WorkspaceManagementContent = () => {
  //   const { isAddUserModalOpen, isEditModalOpen, isDeleteModalOpen } =
  useWorkspaceManagement()
  return (
    <div className=" bg-white rounded-2xl">
      <WorkspaceListData />
      {/* {isAddUserModalOpen && <WorkspaceCreate />}
      {isEditModalOpen && <WorkspaceEdit />}
      {isDeleteModalOpen && <WorkspaceDelete />} */}
    </div>
  )
}

const ListWorkspace = () => {
  return (
    <WorkspaceManagementProvider>
      <WorkspaceManagementContent />
    </WorkspaceManagementProvider>
  )
}

export default ListWorkspace
