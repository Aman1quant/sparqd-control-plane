import { useCreateWorkspace } from "@context/workspace/CreateWorkspace"
import ComputeCreate from "./Create"
import ComputeDelete from "./Delete"
import ComputeEdit from "./Edit"
import ComputeListData from "./ListData"

const ListCompute = () => {
  const { isAddComputeModalOpen, editingCompute, deletingCompute } =
    useCreateWorkspace()

  return (
    <div className="bg-white rounded-2xl">
      <ComputeListData />
      {isAddComputeModalOpen && <ComputeCreate />}
      {editingCompute && <ComputeEdit />}
      {deletingCompute && <ComputeDelete />}
    </div>
  )
}

export default ListCompute
