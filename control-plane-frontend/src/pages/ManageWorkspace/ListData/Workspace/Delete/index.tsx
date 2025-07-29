import ReactDOM from "react-dom"
import { Button } from "@components/commons"
import { IconAlertTriangle } from "@tabler/icons-react"
import { useCreateWorkspace } from "@context/workspace/CreateWorkspace"
import { httpControlPlaneAPI } from "@http/axios"
import endpoint from "@http/endpoint"

const DeleteWorkspace = () => {
  const { closeDeleteModal, deletingWorkspace, handleGetWorkspace } =
    useCreateWorkspace()

  if (!deletingWorkspace) return null

  const onConfirmDelete = async () => {
    await httpControlPlaneAPI.delete(
      `${endpoint.new_api.workspace.main}/${deletingWorkspace.uuid}`,
    )

    await handleGetWorkspace()

    closeDeleteModal()
  }

  return ReactDOM.createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
        <div className="flex items-center gap-3 p-4">
          <IconAlertTriangle size={24} className="text-red-500" />
          <h2 className="text-lg font-semibold">Confirm Delete</h2>
        </div>
        <div className="p-4 pt-2">
          <p className="text-sm text-gray-600">
            Are you sure you want to delete the workspace "
            {deletingWorkspace.name}"?
          </p>
          <p className="text-sm text-gray-600 mt-4">
            This action cannot be undone.
          </p>
        </div>
        <div className="flex items-center justify-end gap-3 p-4 border-t bg-gray-50 rounded-b-lg">
          <Button label="Cancel" variant="outline" onClick={closeDeleteModal} />
          <Button
            label="Confirm delete"
            variant="solid"
            color="danger"
            onClick={onConfirmDelete}
          />
        </div>
      </div>
    </div>,
    document.body,
  )
}

export default DeleteWorkspace
