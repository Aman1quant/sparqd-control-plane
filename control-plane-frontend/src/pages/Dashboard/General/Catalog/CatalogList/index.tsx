import { useState, useMemo, useEffect } from "react"
import { Link } from "react-router-dom"
import { IconBox, IconChevronRight, IconPlus } from "@tabler/icons-react"
import { Table, Button, Dropdown, Tabs, Search } from "@components/commons"
import { useCatalog, type ICatalogListItem } from "@context/catalog/CatalogContext";
import TableSkeleton from "@components/commons/Table/TableSkeleton";

const CatalogList = () => {
  const { catalogListData, selectCatalog } = useCatalog()
  const [activeTab, setActiveTab] = useState("Recents");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortColumn, setSortColumn] = useState<keyof ICatalogListItem>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [isLoading, setIsLoading] = useState(true);

  const handleSort = (columnKey: string) => {
    const key = columnKey as keyof ICatalogListItem;
    const direction = sortColumn === key && sortDirection === "asc" ? "desc" : "asc";
    setSortColumn(key);
    setSortDirection(direction);
  };

  const columns = [
    { label: "Name", key: "name", sortable: true },
    { label: "Last viewed", key: "last_viewed", sortable: true },
    { label: "Type", key: "type", sortable: true },
  ];

  const addMenuItems = [
    { label: "Add Data", onClick: () => {} },
    { label: "Ingest via partner", onClick: () => {} },
    { label: "Upload to volume", onClick: () => {} },
    { divider: true },
    { label: "Create a catalog", onClick: () => {} },
    { label: "Create an external location", onClick: () => {} },
    { label: "Create a credential", onClick: () => {} },
    { label: "Create a connection", onClick: () => {} },
  ]

  const tabItems = [
    { label: "Recents", active: activeTab === "Recents" },
    // { label: "Favorites", active: activeTab === "Favorites" },
    { label: "Catalogs", active: activeTab === "Catalogs" },
  ]

  const filteredData = useMemo(() => {
    let dataToFilter = catalogListData

    if (activeTab === "Favorites") {
      dataToFilter = catalogListData.filter((item) => item.isFavorite)
    } else if (activeTab === "Catalogs") {
      dataToFilter = catalogListData.filter((item) => item.type === "Catalog")
    }

    if (!searchQuery.trim()) {
      return dataToFilter
    }
    return dataToFilter.filter((item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()),
    )
  }, [catalogListData, activeTab, searchQuery])

  const sortedData = useMemo(() => {
    return [...filteredData].sort((a, b) => {
      const aValue = a[sortColumn] || "";
      const bValue = b[sortColumn] || "";
      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortColumn, sortDirection]);

  const handleTabClick = (tab: { label: string }) => {
    setActiveTab(tab.label)
    setSearchQuery("")
  }

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000); 
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="">
      <div className="flex flex-wrap justify-start gap-x-2 gap-y-2 mb-8">
        <Button
          disabled
          variant="outline"
          color="primary"
          size="sm"
          iconRight={<IconChevronRight size={20} />}
          label="Delta Sharing"
          onClick={() => console.log("Delta Sharing")}
        />
        <Button
          disabled
          variant="outline"
          color="primary"
          size="sm"
          iconRight={<IconChevronRight size={20} />}
          label="Clean Rooms"
          onClick={() => console.log("Clean Rooms")}
        />
        <Button
          disabled
          variant="outline"
          color="primary"
          size="sm"
          iconRight={<IconChevronRight size={20} />}
          label="External Data"
          onClick={() => console.log("External Data")}
        />
        <Dropdown
          items={addMenuItems}
          theme="primary"
          size="md"
          showArrow={false}
          label={
            <span className="flex items-center gap-2">
              Add Data
              <IconPlus size={16} />
            </span>
          }
        />
      </div>

      <h2 className="text-xl font-semibold mb-4">Quick access</h2>

      <div className="flex justify-between items-center mb-4">
        <Tabs
          items={tabItems}
          onClick={handleTabClick}
          renderContent={() => (
            <div className="mt-4">
              <Search
                placeholder={`Filter ${activeTab}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
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
                    ) : (
                    sortedData.map((item) => (
                      <Table.TableRow key={item.name}>
                        <Table.TableCell>
                          <div className="flex items-center gap-3">
                            {/* {item.isFavorite ? (
                              <IconStarFilled
                                size={20}
                                className="text-yellow-500"
                              />
                            ) : (
                              <IconStar size={20} className="text-gray-300" />
                            )} */}
                            <Link
                              to={`/admin/catalog/${item.name}`}
                              onClick={() => selectCatalog(item)}
                              className="flex items-center gap-2 text-primary hover:underline"
                            >
                              <IconBox size={20} />
                              <span>{item.name}</span>
                            </Link>
                          </div>
                        </Table.TableCell>
                        <Table.TableCell>{item.last_viewed}</Table.TableCell>
                        <Table.TableCell>{item.type}</Table.TableCell>
                      </Table.TableRow>
                    ))
                  )}
                </Table.TableBody>
              </Table.Table>
            </div>
          )}
        />
      </div>
    </div>
  )
}

export default CatalogList
