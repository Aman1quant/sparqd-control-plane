import {
  IconBrandBitbucketFilled,
  IconFolderFilled,
  IconList,
} from "@tabler/icons-react"
import type { TabType } from "../../types/tabs"
import { BsGit, BsPuzzleFill, BsStopCircleFill } from "react-icons/bs"
import { useCreateWorkspace } from "@context/workspace/CreateWorkspace"

interface SideLeftProps {
  activeTab: TabType | null
  setActiveTab: (tab: TabType) => void
}

export const SideLeft = ({ activeTab, setActiveTab }: SideLeftProps) => {
  const { setSelectedPath } = useCreateWorkspace()

  const iconStyle = (tab: TabType) =>
    `text-lg p-2 rounded ${
      activeTab === tab
        ? "bg-primary-50 hover:bg-primary-100"
        : "bg-transparent hover:bg-gray-100"
    }`

  const iconColor = (tab: TabType) =>
    activeTab === tab ? "text-primary" : "text-black-400"

  const handleClickTab = (tab: TabType) => {
    setActiveTab(tab)
    setSelectedPath("")
  }

  return (
    <div className="flex flex-row items-center p-2 space-x-4">
      <button
        className={iconStyle("object_file")}
        title="Object File"
        onClick={() => handleClickTab("object_file")}
      >
        <IconBrandBitbucketFilled
          size={20}
          className={iconColor("object_file")}
        />
      </button>
      <button
        className={iconStyle("file_browser")}
        title="File Browser"
        onClick={() => handleClickTab("file_browser")}
      >
        <IconFolderFilled size={20} className={iconColor("file_browser")} />
      </button>
      <button
        className={iconStyle("run")}
        title="Run"
        onClick={() => handleClickTab("run")}
      >
        <BsStopCircleFill className={iconColor("run")} />
      </button>
      <button
        className={iconStyle("git")}
        title="Git"
        onClick={() => handleClickTab("git")}
      >
        <BsGit className={iconColor("git")} />
      </button>
      <button
        className={iconStyle("table_contents")}
        title="Table Contents"
        onClick={() => handleClickTab("table_contents")}
      >
        <IconList size={20} className={iconColor("table_contents")} />
      </button>
      <button
        className={iconStyle("extension")}
        title="Extension"
        onClick={() => handleClickTab("extension")}
      >
        <BsPuzzleFill className={iconColor("extension")} />
      </button>
    </div>
  )
}
