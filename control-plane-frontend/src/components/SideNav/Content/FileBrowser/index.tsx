import { useMemo, useState, useRef, useEffect } from "react"
import {
  IconFolderFilled,
  IconFolderPlus,
  IconGitBranch,
  IconRefresh,
  IconSortAscending,
  IconSortDescending,
  IconUpload,
} from "@tabler/icons-react"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"

import FileIcon from "@components/FileIcon"
import { Search } from "@components/commons/Search"
import Breadcrumb, { type BreadcrumbItem } from "@components/commons/Breadcrumb"
import { Button } from "@components/commons"
import {
  useCreateWorkspace,
  type WorkspaceItem,
} from "@context/workspace/CreateWorkspace"
import { httpJupyter } from "@http/axios"
import endpoint from "@http/endpoint"
import { toast } from "react-toastify"

dayjs.extend(relativeTime)

type SortKey = "name" | "createdAt"
type SortDirection = "asc" | "desc"
type type = "browser" | "object_file"

const formatModifiedTime = (date: Date | string): string => {
  const now = dayjs()
  const time = dayjs(date)
  const seconds = now.diff(time, "second")

  if (seconds < 60) return "now"
  if (seconds < 3600) return `${now.diff(time, "minute")}m ago`
  if (seconds < 86400) return `${now.diff(time, "hour")}h ago`
  return `${now.diff(time, "day")}d ago`
}

