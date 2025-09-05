import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { useCatalog, type CatalogTreeItem } from "@context/catalog/CatalogContext";
import { IconDatabase } from "@tabler/icons-react"
import DescriptionBox from "../DescriptionBox"
import MetadataSidebar from "../MetadataSidebar"
import styles from "../CatalogDetail.module.scss"

import { Button, Table, Tabs, Search } from "@components/commons"
import TableSkeleton from "@components/commons/Table/TableSkeleton";

const SchemaDetailView = ({ item, catalogName }: { item: any; catalogName: string }) => {
  const { getTablesForSchema, openEditModal, loadingNodes } = useCatalog();
  const [filter, setFilter] = useState("");
  const tables = getTablesForSchema(catalogName, item.name);
  
  const [sortColumn, setSortColumn] = useState<keyof CatalogTreeItem>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const isLoading = loadingNodes.has(item.id);

  const handleSort = (columnKey: string) => {
    const key = columnKey as keyof CatalogTreeItem;
    const direction = sortColumn === key && sortDirection === "asc" ? "desc" : "asc";
    setSortColumn(key);
    setSortDirection(direction);
  };

  const filteredTables = useMemo(() => {
    if (!filter) return tables;
    return tables.filter((t) =>
      t.name.toLowerCase().includes(filter.toLowerCase())
    );
  }, [filter, tables]);

  const sortedTables = useMemo(() => {
    return [...filteredTables].sort((a, b) => {
      const aValue = a[sortColumn] || "";
      const bValue = b[sortColumn] || "";
      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredTables, sortColumn, sortDirection]);

  const columns = [
    { label: "Name", key: "name", sortable: true },
    { label: "Type", key: "type", sortable: true },
  ];

  const tabItems = [
    { label: "Overview" },
    { label: "Details"},
    { label: "Permissions", disabled: true},
  ]

  return (
    <div className="h-full">
      <div className={styles.header}>
        <IconDatabase size={32} />
        <h1 className={styles.title}>{item.name}</h1>
        {/* <IconStar size={20} /> */}
        <div className="ml-auto">
          <Button disabled label="Create table" />
        </div>
      </div>
      <Tabs
        className="h-full"
        items={tabItems}
        renderContent={(activeTab) => {
          if (activeTab === "Overview") {
            return (
              <div className="flex h-full">
                <div className={`flex-1 min-h-0 overflow-y-auto ${styles.content}`}>
                  <DescriptionBox
                    description={item.description}
                    onEdit={() => openEditModal(item)}
                  />
                  <Search
                    placeholder="Filter tables"
                    className="max-w-xs"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                  />
                  <div className="mt-4">
                    <Table.Table>
                      <Table.TableHeader
                        columns={columns}
                        sortColumn={sortColumn}
                        sortDirection={sortDirection}
                        onSort={handleSort}
                      />
                      <Table.TableBody>
                        {isLoading ? (
                          <TableSkeleton columns={columns.length} rows={5} />
                        ) : sortedTables.length > 0 ? (
                          sortedTables.map((t) => (
                            <Table.TableRow key={t.name}>
                              <Table.TableCell>
                                <Link
                                  to={`/admin/catalog/${catalogName}/${item.name}/${t.name}`}
                                  className="text-primary hover:underline"
                                >
                                  {t.name}
                                </Link>
                              </Table.TableCell>
                              <Table.TableCell>{t.type}</Table.TableCell>
                            </Table.TableRow>
                          ))
                        ) : (
                          <Table.TableRow>
                            <Table.TableCell colSpan={columns.length} className="text-center">
                              No tables found.
                            </Table.TableCell>
                          </Table.TableRow>
                        )}
                      </Table.TableBody>
                    </Table.Table>
                  </div>
                  <div className="xl:hidden mt-5 p-2 xl:p-0 xl:mt-0">
                    <MetadataSidebar item={item} />
                  </div>
                </div>
                <div className="hidden xl:block">
                  <MetadataSidebar item={item} />
                </div>
              </div>
            )
          }
          if (activeTab === "Details") {
            return (
              <div className={styles.content}>
                <div className="max-w-2xl space-y-4">
                  <div>
                    <h3 className="text-base font-semibold mb-2">
                      About this schema
                    </h3>
                    <div className="flex flex-col gap-0">
                      <div className="flex">
                        <div className="bg-gray-100 p-2 min-w-[140px] border">
                          <span>Metastore Id</span>
                        </div>
                        <div className="bg-white border p-2 flex-1">
                          <span>M54797796-fea1-4b33-ac28-af405e59cc52</span>
                        </div>
                      </div>
                      <div className="flex">
                        <div className="bg-gray-100 p-2 min-w-[140px] border">
                          <span>Created at</span>
                        </div>
                        <div className="bg-white border p-2 flex-1">
                          <span>Jul 15, 2025, 03:46 PM</span>
                        </div>
                      </div>
                      <div className="flex">
                        <div className="bg-gray-100 p-2 min-w-[140px] border">
                          <span>Created by</span>
                        </div>
                        <div className="bg-white border p-2 flex-1">
                          <span>John Doe</span>
                        </div>
                      </div>
                      <div className="flex">
                        <div className="bg-gray-100 p-2 min-w-[140px] border">
                          <span>Updated at</span>
                        </div>
                        <div className="bg-white border p-2 flex-1">
                          <span>Jul 15, 2025, 03:46 PM</span>
                        </div>
                      </div>
                      <div className="flex">
                        <div className="bg-gray-100 p-2 min-w-[140px] border">
                          <span>Updated by</span>
                        </div>
                        <div className="bg-white border p-2 flex-1">
                          <span>John Doe</span>
                        </div>
                      </div>
                      <div className="flex">
                        <div className="bg-gray-100 p-2 min-w-[140px] border">
                          <span>Storage root</span>
                        </div>
                        <div className="bg-white border p-2 flex-1">
                          <span>Default Storage</span>
                        </div>
                      </div>
                      <div className="flex">
                        <div className="bg-gray-100 p-2 min-w-[140px] border">
                          <span>Storage location</span>
                        </div>
                        <div className="bg-white border p-2 flex-1">
                          <span>Default Location</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          }
          return <div className={styles.content}>Content for {activeTab}</div>
        }}
      />
    </div>
  )
}

export default SchemaDetailView