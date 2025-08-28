import React from "react"

interface PaginationProps {
  currentPage: number
  totalPages: number
  totalRecords: number
  onPageChange: (page: number) => void
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalRecords,
  onPageChange,
}) => {
  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1)
    }
  }

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1)
    }
  }

  const renderPageNumbers = () => {
    const pages = []
    const startPage = Math.max(1, currentPage - 1)
    const endPage = Math.min(totalPages, currentPage + 1)

    if (startPage > 1) {
      pages.push(
        <a
          key={1}
          href="#"
          onClick={() => onPageChange(1)}
          className={`relative inline-flex items-center px-4 py-2 text-sm ${
            currentPage === 1
              ? "bg-primary text-white"
              : "text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
          }`}
        >
          1
        </a>,
      )
      if (startPage > 2) {
        pages.push(
          <span key="start-ellipsis" className="px-2">
            ...
          </span>,
        )
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <a
          key={i}
          href="#"
          onClick={() => onPageChange(i)}
          className={`relative inline-flex items-center px-4 py-2 text-sm ${
            i === currentPage
              ? "bg-primary text-white"
              : "text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
          }`}
        >
          {i}
        </a>,
      )
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(
          <span key="end-ellipsis" className="px-2">
            ...
          </span>,
        )
      }
      pages.push(
        <a
          key={totalPages}
          href="#"
          onClick={() => onPageChange(totalPages)}
          className={`relative inline-flex items-center px-4 py-2 text-sm  ${
            currentPage === totalPages
              ? "bg-primary text-white"
              : "text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
          }`}
        >
          {totalPages}
        </a>,
      )
    }

    return pages
  }

  return (
    <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
      <div className="flex flex-1 justify-between sm:hidden">
        <a
          href="#"
          onClick={handlePrevious}
          className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm  text-gray-700 hover:bg-gray-50"
        >
          Previous
        </a>
        <a
          href="#"
          onClick={handleNext}
          className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm  text-gray-700 hover:bg-gray-50"
        >
          Next
        </a>
      </div>
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-700">
            Showing
            <span> {(currentPage - 1) * 10 + 1} </span>
            to
            <span> {Math.min(currentPage * 10, totalRecords)} </span>
            of
            <span> {totalRecords} </span>
            results
          </p>
        </div>
        <div>
          <nav
            className="isolate inline-flex -space-x-px rounded-md shadow-sm"
            aria-label="Pagination"
          >
            <a
              href="#"
              onClick={handlePrevious}
              className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
            >
              <span className="sr-only">Previous</span>
              <svg
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M11.78 5.22a.75.75 0 0 1 0 1.06L8.06 10l3.72 3.72a.75.75 0 1 1-1.06 1.06l-4.25-4.25a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Z"
                  clipRule="evenodd"
                />
              </svg>
            </a>
            {renderPageNumbers()}
            <a
              href="#"
              onClick={handleNext}
              className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
            >
              <span className="sr-only">Next</span>
              <svg
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z"
                  clipRule="evenodd"
                />
              </svg>
            </a>
          </nav>
        </div>
      </div>
    </div>
  )
}

export default Pagination
