import { useEffect, useState, useMemo } from "react";
import { Pagination } from "@components/commons/Table";
import CustomDatePicker from "@components/commons/DatePicker";
import QueriesTable from "./QueriesTable";
import { useQuery } from "@context/query/QueryContext";
import { httpSuperset } from "@http/axios";
import endpoint from "@http/endpoint";
import { Search } from "@components/commons/Search";
import { CustomSelect } from "@components/commons";
import type { Option as OptionType } from "@components/commons/Select";

interface QueryHistoryTabProps {
  onPreview: (queryId: string) => void;
  activePreviewId: number | string | null;
}

const QueryHistory: React.FC<QueryHistoryTabProps> = ({ onPreview, activePreviewId }) => {
  const {
    queryHistory,
    setQueryHistory,
    databaseOptions,
    setDatabaseOptions,
    stateOptions,
    setStateOptions,
    userOptions,
    setUserOptions,
  } = useQuery();

  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDatabase, setSelectedDatabase] = useState<OptionType | null>(null);
  const [selectedState, setSelectedState] = useState<OptionType | null>(null);
  const [selectedUser, setSelectedUser] = useState<OptionType | null>(null);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [sortColumn, setSortColumn] = useState("start_time");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);

  const pageSize = 10;

  const handleSort = (column: string) => {
    const direction = sortColumn === column && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortColumn(column);
    setSortDirection(direction);
  };

  const fetchFilterOptions = async () => {
    try {
      const [dbRes, stateRes, userRes] = await Promise.all([
        httpSuperset.get(endpoint.superset.query.history_related_database),
        httpSuperset.get(endpoint.superset.query.history_distinct_status),
        httpSuperset.get(endpoint.superset.query.history_related_user),
      ]);
      setDatabaseOptions(
        dbRes.data.result.map((item: any) => ({
          value: item.value,
          label: item.text,
        }))
      );
      setStateOptions(
        stateRes.data.result.map((item: any) => ({
          value: item.value,
          label: item.text,
        }))
      );
      setUserOptions(
        userRes.data.result.map((item: any) => ({
          value: item.value,
          label: item.text,
        }))
      );
    } catch (error) {
      console.error("Error fetching filter options:", error);
    }
  };

  const fetchAllQueryHistory = async () => {
    setIsLoading(true);
    try {
      const params = {
        q: `(page_size:-1)`,
      };
      const response = await httpSuperset.get(endpoint.superset.query.main, {
        params,
      });
      setQueryHistory(response.data.result || []);
    } catch (error) {
      console.error("Error fetching query history:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFilterOptions();
    fetchAllQueryHistory();
  }, []);

  const filteredAndSortedHistory = useMemo(() => {
    let history = [...queryHistory];

    console.log(history[1])

    if (searchQuery) {
        history = history.filter(q => q.sql.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    if (selectedDatabase) {
        history = history.filter(q => q.database.database_name == selectedDatabase.label);
    }
    if (selectedState) {
        history = history.filter(q => q.status === selectedState.value);
    }
    if (selectedUser) {
        history = history.filter(q => q.user.id === selectedUser.value);
    }
    if (startDate) {
        history = history.filter(q => new Date(q.start_time) >= startDate);
    }
    if (endDate) {
        history = history.filter(q => new Date(q.start_time) <= endDate);
    }

    history.sort((a, b) => {
        const aValue = a[sortColumn] as any;
        const bValue = b[sortColumn] as any;
        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
        return 0;
    });

    return history;
  }, [queryHistory, searchQuery, selectedDatabase, selectedState, selectedUser, startDate, endDate, sortColumn, sortDirection]);

  const totalRecords = filteredAndSortedHistory.length;
  const totalPages = Math.ceil(totalRecords / pageSize);

  const paginatedHistory = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredAndSortedHistory.slice(startIndex, endIndex);
  }, [filteredAndSortedHistory, currentPage, pageSize]);

  return (
    <div className="mt-4">
      <div className="flex flex-wrap gap-4 mb-4">
        <CustomSelect
          options={databaseOptions}
          placeholder="Select Warehouse"
          onChange={setSelectedDatabase}
          value={selectedDatabase}
          isClearable
          className="flex-1 min-w-[200px]"
        />
        <CustomSelect
          options={stateOptions}
          placeholder="Select State"
          onChange={setSelectedState}
          value={selectedState}
          isClearable
          className="flex-1 min-w-[200px]"
        />
        <CustomSelect
          options={userOptions}
          placeholder="Select User"
          onChange={setSelectedUser}
          value={selectedUser}
          isClearable
          className="flex-1 min-w-[200px]"
        />
        <div className="flex items-center rounded-md border-0">
          <CustomDatePicker
            selected={startDate}
            onChange={(date) => setStartDate(date)}
            placeholderText="Start date"
            showTimeSelect
          />
          <span className="mx-2 text-gray-400">→</span>
          <CustomDatePicker
            selected={endDate}
            onChange={(date) => setEndDate(date)}
            placeholderText="End date"
            showTimeSelect
            minDate={startDate || undefined}
          />
        </div>
        <div className="w-full md:w-auto md:flex-grow">
          <Search 
            placeholder="Search by Query Text..." 
            value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full md:w-auto md:flex-grow"
          />
        </div>
      </div>
      <QueriesTable 
        isLoading={isLoading} 
        history={paginatedHistory}
        onPreview={onPreview} 
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
    </div>
  );
};

export default QueryHistory;