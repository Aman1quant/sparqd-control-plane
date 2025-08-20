import { IconPencil } from "@tabler/icons-react"

interface DescriptionBoxProps {
  description?: string
  onEdit: () => void
}

const DescriptionBox = ({ description, onEdit }: DescriptionBoxProps) => {
  return (
    <div className="mb-6 p-4 border rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-gray-700">Description</h3>
        <button
          onClick={onEdit}
          className="p-1 text-gray-500 hover:text-gray-800"
        >
          <IconPencil size={18} />
        </button>
      </div>
      <p className="text-sm text-gray-600">
        {description || "No description provided. Click the pencil to add one."}
      </p>
    </div>
  )
}

export default DescriptionBox
