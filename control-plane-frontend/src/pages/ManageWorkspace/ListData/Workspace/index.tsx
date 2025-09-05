import WorkspaceListData from "./ListData"
const WorkspaceManagementContent = () => {
  //   const { isAddUserModalOpen, isEditModalOpen, isDeleteModalOpen } =
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
    <WorkspaceManagementContent />
  )
}

export default ListWorkspace
