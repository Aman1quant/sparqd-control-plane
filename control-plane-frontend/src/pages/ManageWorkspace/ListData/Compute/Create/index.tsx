import { useState } from "react"
import ReactDOM from "react-dom"
import { Button, Select, TextInput } from "@components/commons"
import { httpControlPlaneAPI } from "@http/axios"
import endpoint from "@http/endpoint"

const ComputeCreate = () => {
  const [clusterName, setClusterName] = useState("")
  const [size, setSize] = useState<"Small" | "Medium" | "Large">("Medium")

  const sizeOptions = [
    { label: "Small", value: "Small" },
    { label: "Medium", value: "Medium" },
    { label: "Large", value: "Large" },
  ]

  const handleSubmit = async () => {
    try {
      const payload = {
        name: clusterName,
        tshirtSize: size,
        workspaceId: "",
      }

      await httpControlPlaneAPI.post(endpoint.new_api.cluster.main, payload)

    } catch (error) {
      console.error("Error creating compute:", error)
    }
  }

  return ReactDOM.createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Create Compute</h2>
          <button className="text-2xl font-bold">
            &times;
          </button>
        </div>
        <div className="p-6 space-y-4">
          <TextInput
            label="Cluster Name*"
            value={clusterName}
            onChange={setClusterName}
            placeholder="Enter a cluster name"
          />
          <Select
            showLabel
            label="Size"
            options={sizeOptions}
            value={size}
            onChange={(val) => setSize(val as any)}
          />
        </div>
        <div className="flex items-center justify-end gap-3 p-4 border-t">
          <Button
            label="Cancel"
            variant="outline"
          />
          <Button label="Create" variant="solid" onClick={handleSubmit} />
        </div>
      </div>
    </div>,
    document.body,
  )
}

export default ComputeCreate
