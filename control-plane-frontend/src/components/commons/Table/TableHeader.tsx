import { BsSortDown, BsSortUp } from "react-icons/bs"
import styles from "./Table.module.scss"
import { type ReactNode, useState } from "react"

interface TableHeaderProps {
  columns: Array<{
    label: string | ReactNode
    sortable?: boolean
  }>
  onSort?: (columnIndex: number, direction: "asc" | "desc") => void
}

const TableHeader: React.FC<TableHeaderProps> = ({ columns, onSort }) => {
  const [sortConfig, setSortConfig] = useState<{
    columnIndex: number | null
    direction: "asc" | "desc" | null
  }>({
    columnIndex: null,
    direction: null,
  })

  const handleSort = (columnIndex: number) => {
    if (!columns[columnIndex].sortable) return

    const newDirection =
      sortConfig.columnIndex === columnIndex && sortConfig.direction === "asc"
        ? "desc"
        : "asc"

    setSortConfig({
      columnIndex,
      direction: newDirection,
    })

    onSort?.(columnIndex, newDirection)
  }

  return (
    <thead className={styles.table__header}>
      <tr>
        {columns.map((column, index) => (
          <th
            key={index}
            onClick={() => handleSort(index)}
            style={{ cursor: column.sortable ? "pointer" : "default" }}
          >
            <div className={styles.column}>
              {column.label}
              {column.sortable && sortConfig.columnIndex === index && (
                <span className={styles.sortIcon}>
                  {sortConfig.direction === "asc" ? (
                    <BsSortUp />
                  ) : (
                    <BsSortDown />
                  )}
                </span>
              )}
            </div>
          </th>
        ))}
      </tr>
    </thead>
  )
}

export default TableHeader
