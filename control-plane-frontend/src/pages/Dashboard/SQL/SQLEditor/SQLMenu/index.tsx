import { useState } from "react"
import { BiChevronDown, BiChevronRight, BiRefresh } from "react-icons/bi"
import { FiDatabase, FiSearch } from "react-icons/fi"
import { IoClose } from "react-icons/io5"
import { sections } from "./data"

const SQLMenu = () => {
  const [openSection, setOpenSection] = useState<string | null>(
    "My Organisation",
  )
  const [searchQuery, setSearchQuery] = useState("")
  const [display, setDisplay] = useState(true)

  return (
    <div
      className={`w-[240px] bg-white border-r h-full overflow-auto ${display ? "" : "hidden"}`}
    >
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <h2 className="font-bold text-lg">SQL</h2>
        <div className="flex items-center">
          <button className="mr-2 hover:bg-gray-100 p-1 rounded">
            <BiRefresh className="text-gray-600 text-lg" />
          </button>
          <button
            className="hover:bg-gray-100 p-1 rounded"
            onClick={() => setDisplay(false)}
          >
            <IoClose className="text-gray-600 text-lg" />
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-2">
        <div className="relative">
          <FiSearch className="absolute left-3 top-2.5 text-gray-400" />
          <input
            type="text"
            placeholder="Type to search"
            className="w-full pl-9 pr-3 py-2 rounded-md border text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 px-2 mb-4">
        <button className="px-3 py-1 text-sm rounded-full bg-blue-50 text-blue-600">
          For you
        </button>
        <button className="px-3 py-1 text-sm rounded-full text-gray-600">
          All
        </button>
      </div>

      {/* Sections */}
      {sections.map((section) => (
        <div key={section.title}>
          <div
            className="flex items-center px-2 py-1 cursor-pointer"
            onClick={() =>
              setOpenSection(
                openSection === section.title ? null : section.title,
              )
            }
          >
            {openSection === section.title ? (
              <BiChevronDown className="mr-1" />
            ) : (
              <BiChevronRight className="mr-1" />
            )}
            <span className="text-sm text-gray-600">{section.title}</span>
          </div>
          {openSection === section.title && (
            <div className="ml-4">
              {section.databases.map((db) => (
                <div
                  key={db.name}
                  className="flex items-center px-2 py-1 text-sm hover:bg-gray-50 cursor-pointer"
                >
                  <FiDatabase className="mr-2 text-gray-400" />
                  <span className="text-gray-700">{db.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export default SQLMenu
