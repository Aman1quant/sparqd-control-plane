import React from "react"

type Props = {
  open: boolean
  onClose: () => void
}

const SearchModal: React.FC<Props> = ({ open, onClose }) => {
  if (!open) return null
  return (
    <div
      className="fixed inset-0 bg-black/20 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-lg w-[400px] p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <input
          autoFocus
          placeholder="Search data..."
          className="w-full border px-3 py-2 rounded"
        />
      </div>
    </div>
  )
}

export default SearchModal
