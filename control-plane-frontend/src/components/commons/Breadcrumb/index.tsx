import React from "react";
import { Link } from "react-router-dom";
import { BsChevronRight } from "react-icons/bs";
import styles from "./Breadcrumb.module.scss";

export interface BreadcrumbItem {
  label: React.ReactNode;
  href?: string;
  onClick?: () => void;
  isAction?: boolean;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ items }) => {
  const renderItemContent = (item: BreadcrumbItem) => {
    if (item.onClick && item.isAction) {
      return (
        <button onClick={item.onClick} className={styles.link}>
          {item.label}
        </button>
      );
    }
    if (item.href && item.isAction) {
      return (
        <Link to={item.href} className={styles.link}>
          {item.label}
        </Link>
      );
    }
    return <span className={styles.current}>{item.label}</span>;
  };

  return (
    <nav className={styles.breadcrumb} aria-label="Breadcrumb">
      <ol className={styles.list}>
        {items.map((item, index) => (
          <li key={index} className={styles.itemWrapper}>
            {index > 0 && <BsChevronRight className={styles.separator} />}
            {renderItemContent(item)}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumb;