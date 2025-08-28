import { useEffect, useState } from "react"
import { v4 as uuid } from "uuid"
import {
  IconFolderFilled,
  IconFolderPlus,
  IconGitBranch,
  IconPlus,
  IconRefresh,
  IconSortAscending,
  IconSortDescending,
  IconUpload,
} from "@tabler/icons-react"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"

import FileIcon from "@components/FileIcon"
import { Search } from "@components/commons/Search"
import Breadcrumb from "@components/commons/Breadcrumb"
import { Button } from "@components/commons"
import { useCreateWorkspace } from "@context/workspace/CreateWorkspace"

import { data } from "./data"

dayjs.extend(relativeTime)

type FileItem = {
  name: string
  type: "folder" | "ipynb" | "py" | "markdown"
  updatedAt: string | Date
}

type SortKey = "name" | "updatedAt"
type SortDirection = "asc" | "desc"

const formatModifiedTime = (date: Date | string): string => {
  const now = dayjs()
  const time = dayjs(date)
  const seconds = now.diff(time, "second")

  if (seconds < 60) return "now"
  if (seconds < 3600) return `${now.diff(time, "minute")}m ago`
  if (seconds < 86400) return `${now.diff(time, "hour")}h ago`
  return `${now.diff(time, "day")}d ago`
}

