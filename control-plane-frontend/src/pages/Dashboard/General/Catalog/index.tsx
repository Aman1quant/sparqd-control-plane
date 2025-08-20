import { useEffect } from "react"
import { Routes, Route } from "react-router-dom"

import { useHeader } from "@context/layout/header/HeaderContext"
import { useCatalog } from "@context/catalog/CatalogContext"

import CatalogMenu from "./CatalogMenu"
import CatalogList from "./CatalogList"
import CatalogDetail from "./CatalogDetail"
import Create from "./Create"
import EditDescriptionModal from "./EditDescriptionModal"
import SetOwnerModal from "./SetOwnerModal"
import CreateSchemaModal from "./CreateSchemaModal"
import styles from "./Catalog.module.scss"

const CatalogPageContent = () => {
  const {
    isCreateModalOpen,
    isEditModalOpen,
    isSetOwnerModalOpen,
    isCreateSchemaModalOpen,
  } = useCatalog()

  return (
    <div className={styles.container}>
      <CatalogMenu />
      <main className={styles.contentWrapper}>
        <Routes>
          <Route index element={<CatalogList />} />
          <Route path=":catalogName" element={<CatalogDetail />} />
          <Route path=":catalogName/:schemaName" element={<CatalogDetail />} />
          <Route
            path=":catalogName/:schemaName/:tableName"
            element={<CatalogDetail />}
          />
        </Routes>
      </main>
      {isCreateModalOpen && <Create />}
      {isEditModalOpen && <EditDescriptionModal />}
      {isSetOwnerModalOpen && <SetOwnerModal />}
      {isCreateSchemaModalOpen && <CreateSchemaModal />}
    </div>
  )
}

const Catalog = () => {
  const { dispatch } = useHeader()

  useEffect(() => {
    dispatch({
      type: "SET_HEADER",
      payload: {
        title: "",
        description: "",
        search: true,
      },
    })
  }, [dispatch])

  return <CatalogPageContent />
}

export default Catalog
