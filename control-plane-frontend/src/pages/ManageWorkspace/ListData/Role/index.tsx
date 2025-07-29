import { useRoleManagement } from "@context/role/RoleContext"
import RoleListData from "./ListData"
import RoleCreate from "./Create"
import RoleEdit from "./Edit"
import RoleDelete from "./Delete"

const ListRole = () => {
  const { isAddRoleModalOpen, isEditModalOpen, isDeleteModalOpen } =
    useRoleManagement()

  return (
    <div className=" bg-white rounded-2xl">
      <RoleListData />
      {isAddRoleModalOpen && <RoleCreate />}
      {isEditModalOpen && <RoleEdit />}
      {isDeleteModalOpen && <RoleDelete />}
    </div>
  )
}

export default ListRole
