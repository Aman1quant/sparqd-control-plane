export interface DatabaseColumn {
  id: string
  name: string
  type: "column"
  description?: string
}

export interface DatabaseTable {
  id: string
  pk: number
  name: string
  type: "table"
  schemaName: string
  children: DatabaseColumn[]
  childrenLoaded: boolean
}

export interface DatabaseSchema {
  id: string
  pk: number
  name: string
  type: "schema"
  children: DatabaseTable[]
  childrenLoaded: boolean
}

export interface Database {
  id: string
  pk: number
  name: string
  type: "catalog"
  children: DatabaseSchema[]
  childrenLoaded: boolean
}

export interface DatabaseStructureItem {
  title: string
  items: Database[]
}

export type DatabaseStructure = DatabaseStructureItem[]

export const extractDatabaseNames = (
  structure: DatabaseStructure,
): string[] => {
  return structure.flatMap((item) => item.items.map((db) => db.name))
}

export const extractSchemaNames = (structure: DatabaseStructure): string[] => {
  return structure.flatMap((item) =>
    item.items.flatMap((db) => db.children.map((schema) => schema.name)),
  )
}

export const extractTableNames = (structure: DatabaseStructure): string[] => {
  return structure.flatMap((item) =>
    item.items.flatMap((db) =>
      db.children.flatMap((schema) =>
        schema.children.map((table) => table.name),
      ),
    ),
  )
}

export const extractColumnNames = (structure: DatabaseStructure): string[] => {
  return structure.flatMap((item) =>
    item.items.flatMap((db) =>
      db.children.flatMap((schema) =>
        schema.children.flatMap((table) =>
          table.children.map((column) => column.name),
        ),
      ),
    ),
  )
}

export const extractQualifiedTableNames = (
  structure: DatabaseStructure,
): string[] => {
  return structure.flatMap((item) =>
    item.items.flatMap((db) =>
      db.children.flatMap((schema) =>
        schema.children.map((table) => `${schema.name}.${table.name}`),
      ),
    ),
  )
}

export const extractTableColumns = (
  structure: DatabaseStructure,
  tableName: string,
): DatabaseColumn[] => {
  for (const item of structure) {
    for (const db of item.items) {
      for (const schema of db.children) {
        for (const table of schema.children) {
          if (table.name === tableName) {
            return table.children
          }
        }
      }
    }
  }
  return []
}

// Import types from CatalogContext
import type { ISectionWithTree } from "@/context/catalog/CatalogContext"

// Adapter function to convert CatalogTreeItem to DatabaseStructure
export const adaptCatalogToDatabase = (
  catalogData: ISectionWithTree[],
): DatabaseStructure => {
  return catalogData.map((section) => ({
    title: section.title,
    items: section.items.map((catalog) => ({
      id: catalog.id,
      pk: catalog.pk || 0,
      name: catalog.name,
      type: "catalog" as const,
      children: (catalog.children || [])
        .filter((child) => child.type === "schema")
        .map((schema) => ({
          id: schema.id,
          pk: schema.pk || 0,
          name: schema.name,
          type: "schema" as const,
          children: (schema.children || [])
            .filter((child) => child.type === "table")
            .map((table) => ({
              id: table.id,
              pk: table.pk || 0,
              name: table.name,
              type: "table" as const,
              schemaName: schema.name,
              children: (table.children || [])
                .filter((child) => child.type === "column")
                .map((column) => ({
                  id: column.id,
                  name: column.name,
                  type: "column" as const,
                  description: column.description || "",
                })),
              childrenLoaded: table.childrenLoaded || false,
            })),
          childrenLoaded: schema.childrenLoaded || false,
        })),
      childrenLoaded: catalog.childrenLoaded || false,
    })),
  }))
}
