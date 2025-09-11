import { useNavigate } from "react-router-dom"
import styles from "./Home.module.scss"
import {
  Table,
  Button,
  Breadcrumb,
  Dropdown,
  Search,
} from "@components/commons"

import { Pagination } from "@components/commons/Table"
import {
  IconDotsVertical,
  IconNotebook,
  IconStar,
  IconStarFilled,
  IconChevronDown,
  IconMessageCircle,
} from "@tabler/icons-react"
import {
  useCreateWorkspace,
  type WorkspaceItem,
} from "@context/workspace/CreateWorkspace"
import { useModal } from "@context/layout/ModalContext"
import { useQuery } from "@context/query/QueryContext"
import CreateWorkflow from "@pages/Dashboard/General/Workflow/Create"
import { useMemo, useState, useEffect  } from "react"
import { IconFolderFilled } from "@tabler/icons-react"
import { httpJupyter } from "@http/axios"
import endpoint from "@http/endpoint"
import TableSkeleton from "@components/commons/Table/TableSkeleton"

interface WorkspaceTableHomeProps {
  selectedPath: string
  setSelectedPath: (path: string) => void
}

const WorkspaceTableHome = ({
  selectedPath,
  setSelectedPath,
}: WorkspaceTableHomeProps) => {
  const navigate = useNavigate()
  const {
    filteredDirectory,
    deleteItem,
    toggleFavorite,
    filters,
    setFilters,
    addTab,
    currentPage,
    setCurrentPage,
    pageSize,
    setSelectedPath: selectedPathGlobal,
  } = useCreateWorkspace()
  const { modal, handleModal, closeModal } = useModal()
  const { openShareModal } = useQuery()

  const [sortColumn, setSortColumn] = useState("createdAt")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const [isLoading, setIsLoading] = useState(true);

  const handleSort = (columnKey: string) => {
    const direction =
      sortColumn === columnKey && sortDirection === "asc" ? "desc" : "asc"
    setSortColumn(columnKey)
    setSortDirection(direction)
  }

  const activeItems = useMemo(() => {
    let items = filteredDirectory.filter((item) => !item.isDeleted)

    if (selectedPath) {
      items = items.filter((item) => {
        if (!item.path) return false
        const itemDir = item.path.substring(0, item.path.lastIndexOf("/"))
        return itemDir === selectedPath
      })
    } else {
      items = items.filter((item) => !item.path.includes("/"))
    }

    return items
  }, [filteredDirectory, selectedPath])

  const sortedItems = useMemo(() => {
    const sorted = [...activeItems].sort((a, b) => {
      if (a.type === "folder" && b.type !== "folder") return -1
      if (a.type !== "folder" && b.type === "folder") return 1

      const aValue = a[sortColumn as keyof WorkspaceItem] as string
      const bValue = b[sortColumn as keyof WorkspaceItem] as string
      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1
      return 0
    })
    return sorted
  }, [activeItems, sortColumn, sortDirection])

  const totalRecords = sortedItems.length
  const totalPages = Math.ceil(totalRecords / pageSize)

  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    return sortedItems.slice(startIndex, endIndex)
  }, [sortedItems, currentPage, pageSize])

  const breadcrumbItems = useMemo(() => {
    const baseBreadcrumb = [
      {
        label: "Workspace",
        href: "/admin/workspace",
        onClick: () => setSelectedPath(""),
        isAction: true,
      },
      {
        label: "Users",
        href: "/admin/workspace",
        onClick: () => setSelectedPath(""),
        isAction: true,
      },
      {
        label: "user@gmail.com",
        href: "/admin/workspace",
        isActive: !selectedPath,
        onClick: () => setSelectedPath(""),
        isAction: !selectedPath ? false : true,
      },
    ]

    if (selectedPath) {
      const pathParts = selectedPath.split("/").filter(Boolean)
      let currentPath = ""

      pathParts.forEach((part, index) => {
        currentPath += (currentPath ? "/" : "") + part
        const pathToNavigate = currentPath
        baseBreadcrumb.push({
          label: part,
          href: "/admin/workspace",
          isActive: index === pathParts.length - 1,
          onClick: () => setSelectedPath(pathToNavigate),
          isAction: index === pathParts.length - 1 ? false : true,
        })
      })
    }

    return baseBreadcrumb
  }, [selectedPath, setSelectedPath])

  const columns = [
    { label: "", key: "actions_left", sortable: false },
    { label: "Name", key: "name", sortable: true },
    { label: "Type", key: "type", sortable: true },
    { label: "Owner", key: "owner", sortable: true },
    { label: "Created at", key: "createdAt", sortable: true },
    { label: "", key: "actions_right", sortable: false },
  ]

  const typeOptions = [
    {
      label: "Notebooks",
      onClick: () => setFilters((f) => ({ ...f, type: "notebooks" })),
    },
    {
      label: "Folders",
      onClick: () => setFilters((f) => ({ ...f, type: "folders" })),
    },
  ]

  const toolbarOptions = [
    { label: "Import", onClick: () => {} },
    { label: "Download as", onClick: () => {} },
    { label: "Copy URL/path", onClick: () => {} },
    { label: "Add to favorites", onClick: () => {} },
  ]

  const ownerOptions = [
    {
      label: "Me (user@gmail.com)",
      onClick: () => setFilters((f) => ({ ...f, owner: "me" })),
    },
  ]

  const lastModifiedOptions = [
    { label: "Anytime", onClick: () => {} },
    { label: "Within 24 hours", onClick: () => {} },
  ]

  const fetchFile = async (item: WorkspaceItem) => {
    try {
      const response = await httpJupyter.get(endpoint.jupyter.get_file_local, {
        params: {
          bucket: "qd-sparq",
          path: item.path,
        },
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

  const openModal = () => {
    if (modal) return closeModal()
    handleModal(<CreateWorkflow onClose={closeModal} />)
  }

  const getIcon = (type: WorkspaceItem["type"]) => {
    if (type === "folder") {
      return <IconFolderFilled size={16} />
    }
    return <IconNotebook size={16} />
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`${styles.homeContainer} overflow-x-auto`}>
      <Breadcrumb items={breadcrumbItems} />
      <div className={`${styles.header} flex-wrap`}>
        <h1 className={styles.title}>
          user@gmail.com
          {/* <IconStar size={20} /> */}
        </h1>
        <div className="ml-auto flex items-center flex-wrap justify-end gap-2">
          <Button
            variant="link"
            color="primary"
            label="Send Feedback"
            iconLeft={<IconMessageCircle size={16} />}
          />
          <Dropdown
            theme="link"
            size="md"
            showArrow={false}
            items={toolbarOptions}
            label={<IconDotsVertical size={20} />}
          />
          <Button
            variant="outline"
            color="primary"
            size="md"
            label="Share"
            onClick={openShareModal}
          />
          <Button
            variant="solid"
            color="primary"
            size="md"
            label="Create"
            onClick={() => openModal()}
          />
        </div>
      </div>
      <div className={styles.toolbar}>
        <div className="flex flex-nowrap gap-2">
          <Search
            placeholder="Search"
            sizes="sm"
            value={filters.search}
            onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
          />
          <Dropdown
            size="sm"
            theme="outline"
            showArrow={false}
            items={typeOptions}
            label={
              <>
                Type <IconChevronDown size={16} />
              </>
            }
          />
          <Dropdown
            size="sm"
            theme="outline"
            showArrow={false}
            items={ownerOptions}
            label={
              <>
                Owner <IconChevronDown size={16} />
              </>
            }
          />
          <Dropdown
            size="sm"
            theme="outline"
            showArrow={false}
            className="text-nowrap"
            items={lastModifiedOptions}
            label={
              <>
                Last modified <IconChevronDown size={16} />
              </>
            }
          />
        </div>
      </div>
      <div className={`${styles.workspaceTableHomeWrapper} overflow-x-auto`}>
        <Table.Table className="min-w-[800px]">
          <Table.TableHeader
            columns={columns}
            sortColumn={sortColumn}
            sortDirection={sortDirection}
            onSort={handleSort}
          />
          <Table.TableBody>
            {isLoading ? (
              <TableSkeleton columns={columns.length} rows={10} />
            ) : paginatedItems.length === 0 ? (
                <Table.TableRow>
                  <Table.TableCell
                    colSpan={6}
                    className="text-center text-gray-400 py-6"
                  >
                    This folder is empty
                  </Table.TableCell>
                </Table.TableRow>
              ) : (
                paginatedItems.map((item) => (
                  <Table.TableRow key={item.id} className="group">
                    <Table.TableCell>
                      <div className="flex items-center invisible group-hover:visible gap-x-2">
                        <input type="checkbox" />
                        <button onClick={() => toggleFavorite(item.id)}>
                          {item.isFavorite ? (
                            <IconStarFilled
                              size={16}
                              className="text-yellow-400"
                            />
                          ) : (
                            <IconStar size={16} />
                          )}
                        </button>
                      </div>
                    </Table.TableCell>
                    <Table.TableCell>
                      <Button
                        variant="link"
                        color="primary"
                        size="md"
                        iconLeft={getIcon(item.type)} // <-- Gunakan helper icon
                        label={item.name}
                        onClick={async () => {
                          // LOGIKA KONDISIONAL BARU
                          if (item.type === "folder") {
                            setSelectedPath(item.path) // Masuk ke folder
                          } else {
                            await fetchFile(item) // Buka file

                            const path = item.path
                              .split("/")
                              .slice(0, -1)
                              .join("/")
                            selectedPathGlobal(path)
                            navigate(`/admin/workspace/create`)
                          }
                        }}
                      />
                    </Table.TableCell>
                    <Table.TableCell>{item.type}</Table.TableCell>
                    <Table.TableCell>{item.owner}</Table.TableCell>
                    <Table.TableCell>{item.createdAt}</Table.TableCell>
                    <Table.TableCell>
                      <Dropdown
                        items={[
                          { label: "Rename", onClick: () => {} },
                          {
                            label: "Delete",
                            onClick: () => deleteItem(item.id),
                          },
                        ]}
                        theme="default"
                        size="sm"
                        showArrow={false}
                        label={<IconDotsVertical size={16} />}
                      />
                    </Table.TableCell>
                  </Table.TableRow>
                ))
              )}
          </Table.TableBody>
        </Table.Table>
      </div>
      <div className="mt-4">
        <Pagination
          currentPage={currentPage}
          pageSize={pageSize}
          totalPages={totalPages}
          totalRecords={totalRecords}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  )
}

export default WorkspaceTableHome
