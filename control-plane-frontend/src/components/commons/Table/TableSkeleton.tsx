import React from "react"
import { Table } from "@components/commons"

interface SkeletonRowProps {
  columns: number;
}

const SkeletonRow: React.FC<SkeletonRowProps> = ({ columns }) => (
  <Table.TableRow className="animate-pulse">
    {Array.from({ length: columns }).map((_, i) => (
      <Table.TableCell key={i}>
        <div className="h-4 bg-gray-200 rounded w-full"></div>
      </Table.TableCell>
    ))}
  </Table.TableRow>
);

interface TableSkeletonProps {
  rows?: number;
  columns: number;
}

const TableSkeleton: React.FC<TableSkeletonProps> = ({ rows = 5, columns }) => {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <SkeletonRow key={i} columns={columns} />
      ))}
    </>
  );
};

export default TableSkeleton;
