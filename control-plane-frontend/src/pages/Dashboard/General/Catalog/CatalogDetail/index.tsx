import { useMemo } from "react"
import { useParams } from "react-router-dom"
import { useCatalog } from "@context/catalog/CatalogContext"
import { Breadcrumb } from "@components/commons"
import type { BreadcrumbItem } from "@components/commons/Breadcrumb"
import CatalogDetailView from "./CatalogDetailView"
import SchemaDetailView from "./SchemaDetailView"
import TableDetailView from "./TableDetailView"

const CatalogDetail = () => {
  const { catalogName, schemaName, tableName } = useParams()
  const { sectionedTreeData } = useCatalog()

  const { currentItem, breadcrumbItems } = useMemo(() => {
    const breadcrumbItems: BreadcrumbItem[] = [
      { label: "Catalog Explorer", href: "/admin/catalog" },
    ]
    let currentItem: any = null

    if (catalogName) {
      const catalog = sectionedTreeData
        .flatMap((s) => s.items)
        .find((c) => c.name === catalogName)
      breadcrumbItems.push({
        label: catalogName,
        href: `/admin/catalog/${catalogName}`,
        isAction: !schemaName,
      })
      if (!schemaName) currentItem = catalog

      if (schemaName && catalog?.children) {
        const schema = catalog.children.find((s) => s.name === schemaName)
        breadcrumbItems.push({
          label: schemaName,
          href: `/admin/catalog/${catalogName}/${schemaName}`,
          isAction: !tableName,
        })
        if (!tableName) currentItem = schema

        if (tableName && schema?.children) {
          const table = schema.children.find((t) => t.name === tableName)
          breadcrumbItems.push({ label: tableName, isAction: true })
          currentItem = table
        }
      }
    }
    return { currentItem, breadcrumbItems }
  }, [catalogName, schemaName, tableName, sectionedTreeData])

  const renderContent = () => {
    if (!currentItem) return <div>Item not found or loading...</div>
    if (currentItem.type === "view" || currentItem.type === "table") {
      return <TableDetailView tableName={currentItem.name} />
    }
    if (currentItem.type === "schema") {
      return <SchemaDetailView item={currentItem} catalogName={catalogName!} />
    }
    if (currentItem.type === "catalog") {
      return <CatalogDetailView item={currentItem} />
    }
    return <div>Select an item to see details.</div>
  }

  return (
    <div className="h-full">
      <div className="py-4">
        <Breadcrumb items={breadcrumbItems} />
      </div>
      <div className="flex h-full">
        <div className="flex-1 w-full">{renderContent()}</div>
      </div>
    </div>
  )
}

export default CatalogDetail
