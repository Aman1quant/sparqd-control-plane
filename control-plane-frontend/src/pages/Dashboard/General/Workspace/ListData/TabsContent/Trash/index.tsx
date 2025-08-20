import styles from "../Home/Home.module.scss";
import { Pagination } from "@components/commons/Table";
import { Table } from "@components/commons";
import Dropdown from "@components/commons/Dropdown";
import { IconDotsVertical, IconNotebook } from "@tabler/icons-react";
import { useCreateWorkspace, type WorkspaceItem } from "@context/workspace/CreateWorkspace"
import { useMemo, useState } from "react";

const WorkspaceTableTrash = () => {
  const { directory, restoreItem, currentPage, setCurrentPage, pageSize } = useCreateWorkspace();
  
  const [sortColumn, setSortColumn] = useState("createdAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const handleSort = (columnKey: string) => {
    const direction = sortColumn === columnKey && sortDirection === "asc" ? "desc" : "asc";
    setSortColumn(columnKey);
    setSortDirection(direction);
  };

  const trashItems = useMemo(() => 
    directory.filter(item => item.isDeleted),
    [directory]
  );
  
  const sortedItems = useMemo(() => {
    return [...trashItems].sort((a, b) => {
      const aValue = a[sortColumn as keyof WorkspaceItem] as string;
      const bValue = b[sortColumn as keyof WorkspaceItem] as string;
      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [trashItems, sortColumn, sortDirection]);

  const totalRecords = sortedItems.length;
  const totalPages = Math.ceil(totalRecords / pageSize);

  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return sortedItems.slice(startIndex, endIndex);
  }, [sortedItems, currentPage, pageSize]);

  const columns = [
    { label: "Name", key: "name", sortable: true },
    { label: "Type", key: "type", sortable: true },
    { label: "Owner", key: "owner", sortable: true },
    { label: "Created at", key: "createdAt", sortable: true },
    { label: "", key: "actions", sortable: false },
  ];

  return (
    <div>
      <label className="text-black text-heading-6 font-medium px-3">
        Trash
      </label>
      <hr className="my-4" />
      <div className={styles.workspaceTableHomeWrapper}>
        <Table.Table className="w-full">
          <Table.TableHeader 
            columns={columns} 
            sortColumn={sortColumn}
            sortDirection={sortDirection}
            onSort={handleSort}
          />
          <Table.TableBody>
            {paginatedItems.length === 0 ? (
              <Table.TableRow>
                <Table.TableCell
                  colSpan={5}
                  className="text-center text-gray-400"
                >
                  Trash is empty
                </Table.TableCell>
              </Table.TableRow>
            ) : (
              paginatedItems.map((item) => (
                <Table.TableRow key={item.id}>
                  <Table.TableCell>
                    <div className="flex items-center gap-2">
                      <IconNotebook size={16} />
                      <span>{item.name}</span>
                    </div>
                  </Table.TableCell>
                  <Table.TableCell>{item.type}</Table.TableCell>
                  <Table.TableCell>{item.owner}</Table.TableCell>
                  <Table.TableCell>{item.createdAt}</Table.TableCell>
                  <Table.TableCell>
                    <Dropdown
                      items={[{ label: "Restore", onClick: () => restoreItem(item.id) }]}
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
  );
};

export default WorkspaceTableTrash;