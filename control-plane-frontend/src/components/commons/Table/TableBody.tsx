import styles from "./Table.module.scss"

interface TableBodyProps {
  children: React.ReactNode
}

const TableBody: React.FC<TableBodyProps> = ({ children }) => {
  return <tbody className={styles.table__body}>{children}</tbody>
}

export default TableBody
