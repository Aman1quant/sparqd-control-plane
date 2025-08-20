import React from "react"

export interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  children: React.ReactNode
  className?: string
}

const TableCell: React.FC<TableCellProps> = ({ children, className, ...rest }) => {
  return <td className={className} {...rest}>{children}</td>
}

export default TableCell