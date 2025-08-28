import { useEffect, useRef, useState } from "react"

import { useHeader } from "@context/layout/header/HeaderContext"
import { CreateWorkspaceProvider } from "@context/workspace/CreateWorkspace"
import Breadcrumb from "@components/commons/Breadcrumb"
import { Button } from "@components/commons"
import Dropdown from "@components/commons/Dropdown"
import { httpJupyter } from "@http/axios"
import endpoint from "@http/endpoint"
import { IconCircleFilled, IconShare, IconStar } from "@tabler/icons-react"

import WorkspaceToolbar from "./WokspaceToolbar"
import WorkspaceMainContent from "./WorkspaceMainContent"
import WorkspaceSidePanel from "./WorkspaceSidePanel"
import styles from "./Create.module.scss"

const CreateWorkspaceComponent = () => {
  const { dispatch } = useHeader()

  const breadcrumbItems = [
    { label: "Workspace", href: "/admin/workspace", isActive: false },
    { label: "Name", isActive: true },
  ]

  const [isCatalogOpen, setIsCatalogOpen] = useState(true)

  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitle] = useState("Untitled")
  const [isHovering, setIsHovering] = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)
  const spanRef = useRef<HTMLSpanElement>(null)
  const [inputWidth, setInputWidth] = useState(0)

  const handleBlur = () => {
    if (!title.trim()) setTitle("Untitled")
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      if (!title.trim()) setTitle("Untitled")
      setIsEditing(false)
    }
  }

  /* fetch */

  const runningServer = async (name: string) => {
    try {
      await httpJupyter.post(endpoint.jupyter.start_server, {
        profileId: name,
      })
    } catch (error) {
      console.error("Error fetching server status:", error)
    }
  }

  const profileServer = [
    {
      key: "data-eng",
      image: "qdsparq/jupyter-pyspark-delta",
      cpu: 2,
      memory: "8G",
      description: "Data Engineering (CPU)",
    },
    {
      key: "small-notebook",
      image: "qdsparq/jupyter-pyspark-delta",
      cpu: 1,
      memory: "2G",
      description: "Small Notebook (Test)",
    },
    {
      key: "memory-opt",
      image: "qdsparq/jupyter-pyspark-delta",
      cpu: 2,
      memory: "16G",
      description: "Memory Optimized Notebook",
    },
  ]

  useEffect(() => {
    if (spanRef.current) {
      const spanWidth = spanRef.current.offsetWidth
      const maxWidth = 495
      setInputWidth(Math.min(spanWidth + 1, maxWidth))
    }
  }, [title, isEditing, isHovering])

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

  return (
    <div className="bg-white rounded-2xl overflow-x-clip md:overflow-x-hidden">
      <WorkspaceToolbar />
      <div className="flex select-none">
        <WorkspaceSidePanel
          isCatalogOpen={isCatalogOpen}
          setIsCatalogOpen={setIsCatalogOpen}
        />
        <div
          className={`relative ms-2 flex flex-col overflow-x-auto md:overflow-x-hidden ${isCatalogOpen ? "w-[76%]" : "w-full"}`}
        >
          <div className="px-3 pt-4">
            <Breadcrumb items={breadcrumbItems} />
          </div>
          <div className="flex items-center overflow-y-hidden overflow-x-auto">
            <div
              className={styles.titleWrapper}
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
            >
              <span ref={spanRef} className={styles.titleSpan} aria-hidden>
                {title || " "}
              </span>

              {isEditing ? (
                <input
                  ref={inputRef}
                  type="text"
                  className={styles.titleInputEditable}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onBlur={handleBlur}
                  onKeyDown={handleKeyDown}
                  autoFocus
                  style={{
                    width: `${inputWidth}px`,
                    minWidth: "1ch",
                  }}
                />
              ) : isHovering ? (
                <input
                  type="text"
                  readOnly
                  className={styles.titleInputReadonly}
                  value={title}
                  onClick={() => setIsEditing(true)}
                  style={{
                    width: `${inputWidth}px`,
                    minWidth: "1ch",
                  }}
                />
              ) : (
                <h1
                  className={styles.titleHeading}
                  onClick={() => setIsEditing(true)}
                  style={{
                    width: `${inputWidth}px`,
                    maxWidth: "500px",
                  }}
                >
                  {title}
                </h1>
              )}
            </div>
            <div className="text-body-large ml-2">
              <IconStar size={16} />
            </div>
            {/* <Select
            options={options}
            value={selectedValue}
            onChange={(option) => setSelectedValue(option)}
            className={styles.catalogSelectLanguage}
          /> */}
            <div className="items-center justify-between flex ml-auto p-3 gap-x-2">
              <Button
                variant="outline"
                color="primary"
                size="sm"
                iconLeft={<IconShare size={20} />}
                showLabel={false}
                onClick={() => console.log("Save")}
              />
              <Dropdown
                items={profileServer.map((server) => ({
                  onClick: () => {
                    runningServer(server.key)
                  },
                  label: `${server.key} (${server.cpu} CPU, ${server.memory})`,
                }))}
                theme="outline"
                size="sm"
                showArrow={true}
                label={
                  <span className="flex items-center font-medium gap-x-2 pl-1">
                    <IconCircleFilled size={12} className={styles.pulse} />
                    Connect
                  </span>
                }
              />
              <Button
                variant="outline"
                color="primary"
                size="sm"
                label="Schedule (1)"
                onClick={() => console.log("Save")}
              />
            </div>
          </div>
          <div className="bg-gray-50 rounded-br-2xl h-full overflow-y-auto mt-2">
            <WorkspaceMainContent />
          </div>
        </div>
      </div>
    </div>
  )
}

const CreateWorkspace = () => {
  return (
    <CreateWorkspaceProvider>
      <CreateWorkspaceComponent />
    </CreateWorkspaceProvider>
  )
}

export default CreateWorkspace
