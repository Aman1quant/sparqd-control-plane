import Modal from "@components/commons/Modal"
import { Button } from "@components/commons"
import styles from "./CreateModal.module.scss"
import { useState } from "react"
import { useNavigate } from "react-router-dom"

const options = [
  {
    id: "data-engineering",
    title: "Data Engineering (CPU)",
    description: "PySpark Notebooks | Karpenter AutoScaling",
    imageOptions: ["qdsparq/jupyter-pyspark-delta"],
  },
  {
    id: "small-notebook",
    title: "Small Notebook (Test)",
    description: "Minimal resource notebook | t3 | jupyter-small node group",
    imageOptions: ["PySpark 3.5.3 with S3 Tables support"],
  },
  {
    id: "memory-optimized",
    title: "Memory Optimized Notebook",
    description: "Memory optimized notebook | 2 vCPUs - 16G RAM",
    imageOptions: ["qdsparq/jupyter-pyspark-delta"],
  },
]

const CreateModalWorkspace = ({
  isOpen,
  handleCloseModal,
}: {
  isOpen: boolean
  handleCloseModal: () => void
}) => {
  const navigate = useNavigate()

  const [selectedOption, setSelectedOption] = useState("memory-optimized")
  const [selectedImage, setSelectedImage] = useState(
    "qdsparq/jupyter-pyspark-delta",
  )

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCloseModal}
      title="Select Server Options"
      footer={
        <>
          <Button
            variant="outline"
            color="primary"
            size="sm"
            label="Cancel"
            onClick={handleCloseModal}
          />
          <Button
            variant="solid"
            color="primary"
            size="sm"
            label="Start"
            onClick={() => {
              handleCloseModal()
              navigate("/admin/workspace/create")
            }}
          />
        </>
      }
    >
      <div className={styles.optionList}>
        {options.map((opt) => (
          <label key={opt.id} className={styles.optionItem}>
            <input
              type="radio"
              name="notebookType"
              value={opt.id}
              checked={selectedOption === opt.id}
              onChange={() => {
                setSelectedOption(opt.id)
                setSelectedImage(opt.imageOptions[0])
              }}
            />
            <div>
              <div className={styles.optionTitle}>{opt.title}</div>
              <div className={styles.optionDescription}>{opt.description}</div>
              <div className="flex items-baseline align-middle mt-2">
                <span className="text-body-medium mr-2">Image:</span>
                <select
                  className={styles.dropdown}
                  value={selectedImage}
                  onChange={(e) => setSelectedImage(e.target.value)}
                >
                  {opt.imageOptions.map((img) => (
                    <option key={img} value={img}>
                      {img}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </label>
        ))}
      </div>
    </Modal>
  )
}

export default CreateModalWorkspace
