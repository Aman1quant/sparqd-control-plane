import { BsSortDown, BsSortUp } from "react-icons/bs";
import styles from "./Table.module.scss";
import { type ReactNode } from "react";
// import clsx from "clsx";

export interface Column {
  label: string | ReactNode;
  key?: string;
  sortable?: boolean;
}

interface TableHeaderProps {
  columns: Column[];
  sortColumn?: string;
  sortDirection?: "asc" | "desc";
  onSort?: (columnKey: string) => void;
}

const TableHeader: React.FC<TableHeaderProps> = ({ 
  columns, 
  sortColumn, 
  sortDirection, 
  onSort 
}) => {
  const handleSort = (column: Column) => {
    if (column.sortable && onSort && column.key) {
      onSort(column.key);
    }
  };

  return (
    <thead className={styles.table__header}>
      <tr>
        {columns.map((column, index) => (
          <th
            key={column.key || index}
            onClick={() => handleSort(column)}
            style={{ cursor: column.sortable ? "pointer" : "default" }}
          >
            <div className={styles.column}>
              {column.label}
              {column.sortable && sortColumn === column.key && (
                <span className={styles.sortIcon}>
                  {sortDirection === "asc" ? <BsSortUp /> : <BsSortDown />}
                </span>
              )}
            </div>
          </th>
        ))}
      </tr>
    </thead>
  );
};

export default TableHeader;