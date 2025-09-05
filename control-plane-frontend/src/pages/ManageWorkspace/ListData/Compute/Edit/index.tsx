import { useState } from "react"
import ReactDOM from "react-dom"
import { Button, Select, TextInput } from "@components/commons"

import { httpControlPlaneAPI } from "@http/axios"
import endpoint from "@http/endpoint"

const ComputeEdit = () => {
  const [computeData, setComputeData] = useState<any>(null)

  if (!computeData) return null

  const handleInputChange = (field: any, value: any) => {
    setComputeData((prev: any) => (prev ? { ...prev, [field]: value } : null))
  }

  const handleSave = async () => {
    try {
      const payload = {
        name: computeData.name,
        tshirtSize: computeData.size,
      }

      await httpControlPlaneAPI.put(
        `${endpoint.new_api.cluster.detail(computeData.uid)}`,
        payload,
      )
    } catch (error) {
      console.error("Error saving compute:", error)
    }
  }

  const sizeOptions = [
    { label: "Small", value: "Small" },
    { label: "Medium", value: "Medium" },
    { label: "Large", value: "Large" },
  ]

  return ReactDOM.createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">
            Edit Compute: 
          </h2>
          <button
            className="text-2xl font-bold"
          >
            &times;
          </button>
        </div>
        <div className="p-6 space-y-4">
          <TextInput
            label="Cluster Name*"
            value={computeData.name}
            onChange={(val) => handleInputChange("name", val)}
          />
          <Select
            showLabel
            label="Size"
            options={sizeOptions}
            value={computeData.size}
            onChange={(val) => handleInputChange("size", val)}
          />
        </div>
        <div className="flex items-center justify-end gap-3 p-4 border-t">
          <Button
            label="Cancel"
            variant="outline"
          />
          <Button label="Save Changes" variant="solid" onClick={handleSave} />
        </div>
      </div>
    </div>,
    document.body,
  )
}

export default ComputeEdit
