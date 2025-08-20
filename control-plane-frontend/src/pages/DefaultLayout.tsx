import React, { useEffect, useState, useRef, Suspense } from "react"
import { Routes, Route, Navigate } from "react-router-dom"
import routes, { type RouteItem } from "@/routes"
import Sidebar from "@components/Sidebar"
import Header from "@components/Header"
import { HeaderProvider } from "@context/layout/header/HeaderContext"
import SearchModal from "@components/SearchModal"
import styles from "./DefaultLayout.module.scss"
import PrivateRoute from "@components/shared/PrivateRoute"
import clsx from "clsx"
import { CreateWorkspaceProvider } from "@context/workspace/CreateWorkspace"

const DefaultLayout: React.FC = () => {
  const [open, setOpen] = useState(true)
  const [openModal, setOpenModal] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        setOpenModal(true)
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [])

  useEffect(() => {
    if (window.innerWidth < 768) {
      setOpen(false)
    } else {
      setOpen(true)
    }
  }, [])

  const getRoutes = (routes: RouteItem[]) =>
    routes.map((prop, key) => {
      if (prop.layout === "/admin" && prop.component && prop.path) {
        const Component = prop.component
        return (
          <Route
            path={`/${prop.path}`}
            element={
              <Suspense
                fallback={
                  <div className="flex h-screen w-full items-center justify-center">
                    Loading...
                  </div>
                }
              >
                <Component />
              </Suspense>
          }
            key={key}
          />
        )
      }
      return null
    })

  return (
    <PrivateRoute>
      <HeaderProvider>
        <CreateWorkspaceProvider>
          <SearchModal open={openModal} onClose={() => setOpenModal(false)} />
          <div id="modal-root"></div>
          <div
            className={clsx(
              styles.layoutWrapper,
              open ? styles.layoutWrapperOpen : styles.layoutWrapperClosed,
            )}
          >
            <Sidebar open={open} setOpen={setOpen} />

            <div className={styles.layoutInner} ref={scrollRef}>
              <Header />
              <div className={styles.layoutContent}>
                <Routes>
                  {getRoutes(routes.map((route) => route.items).flat())}
                  <Route
                    path="/"
                    element={<Navigate to="/admin/default" replace />}
                  />
                </Routes>
              </div>
            </div>
          </div>
        </CreateWorkspaceProvider>
      </HeaderProvider>
    </PrivateRoute>
  )
}

export default DefaultLayout