const FileBrowser = ({ type = "browser" }: { type: type }) => {
  const {
    directory,
    getWorkspace,
    addTab,
    tabs,
    updateItem,
    deleteItem,
    activeTabId,
    setActiveTabId,
    selectedPath,
    setSelectedPath,
    createFolder,
    renameFile,
    deleteItemLocal,
  } = useCreateWorkspace()

  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [newName, setNewName] = useState("")
  const [sortKey, setSortKey] = useState<SortKey>("createdAt")
  const [sortDir, setSortDir] = useState<SortDirection>("desc")
  const [searchTerm, setSearchTerm] = useState("")
  const [contextMenu, setContextMenu] = useState<{
    visible: boolean
    x: number
    y: number
    item: WorkspaceItem | null
  }>({
    visible: false,
    x: 0,
    y: 0,
    item: null,
  })

  const fileInputRef = useRef<HTMLInputElement>(null)

  const breadcrumbItems = useMemo(() => {
    const baseItems: BreadcrumbItem[] = [
      {
        label: <IconFolderFilled size={16} />,
        onClick: () => setSelectedPath(""),
        isAction: true,
      },
    ]

    if (selectedPath) {
      let currentPath = ""
      const pathParts = selectedPath.split("/")

      pathParts.forEach((part, index) => {
        currentPath = currentPath ? `${currentPath}/${part}` : part
        const pathForOnClick = currentPath

        baseItems.push({
          label: part,
          onClick: () => setSelectedPath(pathForOnClick),
          isAction: index < pathParts.length - 1,
        })
      })
    }

    return baseItems
  }, [selectedPath, setSelectedPath])

  const handleNewFolder = async () => {
    if (type !== "browser")
      return alert("New folder creation is only available in local mode.")

    const folderName = prompt("Enter folder name:")

    if (folderName) {
      await createFolder(folderName, selectedPath)

      await getWorkspace(type)
    }
  }
  const handleRightClick = (e: React.MouseEvent, item: WorkspaceItem) => {
    e.preventDefault()
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      item,
    })
  }

  const handleRenameFromContext = () => {
    if (!contextMenu.item) return

    const index = sortedAndFilteredContent.findIndex(
      (item) => item.id === contextMenu.item?.id,
    )
    if (index !== -1) {
      setEditingIndex(index)
      setNewName(contextMenu.item.name)
    }
    setContextMenu({ visible: false, x: 0, y: 0, item: null })
  }

  const handleDeleteFromContext = async () => {
    if (!contextMenu.item) return

    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${contextMenu.item.name}"?`,
    )

    if (confirmDelete) {
      try {
        if (type === "browser") {
          await deleteItemLocal(contextMenu.item.path)

          if (selectedPath && selectedPath.startsWith(contextMenu.item.path)) {
            const parentPath = contextMenu.item.path.substring(
              0,
              contextMenu.item.path.lastIndexOf("/"),
            )
            setSelectedPath(parentPath)
          }

          await getWorkspace(type)
          toast.success("File deleted successfully!")
        } else {
          deleteItem(contextMenu.item.id)
        }
      } catch (error) {
        console.error("Delete failed:", error)
        toast.error("Failed to delete file")
      }
    }
    setContextMenu({ visible: false, x: 0, y: 0, item: null })
  }

  const handleClickOutside = () => {
    if (contextMenu.visible) {
      setContextMenu({ visible: false, x: 0, y: 0, item: null })
    }
  }

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = event.target.files
    if (!files) return

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const formData = new FormData()

        formData.append("file", file)
        formData.append("path", selectedPath || "")

        const endpointPath = endpoint.jupyter.upload

        await httpJupyter.post(endpointPath, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
      }

      await getWorkspace(type)

      const newData: WorkspaceItem = {
        id: selectedPath
          ? `api-${selectedPath}/${files[0].name}`
          : `api-${files[0].name}`,
        path: selectedPath ? `${selectedPath}/${files[0].name}` : files[0].name,
        name: files[0].name,
        type: "notebook",
        owner: "farhan@gmail.com",
        createdAt: new Date().toISOString(),
        content: [],
      }

      fetchFile(newData, type)

      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }

      toast.success("File uploaded successfully!")
    } catch (error) {
      console.error("File upload failed:", error)
    }
  }

  const toggleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"))
    } else {
      setSortKey(key)
      setSortDir("asc")
    }
  }

  const fetchFile = async (item: WorkspaceItem, type: type) => {
    try {
      const endpointPath =
        type === "object_file"
          ? endpoint.jupyter.get_file_s3
          : endpoint.jupyter.get_file_local

      const params =
        type === "object_file"
          ? { bucket: "qd-sparq", key: item.path }
          : { path: item.path }

      const response = await httpJupyter.get(endpointPath, {
        params,
      })

      const fileContent = JSON.parse(response.data.content)

      const cells = fileContent.cells.map((cell: any) => ({
        id: crypto.randomUUID(),
        content: Array.isArray(cell.source)
          ? cell.source.join("")
          : cell.source,
        output: "",
        outputs: cell.outputs || [],
      }))

      addTab({ id: item.id, name: item.name, content: cells })
    } catch (error) {
      console.error("Fetch file failed:", error)
    }
  }

  // const handleDoubleClick = (index: number, currentName: string) => {
  //   setEditingIndex(index)
  //   setNewName(currentName)
  // }

  const handleRename = async (index: number) => {
    const itemToRename = sortedAndFilteredContent[index]
    if (itemToRename && itemToRename.name !== newName) {
      try {
        if (type === "browser") {
          const newPath = `${selectedPath}/${newName}`
          await renameFile(itemToRename.path, newPath)

          // Update selectedPath if current path or its parent was renamed
          if (selectedPath && selectedPath.startsWith(itemToRename.path)) {
            const newSelectedPath = selectedPath.replace(
              itemToRename.path,
              newPath,
            )
            setSelectedPath(newSelectedPath)
          }

          await getWorkspace(type)
          toast.success("File renamed successfully!")
        } else {
          updateItem(itemToRename.id, newName)
        }
      } catch (error) {
        console.error("Rename failed:", error)
        toast.error("Failed to rename file")
      }
    }
    setEditingIndex(null)
    setNewName("")
  }

  const sortedAndFilteredContent = useMemo(() => {
    let items = directory || []

    if (selectedPath) {
      items = items.filter((item) => {
        if (!item.path) return false
        const itemDir = item.path.substring(0, item.path.lastIndexOf("/"))
        const isDirectChild = itemDir === selectedPath
        const isRootChildInRootPath =
          selectedPath === "" && !item.path.includes("/")
        return isDirectChild || isRootChildInRootPath
      })
    } else {
      items = items.filter((item) => item.path && !item.path.includes("/"))
    }

    const filteredBySearch = items.filter((item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()),
    )

    return [...filteredBySearch].sort((a, b) => {
      if (a.type === "folder" && b.type !== "folder") return -1
      if (a.type !== "folder" && b.type === "folder") return 1

      const aValue = a[sortKey]
      const bValue = b[sortKey]
      if (aValue < bValue) return sortDir === "asc" ? -1 : 1
      if (aValue > bValue) return sortDir === "asc" ? 1 : -1
      return 0
    })
  }, [directory, selectedPath, searchTerm, sortKey, sortDir])

  const itemAlreadyExists = (name: string): boolean => {
    return tabs.some((tab) => tab.name === name)
  }

  const activeTab = (name: string) => {
    const currentTab = tabs.find((tab) => tab.name === name)
    return currentTab && currentTab.id === activeTabId
  }

  useEffect(() => {
    getWorkspace(type)
  }, [type])
  useEffect(() => {
    document.addEventListener("click", handleClickOutside)
    return () => {
      document.removeEventListener("click", handleClickOutside)
    }
  }, [contextMenu.visible])
  return (
    <div className="text-sm font-sans w-full max-w-md">
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleFileUpload}
        multiple
        accept=".ipynb"
      />

      {type === "browser" && (
        <div className="flex items-center w-full gap-4 mb-3">
          <Button
            variant="link"
            color="default"
            size="sm"
            showLabel={false}
            iconLeft={<IconFolderPlus size={18} />}
            onClick={handleNewFolder}
            title="New Folder"
          />
          <Button
            variant="link"
            color="default"
            size="sm"
            showLabel={false}
            iconLeft={<IconUpload size={18} />}
            title="Upload Files"
            onClick={() => fileInputRef.current?.click()}
          />
          <Button
            variant="link"
            color="default"
            size="sm"
            showLabel={false}
            iconLeft={<IconRefresh size={18} />}
            title="Refresh the file browser"
            onClick={() => getWorkspace(type)}
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
      )}

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
          {sortKey === "name" &&
            (sortDir === "asc" ? (
              <IconSortAscending size={16} />
            ) : (
              <IconSortDescending size={16} />
            ))}
        </span>
        <span
          className="flex items-center align-middle w-24 justify-end cursor-pointer flex-shrink-0"
          onClick={() => toggleSort("createdAt")}
        >
          Modified{" "}
          {sortKey === "createdAt" &&
            (sortDir === "asc" ? (
              <IconSortAscending size={16} />
            ) : (
              <IconSortDescending size={16} />
            ))}
        </span>
      </div>

      <ul className="ml-2 space-y-1">
        {sortedAndFilteredContent.map((item, index) => (
          <li
            key={item.path}
            className={`group flex justify-between items-center px-2 py-1 hover:bg-gray-100 rounded ${
              activeTab(item.name) ? "bg-gray-100" : ""
            }`}
            onContextMenu={(e) => handleRightClick(e, item)}
          >
            <div className="flex items-center gap-2 truncate flex-1 min-w-0">
              <div className="flex-none w-5 h-5 flex items-center justify-center">
                <FileIcon type={item.type} />
              </div>
              <div className="truncate max-w-[300px]">
                {editingIndex === index ? (
                  <input
                    className="border px-1 text-sm w-full"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    onBlur={() => handleRename(index)}
                    onKeyDown={(e) => e.key === "Enter" && handleRename(index)}
                    autoFocus
                  />
                ) : (
                  <span
                    className="truncate block cursor-pointer"
                    onClick={() => {
                      if (item.type === "folder") {
                        setSelectedPath(item.path)
                        return
                      }
                      if (!itemAlreadyExists(item.name)) {
                        if (item.type === "notebook") {
                          fetchFile(item, type)
                        } else {
                          addTab({
                            id: item.id,
                            name: item.name,
                            content: [
                              {
                                id: "cell-1",
                                type: "code",
                                content: `Content for ${item.name}`,
                              },
                            ],
                          })
                        }
                      } else {
                        const existingTab = tabs.find(
                          (t) => t.name === item.name,
                        )
                        if (existingTab) setActiveTabId(existingTab.id)
                      }
                    }}
                  >
                    {item.name}
                  </span>
                )}
              </div>
            </div>

            <div className="ml-2 text-xs text-gray-500 whitespace-nowrap">
              {formatModifiedTime(item.createdAt)}
            </div>
          </li>
        ))}
      </ul>
      {contextMenu.visible && (
        <div
          className="fixed bg-white border border-gray-300 rounded-md shadow-lg py-1 z-50"
          style={{
            left: contextMenu.x,
            top: contextMenu.y,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
            onClick={handleRenameFromContext}
          >
            Rename
          </button>
          <button
            className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 text-red-600"
            onClick={handleDeleteFromContext}
          >
            Delete
          </button>
        </div>
      )}
    </div>
  )
}

export default FileBrowser
