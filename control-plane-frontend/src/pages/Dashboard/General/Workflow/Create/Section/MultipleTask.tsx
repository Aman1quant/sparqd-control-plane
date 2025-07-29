import { useState } from "react"
import { Button, DatePicker } from "@components/commons"
import TextInput from "@components/commons/TextInput"
import { BsEye, BsEyeSlash, BsPlusCircle, BsTrash } from "react-icons/bs"

const MultipleTask = () => {
  const [name, setName] = useState("")

  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date())

  const [openIndexes, setOpenIndexes] = useState([0])

  const [payload, setPayload] = useState([
    {
      taskId: "",
      inputNotebook: "",
      outputNotebook: "",
      driverInstances: "1",
      driverCores: "4",
      driverMemory: "32g",
      executorInstances: "8",
      executorCores: "2",
      executorMemory: "18g",
    },
  ])

  /* Handle */
  const handleAddTask = (idx: number) => {
    const newPayload = [
      ...payload.slice(0, idx + 1),
      {
        taskId: "",
        inputNotebook: "",
        outputNotebook: "",
        driverInstances: "1",
        driverCores: "4",
        driverMemory: "32g",
        executorInstances: "8",
        executorCores: "2",
        executorMemory: "18g",
      },
      ...payload.slice(idx + 1),
    ]
    setPayload(newPayload)
    const adjustedOpenIndexes = openIndexes.map((i) => (i > idx ? i + 1 : i))
    setOpenIndexes(adjustedOpenIndexes)
  }

  const handleToggleOpen = (idx: number) => {
    setOpenIndexes(
      openIndexes.includes(idx)
        ? openIndexes.filter((i) => i !== idx)
        : [...openIndexes, idx],
    )
  }

  const handleDeleteTask = (idx: number) => {
    if (payload.length === 1) return
    const newPayload = payload.filter((_, i) => i !== idx)
    setPayload(newPayload)
    setOpenIndexes(
      openIndexes.filter((i) => i !== idx).map((i) => (i > idx ? i - 1 : i)),
    )
  }

  const handleChange = (idx: number, field: string, value: string) => {
    const newPayload = [...payload]
    // @ts-ignore
    newPayload[idx][field] = value
    setPayload(newPayload)
  }

  return (
    <div className="my-4">
      <label className="text-body-medium font-medium">Job Info</label>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2 mb-4">
        <TextInput
          type="text"
          label="DAG ID"
          value={name}
          onChange={setName}
          size="md"
          placeholder="spark-optimize"
          autoFocus
        />

        <DatePicker
          selected={selectedDate}
          onChange={(date: Date | null) => setSelectedDate(date)}
          dateFormat="dd/MM/yyyy"
          placeholderText="Select a date"
          label="Start Date"
          showLabel={true}
        />
        {/* <TextInput
              type="text"
              label="Start Date"
              showLabel={true}
              value={name}
              onChange={setName}
              placeholder="2025-01-01"
            /> */}
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
      <label className="text-body-medium font-medium">Child Task</label>
      <div className="flex gap-2 flex-col">
        {payload.map((item, index) => (
          <div
            key={index}
            onClick={() => handleToggleOpen(index)}
            className="cursor-pointer grid grid-cols-1 md:grid-cols-2 bg-primary-50 p-4 rounded-md gap-4"
          >
            <label className="text-body-medium">Task {index + 1}</label>
            <div className="flex justify-end gap-3 text-black font-bold">
              <span
                onClick={(e) => {
                  e.stopPropagation()
                  handleToggleOpen(index)
                }}
              >
                {openIndexes.includes(index) ? <BsEyeSlash /> : <BsEye />}
              </span>
              <span
                onClick={(e) => {
                  e.stopPropagation()
                  handleDeleteTask(index)
                }}
              >
                <BsTrash />
              </span>
              <span
                onClick={(e) => {
                  e.stopPropagation()
                  handleAddTask(index)
                }}
              >
                <BsPlusCircle />
              </span>
            </div>
            <div
              className={`col-span-2 transition-all duration-500 ease-in-out overflow-hidden ${
                openIndexes.includes(index)
                  ? "max-h-[1000px] opacity-100"
                  : "max-h-0 opacity-0"
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <div>
                <label className="text-body-medium font-medium">
                  Notebook Paths
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2 mb-4">
                  <TextInput
                    type="text"
                    label="Task id"
                    size="md"
                    showLabel={true}
                    value={item.taskId}
                    onChange={(val) => handleChange(index, "taskId", val)}
                    placeholder="spark-optimize"
                  />
                  <TextInput
                    type="text"
                    label="Input Notebook"
                    size="md"
                    showLabel={true}
                    value={item.inputNotebook}
                    onChange={(val) =>
                      handleChange(index, "inputNotebook", val)
                    }
                    placeholder="Enter your name"
                  />
                  <TextInput
                    type="text"
                    label="Output Notebook"
                    size="md"
                    showLabel={true}
                    value={item.outputNotebook}
                    onChange={(val) =>
                      handleChange(index, "outputNotebook", val)
                    }
                    placeholder="Enter your name"
                  />
                </div>
              </div>

              <div>
                <label className="text-body-medium font-medium">
                  Driver Config
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2 mb-4">
                  <TextInput
                    type="text"
                    label="Driver Instances"
                    showLabel={true}
                    value={item.driverInstances}
                    onChange={(val) =>
                      handleChange(index, "driverInstances", val)
                    }
                    size="md"
                    placeholder="1"
                    disabled
                  />
                  <TextInput
                    type="text"
                    label="Driver Cores"
                    showLabel={true}
                    value={item.driverCores}
                    onChange={(val) => handleChange(index, "driverCores", val)}
                    size="md"
                    placeholder="4"
                  />
                  <TextInput
                    type="text"
                    label="Driver Memory"
                    showLabel={true}
                    value={item.driverMemory}
                    onChange={(val) => handleChange(index, "driverMemory", val)}
                    size="md"
                    placeholder="32g"
                  />
                </div>
              </div>

              <div>
                <label className="text-body-medium font-medium">
                  Executor Config
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2 mb-4">
                  <TextInput
                    type="text"
                    label="Executor Instances"
                    showLabel={true}
                    value={item.executorInstances}
                    onChange={(val) =>
                      handleChange(index, "executorInstances", val)
                    }
                    size="md"
                    placeholder="8"
                  />
                  <TextInput
                    type="text"
                    label="Executor Cores"
                    showLabel={true}
                    value={item.executorCores}
                    onChange={(val) =>
                      handleChange(index, "executorCores", val)
                    }
                    size="md"
                    placeholder="2"
                  />
                  <TextInput
                    type="text"
                    label="Executor Memory"
                    showLabel={true}
                    value={item.executorMemory}
                    onChange={(val) =>
                      handleChange(index, "executorMemory", val)
                    }
                    size="md"
                    placeholder="18g"
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="justify-end flex gap-2 mt-10">
        <Button variant="outline" color="primary" size="sm" label="Cancel" />
        <Button variant="solid" color="primary" size="sm" label="Submit" />
      </div>
    </div>
  )
}

export default MultipleTask