const FileBrowser = ({}: {}) => {
  const breadcrumbItems = [
    {
      label: <IconFolderFilled size={16} />,
      href: "/admin/workspace",
      isActive: false,
    },
    { label: "", isActive: true },
  ]

  const {
    directoryContent,
    updateDirectoryContent,
    addTab,
    tabs,
    activeTabId,
  } = useCreateWorkspace()

  const [fileItems, setFileItems] = useState<FileItem[]>([
    {
      name: "data",
      type: "folder",
      updatedAt: dayjs().subtract(7, "day").toDate(),
    },
    {
      name: "notebooks",
      type: "folder",
      updatedAt: dayjs().subtract(7, "day").toDate(),
    },
    {
      name: "README.md",
      type: "markdown",
      updatedAt: dayjs().subtract(7, "day").toDate(),
    },
    {
      name: "sample_notebook.ipynb",
      type: "ipynb",
      updatedAt: dayjs().subtract(1, "day").toDate(),
    },
    {
      name: "untitled1.py",
      type: "py",
      updatedAt: dayjs().subtract(21, "hour").toDate(),
    },
  ])

  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [newName, setNewName] = useState("")
  const [sortKey, setSortKey] = useState<SortKey>("name")
  const [sortDir, setSortDir] = useState<SortDirection>("asc")
  const [searchTerm, setSearchTerm] = useState("")

  const handleNewFolder = () => {
    const baseName = "Untitled Folder"
    let counter = 0
    let newName = baseName
    const existingNames = fileItems.map((item) => item.name)

    while (existingNames.includes(newName)) {
      counter += 1
      newName = `${baseName}${counter}`
    }

    const newFolder: FileItem = {
      name: newName,
      type: "folder",
      updatedAt: new Date(),
    }

    setFileItems((prev) => [...prev, newFolder])
  }

  const toggleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"))
    } else {
      setSortKey(key)
      setSortDir("asc")
    }
  }

  // const sortedItems = [...fileItems].sort((a, b) => {
  //   let aVal = a[sortKey]
  //   let bVal = b[sortKey]

  //   if (sortKey === "updatedAt") {
  //     aVal = new Date(aVal)
  //     bVal = new Date(bVal)
  //   }

  //   if (aVal < bVal) return sortDir === "asc" ? -1 : 1
  //   if (aVal > bVal) return sortDir === "asc" ? 1 : -1
  //   return 0
  // })

  // const filteredItems = sortedItems.filter((item) =>
  //   item.name.toLowerCase().includes(searchTerm.toLowerCase()),
  // )

  const parseHTMLTable = (htmlString: string): any[] => {
    const parser = new DOMParser()
    const doc = parser.parseFromString(htmlString, "text/html")
    const table = doc.querySelector("table")
    const rows = table?.querySelectorAll("tr")

    if (!table || !rows || rows.length < 2) return []

    const headers = Array.from(rows[0].querySelectorAll("th")).map(
      (th) => th.textContent?.trim() || "",
    )

    const data = Array.from(rows)
      .slice(1)
      .map((row) => {
        const cells = Array.from(row.querySelectorAll("td"))
        const obj: Record<string, string> = {}
        cells.forEach((cell, i) => {
          obj[headers[i] || `col${i}`] = cell.textContent?.trim() || ""
        })
        return obj
      })

    return data
  }
  const fetchFile = async (path: string, name: string) => {
    try {
      const response = await fetch(`/file/${path}`)
      const fileContent = await response.json()

      const cells = fileContent.cells.map((cell: any) => {
        const outputs = cell.outputs || []

        let parsedTableData: any[] = []

        for (const output of outputs) {
          let html = output.data?.["text/html"]

          if (Array.isArray(html)) {
            html = html.join("")
          }

          if (typeof html === "string" && html.includes("<table")) {
            parsedTableData = parseHTMLTable(html)

            break
          }
        }

        return {
          id: crypto.randomUUID(),
          content: cell.source?.join("") || "",
          output: "",
          outputs,
          data: parsedTableData.length ? parsedTableData : undefined,
        }
      })

      addTab({
        id: uuid(),
        name,
        content: cells,
      })
    } catch (error) {
      console.error("Fetch file failed:", error)
      throw error
    }
  }
  const handleDoubleClick = (index: number, currentName: string) => {
    setEditingIndex(index)
    setNewName(currentName)
  }

  const handleRename = () => {
    if (editingIndex !== null) {
      const updated = [...fileItems]
      updated[editingIndex] = {
        ...updated[editingIndex],
        name: newName,
      }
      setFileItems(updated)
      setEditingIndex(null)
      setNewName("")
    }
  }

  const itemAlreadyExists = (name: string): boolean => {
    const findTab = tabs.find(
      (tab) => tab.name === name && tab.id === activeTabId,
    )
    if (findTab) return true
    return false
  }

  useEffect(() => {
    updateDirectoryContent(data)
  }, [])

  return (
    <div className="text-sm font-sans w-full max-w-md">
      <div className="flex items-center w-full gap-4 mb-3">
        <Button
          variant="solid"
          color="primary"
          size="sm"
          showLabel={false}
          iconLeft={<IconPlus size={16} />}
          title="New Launcher"
        />
        <Button
          variant="link"
          color="default"
          size="sm"
          showLabel={false}
          iconLeft={<IconFolderPlus size={18} />}
          onClick={() => handleNewFolder()}
          title="New Folder"
        />
        <Button
          variant="link"
          color="default"
          size="sm"
          showLabel={false}
          iconLeft={<IconUpload size={18} />}
          title="Upload Files"
        />
        <Button
          variant="link"
          color="default"
          size="sm"
          showLabel={false}
          iconLeft={<IconRefresh size={18} />}
          title="Refresh the file browser"
        />
        <Button
          variant="link"
          color="default"
          size="sm"
          showLabel={false}
          iconLeft={<IconGitBranch size={18} />}
          title="Git"
        />
      </div>

      <Search
        placeholder="Filter files by name"
        sizes="sm"
        type="default"
        className="mb-4"
        value={searchTerm}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setSearchTerm(e.target.value)
        }
      />

      <div className="px-1 mt-2 mb-4">
        <Breadcrumb items={breadcrumbItems} />
      </div>

      <div className="flex justify-between font-medium px-2 py-1 text-xs uppercase text-black-500 border-b border-gray-300">
        <span
          className="flex items-center align-middle cursor-pointer gap-x-1"
          onClick={() => toggleSort("name")}
        >
          Name{" "}
          {sortKey === "name" ? (
            sortDir === "asc" ? (
              <IconSortAscending size={16} />
            ) : (
              <IconSortDescending size={16} />
            )
          ) : (
            ""
          )}
        </span>
        <span
          className="flex items-center align-middle w-20 text-right cursor-pointer"
          onClick={() => toggleSort("updatedAt")}
        >
          Modified{" "}
          {sortKey === "updatedAt" ? (
            sortDir === "asc" ? (
              <IconSortAscending size={16} />
            ) : (
              <IconSortDescending size={16} />
            )
          ) : (
            ""
          )}
        </span>
      </div>

      <ul className="ml-2 space-y-1">
        {(directoryContent?.content ?? []).map((item, index) => (
          <li
            key={index}
            className={`flex justify-between items-center py-1 px-1 hover:bg-gray-50 rounded 
              
              ${itemAlreadyExists(item.name) ? "bg-gray-100" : ""}`}
          >
            <span className="flex-1 flex items-center gap-x-2">
              <FileIcon type={item.type} />
              {editingIndex === index ? (
                <input
                  className="border px-1 text-sm"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onBlur={handleRename}
                  onKeyDown={(e) => e.key === "Enter" && handleRename()}
                  autoFocus
                />
              ) : (
                <span
                  className="truncate"
                  onDoubleClick={() => handleDoubleClick(index, item.name)}
                  onClick={() => {
                    if (!itemAlreadyExists(item.name)) {
                      fetchFile(item.path, item.name)
                    }
                  }}
                >
                  {item.name}
                </span>
              )}
            </span>
            <span className="truncate w-20 text-right text-black-500 text-xs">
              {formatModifiedTime(item.last_modified)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default FileBrowser
