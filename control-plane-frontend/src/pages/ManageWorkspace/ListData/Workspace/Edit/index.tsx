import { useState } from "react"
import ReactDOM from "react-dom"
import { Button, Select, TextInput } from "@components/commons"

import { httpControlPlaneAPI } from "@http/axios"
import endpoint from "@http/endpoint"

interface EditWorkspaceProps {
  workspace: any
  onClose: () => void
}

const EditWorkspace = ({ workspace, onClose }: EditWorkspaceProps) => {

  const [workspaceName, setWorkspaceName] = useState(workspace.name)
  const [workspaceUrl, setWorkspaceUrl] = useState(workspace.workspace_url)
  const [cloud, setCloud] = useState(workspace.cloud)
  const [region, setRegion] = useState(workspace.region)
  const [awsAccountId, setAwsAccountId] = useState(workspace.awsAccountId)
  const [vpc, setVpc] = useState(workspace.vpc)
  const [publicSubnetId, setPublicSubnetId] = useState(workspace.publicSubnetId)
  const [privateSubnetId, setPrivateSubnetId] = useState(
    workspace.privateSubnetId,
  )

  const [nameError, setNameError] = useState("")

  const cloudOptions = [{ label: "AWS", value: "AWS" }]
  const regionOptions = [
    { label: "AP-Southeast-1 (Singapore)", value: "ap-southeast-1" },
  ]

  const validate = () => {
    if (!workspaceName) {
      setNameError("Workspace name is required.")
      return false
    }
    setNameError("")
    return true
  }

  const handleSubmit = async () => {
    if (validate()) {
      const payload = {
        name: workspaceName,
        description: "",
        metadata: {
          url: workspaceUrl,
          cloud,
          region,
          vpc,
          publicSubnetId,
          awsAccountId,
          privateSubnetId,
        },
      }

      try {
        await httpControlPlaneAPI.put(
          `${endpoint.new_api.workspace.main}/${workspace.uuid}`,
          payload,
        )

        onClose()
      } catch (error) {
        // You can handle error here, e.g. show notification or set error state
        console.error("Failed to create workspace:", error)
      }
    }
  }

  return ReactDOM.createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Edit Workspace</h2>
          <button onClick={onClose} className="text-2xl font-bold">
            &times;
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <TextInput
            label="Workspace name*"
            value={workspaceName}
            onChange={setWorkspaceName}
            placeholder="Enter a name for your workspace"
            helperText={nameError}
          />
          <TextInput
            label="Workspace URL"
            value={workspaceUrl}
            onChange={setWorkspaceUrl}
            placeholder="Enter your workspace URL"
          />
          <Select
            showLabel={true}
            label="Cloud"
            options={cloudOptions}
            value={cloud}
            onChange={(val) => setCloud(String(val))}
          />
          <Select
            showLabel={true}
            label="Region"
            options={regionOptions}
            value={region}
            onChange={(val) => setRegion(String(val))}
          />
          <TextInput
            label="AWS Account ID"
            value={awsAccountId}
            onChange={setAwsAccountId}
            placeholder="Enter AWS Account ID"
          />
          <TextInput
            label="VPC"
            value={vpc}
            onChange={setVpc}
            placeholder="Enter VPC"
          />
          <TextInput
            label="Public Subnet ID"
            value={publicSubnetId}
            onChange={setPublicSubnetId}
            placeholder="Enter Public Subnet ID"
          />
          <TextInput
            label="Private Subnet ID"
            value={privateSubnetId}
            onChange={setPrivateSubnetId}
            placeholder="Enter Private Subnet ID"
          />
        </div>

        <div className="flex items-center justify-end gap-3 p-4 border-t">
          <Button
            label="Cancel"
            variant="outline"
            color="primary"
            onClick={onClose}
          />
          <Button
            label="Save Changes"
            variant="solid"
            color="primary"
            onClick={handleSubmit}
          />
        </div>
      </div>
    </div>,
    document.body,
  )
}

export default EditWorkspace
