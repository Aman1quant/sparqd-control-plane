import { useEffect, useRef, useState, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import { useHeader } from "@context/layout/header/HeaderContext"
import Breadcrumb from "@components/commons/Breadcrumb"
import { Button } from "@components/commons"
import Dropdown from "@components/commons/Dropdown"
import { httpJupyter } from "@http/axios"
import endpoint from "@http/endpoint"
import {
  IconCircleFilled,
  IconShare,
  IconPlayerPlay,
  IconPlayerStop,
} from "@tabler/icons-react"
import WorkspaceToolbar from "./WokspaceToolbar"
import WorkspaceMainContent from "./WorkspaceMainContent"
import WorkspaceSidePanel from "./WorkspaceSidePanel"
import { SideLeft } from "@components/SideNav/SideLeft"
import styles from "./Create.module.scss"
import type { TabType } from "../../../../../types/tabs"
import WorkspaceShareModal from "./WorkspaceShareModal"
import WorkspaceScheduleModal from "./WorkspaceScheduleModal"
import { useCreateWorkspace } from "@context/workspace/CreateWorkspace"

const CreateWorkspaceComponent = () => {
  const { dispatch } = useHeader()
  const {
    selectedPath,
    setSelectedPath,
    setKernelActive,
    startServer,
    stopServer,
    statusServer,
    kernelActive,
  } = useCreateWorkspace()
  const navigate = useNavigate()

  const breadcrumbItems = useMemo(() => {
    const baseBreadcrumb = [
      {
        label: "Workspace",
        href: "/admin/workspace",
        onClick: () => navigate("/admin/workspace"),
        isAction: true,
      },
      {
        label: "Users",
        href: "/admin/workspace",
        onClick: () => navigate("/admin/workspace"),
        isAction: true,
      },
      {
        label: "farhan@gmail.com",
        href: "/admin/workspace",
        onClick: () => navigate("/admin/workspace"),
        isAction: true,
      },
    ]

    if (selectedPath) {
      const pathParts = selectedPath.split("/").filter(Boolean)
      let currentPath = ""

      pathParts.forEach((part, index) => {
        currentPath += (currentPath ? "/" : "") + part
        const pathToNavigate = currentPath
        baseBreadcrumb.push({
          label: part,
          href: "/admin/workspace/create",
          onClick: () => setSelectedPath(pathToNavigate),
          isAction: index === pathParts.length - 1 ? false : true,
        })
      })
    } else {
      baseBreadcrumb.push({
        label: "Untitled",
        href: "/admin/workspace/create",
        onClick: () => {},
        isAction: false,
      })
    }

    return baseBreadcrumb
  }, [selectedPath, setSelectedPath, navigate])

  const [isCatalogOpen, setIsCatalogOpen] = useState(true)
  const [isEditing] = useState(false)
  const [title] = useState("Untitled")
  const [isHovering, setIsHovering] = useState(false)
  const spanRef = useRef<HTMLSpanElement>(null)
  const [activeTab, setActiveTab] = useState<TabType | null>("file_browser")
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false)
  const [serverStatus, setServerStatus] = useState<
    "running" | "stopped" | "loading" | "starting"
  >("loading")
  const [isServerLoading, setIsServerLoading] = useState(false)
  const [isKernelAutoSetting, setIsKernelAutoSetting] = useState(false)
  const [statusPollingInterval, setStatusPollingInterval] =
    useState<NodeJS.Timeout | null>(null)
  const autoSetTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const runningServer = async (name: string) => {
    try {
      const response = await httpJupyter.post(endpoint.jupyter.start_server, {
        profileId: name,
      })

      if (response.data) {
        setKernelActive({
          id: response.data.id,
          name: name,
          last_activity: response.data.last_activity,
          execution_state: response.data.execution_state,
          connections: response.data.connections,
        })
      }
    } catch (error) {
      console.error("Error fetching server status:", error)
    }
  }

  const handleKernelSelection = (serverKey: string) => {
    if (serverStatus === "stopped") {
      toast.error("Please activate server first", {
        position: "top-right",
      })
      return
    } else if (serverStatus === "starting") {
      toast.warning("Server is starting, please wait...", {
        position: "top-right",
      })
      return
    } else if (serverStatus === "loading") {
      toast.info("Checking server status...", {
        position: "top-right",
      })
      return
    }

    runningServer(serverKey)
  }

  const getKernelDropdownLabel = () => {
    if (isKernelAutoSetting) {
      return "Connecting..."
    }

    switch (serverStatus) {
      case "stopped":
        return "Select Kernel"
      case "starting":
        return "Select Kernel"
      case "running":
        return kernelActive?.name || "Select Kernel"
      default:
        return "Select Kernel"
    }
  }

  const autoSetKernelWhenServerRunning = async () => {
    try {
      setIsKernelAutoSetting(true)

      await runningServer("data-eng")
    } catch (error) {
      console.error("Error auto-setting kernel:", error)
      try {
        await runningServer("data-eng")
      } catch (fallbackError) {
        console.error("Fallback kernel creation failed:", fallbackError)
        toast.error("Failed to auto-connect kernel", {
          position: "top-right",
        })
      }
    } finally {
      setIsKernelAutoSetting(false)
    }
  }

  const startStatusPolling = (username: string) => {
    if (statusPollingInterval) {
      clearInterval(statusPollingInterval)
    }

    const interval = setInterval(async () => {
      try {
        const res = await statusServer(username)
        const status = res.status

        if (status === "Active") {
          setServerStatus("running")
          clearInterval(interval)
          setStatusPollingInterval(null)

          if (!kernelActive && !isKernelAutoSetting) {
            if (autoSetTimeoutRef.current) {
              clearTimeout(autoSetTimeoutRef.current)
            }
            autoSetTimeoutRef.current = setTimeout(() => {
              autoSetKernelWhenServerRunning()
            }, 1000)
          }
        } else if (status !== "Starting") {
          setServerStatus("stopped")
          clearInterval(interval)
          setStatusPollingInterval(null)

          if (kernelActive) {
            setKernelActive(null)
          }
        }
      } catch (error) {
        console.error("Error during status polling:", error)
        setServerStatus("stopped")
        clearInterval(interval)
        setStatusPollingInterval(null)
      }
    }, 3000)

    setStatusPollingInterval(interval)
  }

  const checkServerStatus = async (
    username: string = "admin",
    setLoading: boolean = true,
  ) => {
    try {
      if (setLoading) setIsServerLoading(true)
      const res = await statusServer(username)
      const status = res.status

      if (status === "Active") {
        setServerStatus("running")
        if (statusPollingInterval) {
          clearInterval(statusPollingInterval)
          setStatusPollingInterval(null)
        }

        if (!kernelActive && !isKernelAutoSetting) {
          if (autoSetTimeoutRef.current) {
            clearTimeout(autoSetTimeoutRef.current)
          }
          autoSetTimeoutRef.current = setTimeout(() => {
            autoSetKernelWhenServerRunning()
          }, 1000)
        }
      } else if (status === "Starting") {
        setServerStatus("starting")
        if (!statusPollingInterval) {
          startStatusPolling(username)
        }
      } else {
        setServerStatus("stopped")
        if (statusPollingInterval) {
          clearInterval(statusPollingInterval)
          setStatusPollingInterval(null)
        }

        if (kernelActive) {
          setKernelActive(null)
        }
      }
    } catch (error) {
      console.error("Error checking server status:", error)
      setServerStatus("stopped")
      if (statusPollingInterval) {
        clearInterval(statusPollingInterval)
        setStatusPollingInterval(null)
      }
    } finally {
      if (setLoading) setIsServerLoading(false)
    }
  }

  const handleToggleServer = async () => {
    const username = "admin"
    setIsServerLoading(true)

    try {
      if (serverStatus === "running") {
        await stopServer(username)

        await checkServerStatus(username, false)
      } else {
        await startServer(username)

        await checkServerStatus(username, false)
      }
    } catch (error) {
      console.error("Error toggling server:", error)

      await checkServerStatus(username, false)
    } finally {
      setIsServerLoading(false)
    }
  }

  const getServerButtonProps = () => {
    if (isServerLoading) {
      return {
        label: "Loading...",
        iconLeft: <IconPlayerPlay size={20} />,
        disabled: true,
      }
    }

    if (serverStatus === "starting") {
      return {
        label: "Starting...",
        iconLeft: <IconPlayerPlay size={20} />,
        disabled: true,
      }
    }

    if (serverStatus === "running") {
      return {
        label: "Stop Server",
        iconLeft: <IconPlayerStop size={20} />,
        disabled: false,
      }
    }

    return {
      label: "Start Server",
      iconLeft: <IconPlayerPlay size={20} />,
      disabled: false,
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

  const handleTabClick = (tab: TabType) => {
    setActiveTab(tab)
    setIsCatalogOpen(true)
  }

  useEffect(() => {
    if (spanRef.current) {
      // const spanWidth = spanRef.current.offsetWidth
      // const maxWidth = 495
      // setInputWidth(Math.min(spanWidth + 1, maxWidth))
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

  useEffect(() => {
    checkServerStatus()
  }, [])

  useEffect(() => {
    return () => {
      if (statusPollingInterval) {
        clearInterval(statusPollingInterval)
      }
      if (autoSetTimeoutRef.current) {
        clearTimeout(autoSetTimeoutRef.current)
      }
    }
  }, [])

  return (
    <div className="bg-white rounded-2xl flex flex-col h-full">
      <div className="flex items-center justify-between border-b">
        <WorkspaceToolbar />
        <SideLeft activeTab={activeTab} setActiveTab={handleTabClick} />
      </div>
      <div className="flex select-none flex-1">
        <WorkspaceSidePanel
          isCatalogOpen={isCatalogOpen}
          setIsCatalogOpen={setIsCatalogOpen}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
        <div className="relative flex flex-col flex-1 min-w-0">
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
                {/* {title || " "} */}
              </span>
            </div>
            <div className="text-body-large ml-2">
              {/* <IconStar size={16} /> */}
            </div>
            <div className="items-center justify-between flex ml-auto p-3 gap-x-2">
              <Button
                variant="outline"
                color="primary"
                size="sm"
                iconLeft={<IconShare size={20} />}
                showLabel={false}
                onClick={() => setIsShareModalOpen(true)}
              />
              <Button
                variant="outline"
                color="primary"
                size="sm"
                {...getServerButtonProps()}
                onClick={handleToggleServer}
              />
              <Dropdown
                items={profileServer.map((server) => ({
                  onClick: () => {
                    handleKernelSelection(server.key)
                  },
                  label: `${server.key} (${server.cpu} CPU, ${server.memory})`,
                }))}
                theme="outline"
                size="sm"
                showArrow={true}
                disabled={isKernelAutoSetting || serverStatus !== "running"}
                label={
                  <span className="flex items-center font-medium gap-x-2 pl-1">
                    <IconCircleFilled size={12} className={styles.pulse} />
                    {getKernelDropdownLabel()}
                  </span>
                }
              />
              <Button
                variant="outline"
                color="primary"
                size="sm"
                label="Schedule (1)"
                onClick={() => setIsScheduleModalOpen(true)}
              />
            </div>
          </div>
          <div className="bg-gray-50 rounded-br-2xl flex-1 overflow-y-auto mt-2">
            <WorkspaceMainContent />
          </div>
        </div>
      </div>
      {isShareModalOpen && (
        <WorkspaceShareModal
          onClose={() => setIsShareModalOpen(false)}
          title={title}
        />
      )}
      {isScheduleModalOpen && (
        <WorkspaceScheduleModal
          onClose={() => setIsScheduleModalOpen(false)}
          title={title}
        />
      )}
    </div>
  )
}

const CreateWorkspace = () => {
  return <CreateWorkspaceComponent />
}

export default CreateWorkspace
