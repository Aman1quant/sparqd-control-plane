import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { useCatalog, type IPermission, type CatalogTreeItem, type ISchema } from "@context/catalog/CatalogContext";
import {
  IconBox,
  // IconStar,
  IconSettings,
  IconInfoCircle,
} from "@tabler/icons-react"
import DescriptionBox from "../DescriptionBox"
import MetadataSidebar from "../MetadataSidebar"
import styles from "../CatalogDetail.module.scss"

import { Button, Table, Tabs, Switch, Select, Checkbox, Search } from "@components/commons"
import TableSkeleton from "@components/commons/Table/TableSkeleton";

const tabItems = [
  { label: "Overview" },
  { label: "Details" },
  { label: "Permissions" },
  { label: "Workspaces" },
]

// const DetailItem = ({ label, value }: { label: string; value: string }) => (
//   <div className="flex justify-between border-b py-2">
//     <span className="text-sm text-gray-600">{label}</span>
//     <span className="text-sm text-gray-800 font-medium">{value}</span>
//   </div>
// )

const AdvancedOption = ({
  title,
  description,
  enabled,
  onToggle,
}: {
  title: string
  description: string
  enabled: boolean
  onToggle: (val: boolean) => void
}) => (
  <div className="flex justify-between items-center py-2">
    <div>
      <h4 className="font-semibold text-sm">{title}</h4>
      <p className="text-xs text-gray-500">{description}</p>
    </div>
    <div className="flex items-center gap-2">
      <Switch checked={enabled} onChange={onToggle} />
      <span className="text-sm font-medium">
        {enabled ? "ENABLED" : "Disabled"}
      </span>
      <IconSettings size={20} className="text-gray-500 cursor-pointer" />
    </div>
  </div>
)

