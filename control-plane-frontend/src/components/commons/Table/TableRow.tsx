import clsx from "clsx"

interface TableRowProps {
  children: React.ReactNode
  className?: string
}

const TableRow: React.FC<TableRowProps> = ({ children, className }) => {
  return <tr className={clsx("border-b", className)}>{children}</tr>
}

export default TableRow
