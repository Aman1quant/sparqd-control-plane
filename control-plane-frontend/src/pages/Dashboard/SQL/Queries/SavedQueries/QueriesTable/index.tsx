// import { useQuery } from "@context/query/QueryContext"
import { Table } from "@components/commons"
import styles from "../../Queries.module.scss"
import { IconInbox, IconEyeglass, IconPencil, IconCopy, IconFileArrowRight, IconTrash } from "@tabler/icons-react"
import TableSkeleton from "@components/commons/Table/TableSkeleton"
import type { SavedQuery } from "@/types/savedQuery"
import clsx from "clsx"

interface QueriesTableProps {
  isLoading: boolean;
  queries: SavedQuery[];
  onPreview: (queryId: number) => void;
  onDelete: (queryId: number) => void;
  onEdit: (query: SavedQuery) => void;
  activePreviewId: number | string | null;
  sortColumn: string;
  sortDirection: "asc" | "desc";
  onSort: (column: string) => void;
}

const QueriesTable: React.FC<QueriesTableProps> = ({
  isLoading,
  queries,
  onPreview,
  onDelete,
  onEdit,
  activePreviewId,
  sortColumn,
  sortDirection,
  onSort
}) => {

  const columns = [
    { label: "Name", key: "label", sortable: true },
    { label: "Description", key: "description", sortable: true },
    { label: "Warehouse", key: "database", sortable: true },
    { label: "Schema", key: "schema", sortable: true },
    { label: "Tables", key: "tables", sortable: false },
    { label: "Last modified", key: "changed_on_delta_humanized", sortable: true },
    { label: "Actions", key: "actions", sortable: false },
  ];

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
            <TableSkeleton columns={columns.length} rows={5} />
          ) : queries.length === 0 ? (
            <Table.TableRow>
              <Table.TableCell colSpan={columns.length} className="text-center py-10">
                <div className="flex flex-col items-center justify-center gap-2 text-gray-500">
                  <IconInbox size={48} strokeWidth={1} />
                  <span>No data available</span>
                </div>
              </Table.TableCell>
            </Table.TableRow>
          ) : (
            queries.map((query) => (
              <Table.TableRow
                key={query.id}
                className={clsx(
                  "group",
                  query.id === activePreviewId && "bg-gray-100"
                )}
              >
                <Table.TableCell>
                  <label className="text-primary cursor-pointer">{query.label}</label>
                </Table.TableCell>
                <Table.TableCell>{query.description}</Table.TableCell>
                <Table.TableCell>{query.database?.database_name}</Table.TableCell>
                <Table.TableCell>{query.schema}</Table.TableCell>
                <Table.TableCell>
                  {query?.sql_tables?.length > 0 ? query.sql_tables.map(t => t.table).join(', ') : ""}
                </Table.TableCell>
                <Table.TableCell>{query.changed_on_delta_humanized}</Table.TableCell>
                <Table.TableCell>
                  <div className="flex items-center gap-x-2">
                    <button onClick={() => onPreview(query.id)} className="p-1 rounded">
                      <IconEyeglass size={20} strokeWidth={1.5} className="text-gray-500 hover:text-primary" />
                    </button>
                    <button onClick={() => onEdit(query)} className="p-1 rounded">
                      <IconPencil size={20} strokeWidth={1.5} className="text-gray-500 hover:text-primary" />
                    </button>
                    <button onClick={() => console.log('Copy Query', query.id)} disabled className="p-1 rounded">
                      <IconCopy size={20} strokeWidth={1.5} className="text-gray-200" />
                    </button>
                    <button onClick={() => console.log('Export Query', query.id)} disabled className="p-1 rounded">
                      <IconFileArrowRight size={20} strokeWidth={1.5} className="text-gray-200" />
                    </button>
                    <button onClick={() => onDelete(query.id)} className="p-1 rounded">
                      <IconTrash size={20} strokeWidth={1.5} className="text-gray-500 hover:text-primary" />
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