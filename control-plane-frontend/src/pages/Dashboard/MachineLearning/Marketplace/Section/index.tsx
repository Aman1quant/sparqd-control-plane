import { useMemo, useState } from "react";
import { Table, Button } from "@components/commons";
import { IconExternalLink } from "@tabler/icons-react";
import styles from "../Marketplace.module.scss";

import icon_1 from "@/images/icons/icon_1.svg";
import icon_2 from "@/images/icons/icon_2.svg";
import icon_3 from "@/images/icons/icon_3.svg";
import icon_4 from "@/images/icons/icon_4.svg";
import icon_5 from "@/images/icons/icon_5.svg";
import icon_6 from "@/images/icons/icon_6.svg";
import icon_7 from "@/images/icons/icon_7.svg";
import icon_8 from "@/images/icons/icon_8.svg";
import icon_9 from "@/images/icons/icon_9.svg";

const Section = () => {
  const [sortColumn, setSortColumn] = useState("key");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const handleSort = (columnKey: string) => {
    const direction =
      sortColumn === columnKey && sortDirection === "asc" ? "desc" : "asc";
    setSortColumn(columnKey);
    setSortDirection(direction);
  };

  const columns = [
    {
      label: "Parameter",
      key: "key",
      sortable: true,
    },
    {
      label: "Value",
      key: "value",
      sortable: true,
    },
  ];

  const dataMarketplace = [
    {
      key: "Connection",
      value: "SparkThriftServer (Spark 1.1 and later)",
    },
    {
      key: "Server",
      value: "dev.iomete.cloud",
    },
    {
      key: "Port",
      value: "443",
    },
    {
      key: "Authentication",
      value: "Username and Password",
    },
    {
      key: "Username",
      value: "admin",
    },
    {
      key: "Password",
      value: "spark",
    },
    {
      key: "Transport",
      value: "HTTP",
    },
    {
      key: "HTTP Path",
      value: "/data-plane/spark-resource/lakehouse/data-engineering-team",
    },
    {
      key: "SSL",
      value: "spark",
    },
  ];

  const sortedData = useMemo(() => {
    return [...dataMarketplace].sort((a, b) => {
      const aValue = a[sortColumn as keyof typeof a] || "";
      const bValue = b[sortColumn as keyof typeof b] || "";
      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [dataMarketplace, sortColumn, sortDirection]);

  return (
    <div>
      <div className={styles.marketplaceSection}>
        <div className={styles.marketplaceContainerSection}>
          <img src={icon_9} className={styles.iconSection} alt="icon_9" />
          <div className="text-body-medium">Python</div>
        </div>
        <div className={styles.marketplaceContainerSection}>
          <img src={icon_8} className={styles.iconSection} alt="icon_8" />
          <div className="text-body-medium">JDBC</div>
        </div>
        <div className={styles.marketplaceContainerSection}>
          <img src={icon_2} className={styles.iconSection} alt="icon_2" />
          <div className="text-body-medium">DBT</div>
        </div>
        <div className={styles.marketplaceContainerSection}>
          <img src={icon_3} className={styles.iconSection} alt="icon_3" />
          <div className="text-body-medium">Tableau</div>
        </div>
        <div className={styles.marketplaceContainerSection}>
          <img src={icon_1} className={styles.iconSection} alt="icon_1" />
          <div className="text-body-medium">Power BI</div>
        </div>
        <div className={styles.marketplaceContainerSection}>
          <img src={icon_4} className={styles.iconSection} alt="icon_4" />
          <div className="text-body-medium">Superset</div>
        </div>
        <div className={styles.marketplaceContainerSection}>
          <img src={icon_5} className={styles.iconSection} alt="icon_5" />
          <div className="text-body-medium">Metabase</div>
        </div>
        <div className={styles.marketplaceContainerSection}>
          <img src={icon_6} className={styles.iconSection} alt="icon_6" />
          <div className="text-body-medium">Redash</div>
        </div>
        <div className={styles.marketplaceContainerSection}>
          <img src={icon_7} className={styles.iconSection} alt="icon_7" />
          <div className="text-body-medium">Spark Connect</div>
        </div>
        <div className={styles.marketplaceContainerSection}>
          <img src={icon_1} className={styles.iconSection} alt="icon_1" />
          <div className="text-body-medium">Arrow Flight</div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 align-middle items-center my-4">
        <label className="font-medium">Tableau - Spark SQL Driver</label>
        <div className="flex justify-self-end align-middle items-center text-primary">
          <Button
            label="Learn how to use Tableau"
            iconRight={<IconExternalLink size={16} />}
            variant="link"
            color="primary"
            size="md"
            onClick={() => console.log("metrics")}
          />
        </div>
      </div>
      <Table.Table className="w-full" theme="secondary">
        <Table.TableHeader 
            columns={columns}
            sortColumn={sortColumn}
            sortDirection={sortDirection}
            onSort={handleSort}
        />
        <Table.TableBody>
          {sortedData.map((data, idx) => (
            <Table.TableRow key={idx}>
              <Table.TableCell className=" w-[30%]">
                {data.key}
              </Table.TableCell>
              <Table.TableCell className="w-[70%]">
                {data.value}
              </Table.TableCell>
            </Table.TableRow>
          ))}
        </Table.TableBody>
      </Table.Table>
    </div>
  );
};

export default Section;