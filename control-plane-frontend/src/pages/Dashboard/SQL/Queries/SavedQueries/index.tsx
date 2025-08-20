import { useEffect, useState, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { CustomSelect } from "@components/commons"
import { Search } from "@components/commons/Search";
import { Pagination } from "@components/commons/Table"
import QueriesTable from "./QueriesTable"
import { useQuery } from "@context/query/QueryContext"
import { httpNodeSuperset, httpSuperset } from "@http/axios"
import endpoint from "@http/endpoint"
import QueryPreviewModal from "../QueryPreviewModal"
import type { SavedQuery } from "@/types/savedQuery"
import { toast } from "react-toastify"
import type { Option as OptionType } from "@components/commons/Select";

interface SavedQueriesProps {
  onPreview: (queryId: number) => void
  activePreviewId: number | string | null
}

const SavedQueries: React.FC<SavedQueriesProps> = ({
  onPreview,
  activePreviewId,
}) => {
  const navigate = useNavigate()

  const {
    savedQueries,
    setSavedQueries,
    databaseOptions,
    setDatabaseOptions,
    schemaOptions,
    setSchemaOptions,
    modifiedByOptions,
    setModifiedByOptions,
    addTab,
  } = useQuery()

  const handleEditQuery = (query: SavedQuery) => {
    addTab(query)
    navigate("/admin/sql")
  }

  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedDatabase, setSelectedDatabase] = useState<OptionType | null>(null)
  const [selectedSchema, setSelectedSchema] = useState<OptionType | null>(null)
  const [selectedModifiedBy, setSelectedModifiedBy] = useState<OptionType | null>(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [currentPreviewIndex, setCurrentPreviewIndex] = useState(0)
  const [currentPage, setCurrentPage] = useState(1);
  const [sortColumn, setSortColumn] = useState("changed_on_delta_humanized");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const pageSize = 10;

  const handleSort = (column: string) => {
    const direction = sortColumn === column && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortColumn(column);
    setSortDirection(direction);
  };

  const fetchFilterOptions = async () => {
    try {
      const [dbRes, schemaRes, modifiedByRes] = await Promise.all([
        httpSuperset.get(endpoint.superset.query.related_database),
        httpSuperset.get(endpoint.superset.query.distinct_schema),
        httpSuperset.get(endpoint.superset.query.related_changed_by),
      ])
      setDatabaseOptions(
        dbRes.data.result.map((item: any) => ({
          value: item.value,
          label: item.text,
        })),
      )
      setSchemaOptions(
        schemaRes.data.result.map((item: any) => ({
          value: item.value,
          label: item.text,
        })),
      )
      setModifiedByOptions(
        modifiedByRes.data.result.map((item: any) => ({
          value: item.value,
          label: item.text,
        })),
      )
    } catch (error) {
      console.error("Error fetching filter options:", error)
    }
  }

  const fetchSavedQueries = async () => {
    setIsLoading(true)
    try {
      const params = {
        q: `(page_size:-1)`,
      }
      const response = await httpSuperset.get(
        endpoint.superset.query.saved_query,
        { params },
      )
      setSavedQueries(response.data.result || [])
    } catch (error) {
      console.error("Error fetching saved queries:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchFilterOptions()
    fetchSavedQueries()
  }, [])

  const filteredAndSortedQueries = useMemo(() => {
    let queries = [...savedQueries];
    console.log(queries[1])

    if (searchQuery) {
      queries = queries.filter(q => q.label.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    if (selectedDatabase) {
      queries = queries.filter(q => q.database.id === selectedDatabase.value);
    }
    if (selectedSchema) {
      queries = queries.filter(q => q.schema === selectedSchema.value);
    }
    if (selectedModifiedBy) {
      queries = queries.filter(q => q.changed_by?.id === selectedModifiedBy.value);
    }

    queries.sort((a, b) => {
      const aValue = a[sortColumn as keyof SavedQuery] as any;
      const bValue = b[sortColumn as keyof SavedQuery] as any;
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return queries;
  }, [savedQueries, searchQuery, selectedDatabase, selectedSchema, selectedModifiedBy, sortColumn, sortDirection]);

  const totalRecords = filteredAndSortedQueries.length;
  const totalPages = Math.ceil(totalRecords / pageSize);

  const paginatedQueries = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredAndSortedQueries.slice(startIndex, endIndex);
  }, [filteredAndSortedQueries, currentPage, pageSize]);

  const handleDeleteQuery = async (queryId: number) => {
    if (window.confirm("Are you sure you want to delete this query?")) {
      try {
        await httpNodeSuperset.delete(
          endpoint.superset.node.saved_query.delete(queryId),
        )
        toast.success("Query deleted successfully")
        setSavedQueries((prev: SavedQuery[]) => prev.filter(q => q.id !== queryId));
      } catch (error) {
        toast.error("Failed to delete query")
        console.error("Failed to delete query:", error)
      }
    }
  }

  return (
    <div className="mt-4">
      <div className="flex flex-wrap gap-4 mb-4">
        <Search
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 min-w-[200px]"
        />
        <CustomSelect
          options={databaseOptions}
          placeholder="Select Warehouse"
          onChange={setSelectedDatabase}
          value={selectedDatabase}
          isClearable
          className="flex-1 min-w-[200px]"
        />
        <CustomSelect
          options={schemaOptions}
          placeholder="Select Schema"
          onChange={setSelectedSchema}
          value={selectedSchema}
          isClearable
          className="flex-1 min-w-[200px]"
        />
        <CustomSelect
          options={modifiedByOptions}
          placeholder="Select Modified By"
          onChange={setSelectedModifiedBy}
          value={selectedModifiedBy}
          isClearable
          className="flex-1 min-w-[200px]"
        />
      </div>
      <QueriesTable
        isLoading={isLoading}
        queries={paginatedQueries}
        onPreview={onPreview}
        onEdit={handleEditQuery}
        onDelete={handleDeleteQuery}
        activePreviewId={activePreviewId}
        sortColumn={sortColumn}
        sortDirection={sortDirection}
        onSort={handleSort}
      />
      <div className="mt-4">
        <Pagination
          currentPage={currentPage}
          pageSize={pageSize}
          totalPages={totalPages}
          totalRecords={totalRecords}
          onPageChange={setCurrentPage}
        />
      </div>
      <QueryPreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        query={savedQueries[currentPreviewIndex]}
        onNext={() => setCurrentPreviewIndex((i) => i + 1)}
        onPrevious={() => setCurrentPreviewIndex((i) => i - 1)}
        hasNext={currentPreviewIndex < savedQueries.length - 1}
        hasPrevious={currentPreviewIndex > 0}
      />
    </div>
  )
}

export default SavedQueries