import React from "react";
import {
  IconBox,
  IconDatabase,
  IconTable,
  IconFileText,
  IconChevronDown,
  IconChevronRight,
  IconLoader,
} from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import {
  useCatalog,
  type CatalogTreeItem as TItem,
} from "@context/catalog/CatalogContext";
import styles from "../../../SQL/SQLEditor/SQLMenu/SQLMenu.module.scss";
import clsx from "clsx";

const icons: { [key: string]: React.ElementType } = {
  catalog: IconBox,
  schema: IconDatabase,
  table: IconTable,
  view: IconTable,
};

interface TreeItemProps {
  item: TItem;
  level: number;
  parentPath: string;
  editingId: string | null;
  onStartRename: (id: string | null) => void;
  onCancelRename: () => void;
  onSaveRename: (id: string, newName: string) => void;
  onRightClick: (e: React.MouseEvent, item: TItem) => void;
  activePath: string;
}

const TreeItem = ({
  item,
  level,
  parentPath,
  editingId,
  onStartRename,
  onCancelRename,
  onSaveRename,
  onRightClick,
  activePath,
}: TreeItemProps) => {
  const { expandedNodes, toggleNode, loadingNodes } = useCatalog();
  const navigate = useNavigate();

  const isExpanded = expandedNodes.has(item.id);
  const isLoading = loadingNodes.has(item.id);
  const isExpandable = item.type === "catalog" || item.type === "schema";
  const Icon = icons[item.type] || IconFileText;
  const currentPath = `${parentPath}/${item.name}`;
  const isActive = currentPath === activePath;

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isExpandable) {
      toggleNode(item.id);
    }
  };

  const handleNavigate = () => {
    navigate(currentPath);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      onSaveRename(item.id, e.currentTarget.value);
      onCancelRename();
    } else if (e.key === "Escape") {
      onCancelRename();
    }
  };

  return (
    <div>
      <div
        className={styles.itemWrapper}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onContextMenu={(e) => onRightClick(e, item)}
      >
        <div className="flex items-center justify-center w-6 h-6">
          {isLoading ? (
            <IconLoader size={16} className="text-gray-600 animate-spin" />
          ) : isExpandable ? (
            <button
              onClick={handleToggle}
              className="flex items-center justify-center w-full h-full rounded hover:bg-gray-200"
            >
              {isExpanded ? (
                <IconChevronDown size={16} className="text-gray-600" />
              ) : (
                <IconChevronRight size={16} className="text-gray-600" />
              )}
            </button>
          ) : (
            <div className="w-4" />
          )}
        </div>

        <div className="flex items-center flex-1 min-w-0" onClick={handleNavigate}>
          <Icon size={16} className="mx-1 text-gray-500" />
          {editingId === item.id ? (
            <input
              autoFocus
              className={styles.inputRename}
              defaultValue={item.name}
              onBlur={onCancelRename}
              onKeyDown={handleKeyDown}
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <span
              className={clsx("truncate text-sm flex-1", isActive && "text-primary font-semibold")}
              onDoubleClick={(e) => {
                e.stopPropagation();
                onStartRename(item.id);
              }}
            >
              {item.name}
            </span>
          )}
        </div>
      </div>
      {isExpandable && isExpanded && item.children && (
        <div>
          {item.children.length > 0 ? (
            item.children.map((child) => (
              <TreeItem
                key={child.id}
                item={child}
                level={level + 1}
                parentPath={currentPath}
                editingId={editingId}
                onStartRename={onStartRename}
                onCancelRename={onCancelRename}
                onSaveRename={onSaveRename}
                onRightClick={onRightClick}
                activePath={activePath}
              />
            ))
          ) : (
            <div
              className={styles.itemWrapper}
              style={{ paddingLeft: `${(level + 1) * 16 + 24}px` }}
            >
              <span className="text-xs text-gray-400 italic">
                No items found
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TreeItem;