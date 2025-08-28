import { useState } from "react"
import { Select } from "@components/commons"
import SingleTask from "./SingleTask"
import MultipleTask from "./MultipleTask"

const ImportTask = () => {
  const [selectedValue, setSelectedValue] = useState<string>("")

  const driverInstancesType = [
    { value: "single", label: "Single Task" },
    { value: "multiple", label: "Multiple Task" },
  ]

  return (
    <div className="my-4">
      <label className="text-body-medium font-medium">Import Data</label>
      <div className="grid grid-cols-1 mt-2 mb-4">
        <Select
          label="Source Type"
          showLabel={true}
          options={driverInstancesType}
          value={selectedValue}
          onChange={(value) => setSelectedValue(String(value))}
          placeholder="Select Source Type"
        />
      </div>
      <hr className="my-4" />

      {selectedValue === "single" && <SingleTask />}
      {selectedValue === "multiple" && <MultipleTask />}
    </div>
  )
}

export default ImportTask
