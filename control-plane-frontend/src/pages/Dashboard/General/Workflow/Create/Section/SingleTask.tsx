import { useState } from "react"
import { Button, DatePicker, Select } from "@components/commons"
import TextInput from "@components/commons/TextInput"

const SingleTask = () => {
  const [name, setName] = useState("")

  const [selectedValue, setSelectedValue] = useState<number | string>("")
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date())
  const driverInstancesType = [
    { value: "success", label: "Success" },
    { value: "failed", label: "Failed" },
  ]
  return (
    <div className="my-4">
      <label className="text-body-medium font-medium">Job Info</label>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2 mb-4">
        <TextInput
          type="text"
          label="DAG ID"
          showLabel={true}
          value={name}
          onChange={setName}
          size="md"
          placeholder="spark-optimize"
        />

        <DatePicker
          selected={selectedDate}
          onChange={(date: Date | null) => setSelectedDate(date)}
          dateFormat="dd/MM/yyyy"
          placeholderText="Select a date"
          label="Start Date"
          showLabel={true}
        />
        <TextInput
          type="text"
          label="Schecdule"
          showLabel={true}
          value={name}
          onChange={setName}
          size="md"
          placeholder="-"
        />
      </div>
      <label className="text-body-medium font-medium">Driver Config</label>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2 mb-4">
        <TextInput
          type="text"
          label="Driver Instances"
          showLabel={true}
          value={name}
          onChange={setName}
          size="md"
          placeholder="1"
          disabled={true}
        />
        <Select
          label="Driver Cores"
          showLabel={true}
          options={driverInstancesType}
          value={selectedValue}
          onChange={(value) => setSelectedValue(value)}
          placeholder="4"
        />{" "}
        <Select
          label="Driver Memory"
          showLabel={true}
          options={driverInstancesType}
          value={selectedValue}
          onChange={(value) => setSelectedValue(value)}
          placeholder="32g"
        />
      </div>
      <label className="text-body-medium font-medium">Executor Config</label>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2 mb-4">
        <Select
          label="Executor Instances"
          showLabel={true}
          options={driverInstancesType}
          value={selectedValue}
          onChange={(value) => setSelectedValue(value)}
          placeholder="8"
        />
        <Select
          label="Executor Cores"
          showLabel={true}
          options={driverInstancesType}
          value={selectedValue}
          onChange={(value) => setSelectedValue(value)}
          placeholder="2"
        />
        <Select
          label="Executor Memory"
          showLabel={true}
          options={driverInstancesType}
          value={selectedValue}
          onChange={(value) => setSelectedValue(value)}
          placeholder="18g"
        />
      </div>
      <label className="text-body-medium font-medium">Notebook Paths</label>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2 mb-4">
        <TextInput
          type="text"
          label="Input Notebook"
          size="md"
          showLabel={true}
          value={name}
          onChange={setName}
          placeholder="Enter your name"
        />
        <TextInput
          type="text"
          label="Output Notebook"
          size="md"
          showLabel={true}
          value={name}
          onChange={setName}
          placeholder="Enter your name"
        />
      </div>
      <div className="justify-end flex gap-2 mt-10">
        <Button variant="outline" color="primary" size="sm" label="Cancel" />
        <Button variant="solid" color="primary" size="sm" label="Submit" />
      </div>
    </div>
  )
}

export default SingleTask
