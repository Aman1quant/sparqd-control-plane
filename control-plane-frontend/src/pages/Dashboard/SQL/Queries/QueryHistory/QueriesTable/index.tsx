import { useNavigate } from "react-router-dom"
import { useQuery, type QueryHistoryItem } from "@context/query/QueryContext"
import { Table } from "@components/commons"
import styles from "../../Queries.module.scss"
import { IconInbox, IconCircleArrowUpRight } from "@tabler/icons-react"
import TableSkeleton from "@components/commons/Table/TableSkeleton"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { darkula } from "react-syntax-highlighter/dist/cjs/styles/hljs"
import clsx from "clsx"

interface QueryHistoryTableProps {
  isLoading: boolean;
  history: QueryHistoryItem[];
  onPreview: (queryId: string) => void;
  activePreviewId: number | string | null;
  sortColumn: string;
  sortDirection: "asc" | "desc";
  onSort: (column: string) => void;
}

const QueriesTable: React.FC<QueryHistoryTableProps> = ({
  isLoading,
  history,
  onPreview,
  activePreviewId,
  sortColumn,
  sortDirection,
  onSort,
}) => {
  const navigate = useNavigate();
  const { addTab } = useQuery();

  const columns = [
    { label: "Time", key: "start_time", sortable: true },
    { label: "Duration", key: "duration", sortable: true },
    { label: "Tab Name", key: "tab_name", sortable: true },
    { label: "Warehouse", key: "database", sortable: true },
    { label: "Schema", key: "schema", sortable: true },
    { label: "Tables", key: "sql_tables", sortable: false },
    { label: "User", key: "user", sortable: true },
    { label: "Rows", key: "rows", sortable: true },
    { label: "SQL", key: "sql", sortable: false },
    { label: "Actions", key: "actions", sortable: false },
  ]

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "success":
        return "bg-green-100 text-green-800";
      case "failed":
        return "bg-red-100 text-red-800";
      case "running":
      case "stopped":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDuration = (start: number, end: number, status: string) => {
    if (start == null || end == null) {
      if (status && status.toLowerCase() === "running") {
        return (
          <span
            className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
              status
            )}`}
          >
            00:00:00.000
          </span>
        );
      }
      return "-";
    }

    const durationMs = end - start;
    const hours = Math.floor(durationMs / 3600000);
    const minutes = Math.floor((durationMs % 3600000) / 60000);
    const seconds = Math.floor((durationMs % 60000) / 1000);
    const milliseconds = Math.floor(durationMs % 1000);
    const pad = (num: number, size = 2) => num.toString().padStart(size, "0");
    const formattedTime = `${pad(hours)}:${pad(minutes)}:${pad(
      seconds
    )}.${pad(milliseconds, 3)}`;

    return (
      <span
        className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
          status
        )}`}
      >
        {formattedTime}
      </span>
    );
  };

  const handleOpenInSqlLab = (query: any) => {
    addTab(query);
    navigate("/admin/sql");
  };

  const getLimitedSql = (sql: string) => {
    const lines = sql.split("\n");
    if (lines.length > 2) {
      return lines.slice(0, 2).join("\n") + "\n...";
    }
    return sql;
  };

  return (
    <div className={styles.queriesTableWrapper}>
      <Table.Table className="w-full">
        <Table.TableHeader 
            columns={columns} 
            sortColumn={sortColumn}
            sortDirection={sortDirection}
            onSort={onSort}
        />
        <Table.TableBody>
          {isLoading ? (
            <TableSkeleton columns={columns.length} rows={10} />
          ) : history.length === 0 ? (
            <Table.TableRow>
              <Table.TableCell
                colSpan={columns.length}
                className="text-center py-10"
              >
                <div className="flex flex-col items-center justify-center gap-2 text-gray-500">
                  <IconInbox size={48} strokeWidth={1} />
                  <span>No data available</span>
                </div>
              </Table.TableCell>
            </Table.TableRow>
          ) : (
            history.map((query) => (
              <Table.TableRow
                key={query.id}
                className={clsx(
                  "group",
                  query.id === activePreviewId && "bg-gray-100"
                )}
              >
                <Table.TableCell className="align-top">
                  {new Date(query.start_time).toLocaleString()}
                </Table.TableCell>
                <Table.TableCell className="align-top">
                  {formatDuration(
                    query.start_time,
                    query.end_time,
                    query.status
                  )}
                </Table.TableCell>
                <Table.TableCell className="align-top">
                  {query.tab_name}
                </Table.TableCell>
                <Table.TableCell className="align-top">
                  {query.database?.database_name}
                </Table.TableCell>
                <Table.TableCell className="align-top">
                  {query.schema}
                </Table.TableCell>
                <Table.TableCell className="align-top">
                  {query.sql_tables.map((t: any) => t.table).join(", ")}
                </Table.TableCell>
                <Table.TableCell className="align-top">
                  {query.user.first_name} {query.user.last_name}
                </Table.TableCell>
                <Table.TableCell className="align-top">
                  {query.rows}
                </Table.TableCell>
                <Table.TableCell>
                  <div
                    className="border cursor-pointer rounded-md bg-gray-50 min-w-64 max-h-96 overflow-auto"
                    onClick={() => onPreview(query.id)}
                  >
                    <SyntaxHighlighter
                      language="sql"
                      style={darkula}
                      customStyle={{
                        margin: 0,
                        padding: "1rem",
                        fontSize: "0.85rem",
                        whiteSpace: "pre-line",
                        overflow: "scroll",
                        minWidth: "fit-content",
                        maxHeight: "200px",
                        wordBreak: "break-all",
                      }}
                      codeTagProps={{
                        style: {
                          whiteSpace: "pre-line",
                          overflowX: "auto",
                        },
                      }}
                      wrapLines={true}
                      wrapLongLines={false}
                    >
                      {getLimitedSql(query.sql) || ""}
                    </SyntaxHighlighter>
                  </div>
                </Table.TableCell>
                <Table.TableCell>
                  <div className="flex items-center gap-x-2">
                    <button
                      onClick={() => handleOpenInSqlLab(query)}
                      className="p-1 rounded"
                    >
                      <IconCircleArrowUpRight
                        size={30}
                        strokeWidth={1.5}
                        className="text-gray-500 hover:text-primary"
                      />
                    </button>
                  </div>
                </Table.TableCell>
              </Table.TableRow>
            ))
          )}
        </Table.TableBody>
      </Table.Table>
    </div>
  );
};

export default QueriesTable;