const CatalogDetailView = ({ item }: { item: CatalogTreeItem }) => {
  const { getSchemasForCatalog, openEditModal, openCreateSchemaModal } = useCatalog()
  const [filter, setFilter] = useState("")
  const [privilegeFilter, setPrivilegeFilter] = useState("")
  const [principalFilter, setPrincipalFilter] = useState("")
  const [workspaceFilter, setWorkspaceFilter] = useState("")
  const [dataClassification, setDataClassification] = useState(false)
  const [predictiveOptimization, setPredictiveOptimization] = useState(true)
  const [allWorkspacesAccess, setAllWorkspacesAccess] = useState(true)
  const [manageAccessLevel, setManageAccessLevel] = useState("")

  const [schemaSort, setSchemaSort] = useState({ key: "name", direction: "asc" });
  const [permissionSort, setPermissionSort] = useState({ key: "principal", direction: "asc" });
  const [workspaceSort, setWorkspaceSort] = useState({ key: "name", direction: "asc" });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, [item]);

  const schemas = getSchemasForCatalog(item.name);

  const handleSort = (setter: React.Dispatch<React.SetStateAction<{key: string, direction: string}>>, currentConfig: {key: string, direction: string}) => (columnKey: string) => {
      const direction = currentConfig.key === columnKey && currentConfig.direction === 'asc' ? 'desc' : 'asc';
      setter({ key: columnKey, direction });
  };
  
  const schemaColumns = [
      { label: "Name", key: "name", sortable: true },
      { label: "Owner", key: "owner", sortable: true },
      { label: "Created at", key: "created_at", sortable: true },
  ];

  const permissionColumns = [
      { label: "Principal", key: "principal", sortable: true },
      { label: "Privilege", key: "privilege", sortable: true },
      { label: "Object", key: "object", sortable: false },
  ];

  const workspaceColumns = [
      { label: "Workspace name", key: "name", sortable: true },
      { label: "Workspace id", key: "id", sortable: false },
      { label: "Access Level", key: "accessLevel", sortable: true },
  ];

  const filteredSchemas = useMemo(() => {
    if (!filter) return schemas
    return schemas.filter((s) =>
      s.name.toLowerCase().includes(filter.toLowerCase())
    )
  }, [filter, schemas])

  const filteredPermissions = useMemo(() => {
    if (!item.permissions) return []
    return item.permissions.filter(
      (p: IPermission) =>
        p.privilege.toLowerCase().includes(privilegeFilter.toLowerCase()) &&
        p.principal.toLowerCase().includes(principalFilter.toLowerCase())
    )
  }, [item.permissions, privilegeFilter, principalFilter])

  const filteredWorkspaces = useMemo(() => {
    if (!item.workspaces) return []
    if (!workspaceFilter) return item.workspaces
    return item.workspaces.filter((w: any) =>
      w.name.toLowerCase().includes(workspaceFilter.toLowerCase())
    )
  }, [item.workspaces, workspaceFilter])

  const sortedSchemas = useMemo(() => {
    return [...filteredSchemas].sort((a, b) => {
        const aValue = a[schemaSort.key as keyof ISchema] || "";
        const bValue = b[schemaSort.key as keyof ISchema] || "";
        if (aValue < bValue) return schemaSort.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return schemaSort.direction === 'asc' ? 1 : -1;
        return 0;
    });
  }, [filteredSchemas, schemaSort]);
  
  // const sortedPermissions = useMemo(() => {
  //   return [...filteredPermissions].sort((a, b) => {
  //       const aValue = a[permissionSort.key as keyof IPermission] || "";
  //       const bValue = b[permissionSort.key as keyof IPermission] || "";
  //       if (aValue < bValue) return permissionSort.direction === 'asc' ? -1 : 1;
  //       if (aValue > bValue) return permissionSort.direction === 'asc' ? 1 : -1;
  //       return 0;
  //   });
  // }, [filteredPermissions, permissionSort]);

  const sortedWorkspaces = useMemo(() => {
    return [...filteredWorkspaces].sort((a, b) => {
        const aValue = a[workspaceSort.key as keyof typeof a] || "";
        const bValue = b[workspaceSort.key as keyof typeof b] || "";
        if (aValue < bValue) return workspaceSort.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return workspaceSort.direction === 'asc' ? 1 : -1;
        return 0;
    });
  }, [filteredWorkspaces, workspaceSort]);

  return (
    <div className="h-full">
      <div className={styles.header}>
        <IconBox size={32} />
        <h1 className={styles.title}>{item.name}</h1>
        {/* <IconStar size={20} /> */}
        <div className="ml-auto">
          <Button
            label="Create schema"
            onClick={() => openCreateSchemaModal(item.id)}
          />
        </div>
      </div>
      <Tabs
        className="h-full"
        items={tabItems}
        renderContent={(activeTab) => { 
          if (activeTab === "Overview") {
            return (
              <div className="flex h-full">
                <div className={`flex-1 ${styles.content}`}>
                  <DescriptionBox
                    description={item.description}
                    onEdit={() => openEditModal(item)}
                  />
                  <Search
                    placeholder="Filter schemas"
                    className="max-w-xs"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                  />
                  <div className="mt-4">
                    <Table.Table>
                      <Table.TableHeader
                        columns={schemaColumns}
                        sortColumn={schemaSort.key}
                        sortDirection={schemaSort.direction as 'asc' | 'desc'}
                        onSort={handleSort(setSchemaSort, schemaSort)}
                      />
                      <Table.TableBody>
                        {isLoading ? (
                          <TableSkeleton columns={schemaColumns.length} rows={5} />
                        ) :
                        sortedSchemas.map((s) => (
                          <Table.TableRow key={s.name}>
                            <Table.TableCell>
                              <Link
                                to={`/admin/catalog/${item.name}/${s.name}`}
                                className="text-primary hover:underline"
                              >
                                {s.name}
                              </Link>
                            </Table.TableCell>
                            <Table.TableCell>{s.owner}</Table.TableCell>
                            <Table.TableCell>{s.created_at}</Table.TableCell>
                          </Table.TableRow>
                        ))}
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
                      About this catalog
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
                  <div>
                    <h3 className="text-base font-semibold mb-2">
                      Advanced
                    </h3>
                    <div className="border-t divide-y">
                      <AdvancedOption
                        title="Data Classification"
                        description="Automatically scan tables in the catalog and tag columns that contain sensitive data."
                        enabled={dataClassification}
                        onToggle={setDataClassification}
                      />
                      <AdvancedOption
                        title="Predictive Optimization"
                        description="Optimize data layout for better performance."
                        enabled={predictiveOptimization}
                        onToggle={setPredictiveOptimization}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )
          }
          if (activeTab === "Permissions") {
            return (
              <div className={styles.content}>
                <div className="flex justify-between items-center mb-4">
                  <div className="flex gap-2">
                    <Button label="Grant" disabled variant="solid" />
                    <Button label="Revoke" disabled variant="outline" />
                  </div>
                  <div className="flex gap-2">
                    <Select
                      options={[{ label: "All Privileges", value: "" }]}
                      value={privilegeFilter}
                      onChange={(value) => setPrivilegeFilter(String(value))}
                    />
                    <Search
                      placeholder="Type to filter by principal"
                      value={principalFilter}
                      onChange={(e) => setPrincipalFilter(e.target.value)}
                    />
                  </div>
                </div>
                <Table.Table>
                  <Table.TableHeader
                    columns={permissionColumns}
                    sortColumn={permissionSort.key}
                    sortDirection={permissionSort.direction as 'asc' | 'desc'}
                    onSort={handleSort(setPermissionSort, permissionSort)}
                  />
                  <Table.TableBody>
                    {filteredPermissions.length === 0 ? (
                      <Table.TableRow>
                        <Table.TableCell colSpan={3} className="text-center text-gray-500">
                          Data not found
                        </Table.TableCell>
                      </Table.TableRow>
                    ) : (
                      filteredPermissions.map((p, i) => (
                        <Table.TableRow key={i}>
                          <Table.TableCell>{p.principal}</Table.TableCell>
                          <Table.TableCell>{p.privilege}</Table.TableCell>
                          <Table.TableCell>
                            <div className="flex items-center gap-2">
                              <IconBox size={16} />
                              <span>{p.object}</span>
                            </div>
                          </Table.TableCell>
                        </Table.TableRow>
                      ))
                    )}
                  </Table.TableBody>
                </Table.Table>
              </div>
            )
          }
          if (activeTab === "Workspaces") {
            return (
              <div className={styles.content}>
                <p className="text-sm text-gray-600 mb-4">
                  Specify which workspaces can have access to this catalog.
                </p>
                <Checkbox
                  label="All workspaces have access"
                  checked={allWorkspacesAccess}
                  onChange={setAllWorkspacesAccess}
                />
                {allWorkspacesAccess ? (
                  <div className="mt-4 bg-blue-50 border border-blue-200 text-blue-800 text-sm rounded-md p-3 flex gap-3">
                    <IconInfoCircle
                      size={20}
                      className="flex-shrink-0 mt-0.5"
                    />
                    <span>
                      Catalogs on default storage can only be directly accessed
                      using serverless compute. Be sure to review all of the
                      limitations before proceeding.
                    </span>
                  </div>
                ) : (
                  <div className="mt-4">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-center flex-wrap gap-4 mb-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <Button
                          label="Assign to workspaces"
                          variant="solid"
                          size="md"
                        />
                        <Select
                          options={[{ label: "Manage Access Level", value: "" }]}
                          value={manageAccessLevel}
                          className="!w-[200px]"
                          onChange={(val) => setManageAccessLevel(String(val))}
                        />
                        <Button label="Revoke" variant="outline" size="md" />
                      </div>
                      <div className="w-full md:w-auto md:max-w-xs">
                        <Search
                          placeholder="Filter workspaces..."
                          value={workspaceFilter}
                          onChange={(e) => setWorkspaceFilter(e.target.value)}
                        />
                      </div>
                    </div>
                    <Table.Table>
                      <Table.TableHeader
                        columns={workspaceColumns}
                        sortColumn={workspaceSort.key}
                        sortDirection={workspaceSort.direction as 'asc' | 'desc'}
                        onSort={handleSort(setWorkspaceSort, workspaceSort)}
                      />
                      <Table.TableBody>
                        {sortedWorkspaces.map((w: any) => (
                          <Table.TableRow key={w.id}>
                            <Table.TableCell>{w.name}</Table.TableCell>
                            <Table.TableCell>{w.id}</Table.TableCell>
                            <Table.TableCell>{w.accessLevel}</Table.TableCell>
                          </Table.TableRow>
                        ))}
                      </Table.TableBody>
                    </Table.Table>
                  </div>
                )}
              </div>
            )
          }
          return (
            <div className={styles.content}>Content for {activeTab}</div>
          )
        }}
      />
    </div>
  )
}

export default CatalogDetailView
