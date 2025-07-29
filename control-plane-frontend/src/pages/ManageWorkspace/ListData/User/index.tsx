import {
  UserManagementProvider,
  useUserManagement,
} from "@context/user/UserContext"
import UserCreate from "./Create"
import UserListData from "./ListData"
import UserEdit from "./Edit"
import UserDelete from "./Delete"
const UserManagementContent = () => {
  const { isAddUserModalOpen, isEditModalOpen, isDeleteModalOpen } =
    useUserManagement()
  return (
    <div className=" bg-white rounded-2xl">
      <UserListData />
      {isAddUserModalOpen && <UserCreate />}
      {isEditModalOpen && <UserEdit />}
      {isDeleteModalOpen && <UserDelete />}
    </div>
  )
}

const ListUser = () => {
  return (
    <UserManagementProvider>
      <UserManagementContent />
    </UserManagementProvider>
  )
}

export default ListUser
