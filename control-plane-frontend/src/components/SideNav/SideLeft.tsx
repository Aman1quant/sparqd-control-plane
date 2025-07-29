import {
  IconBrandBitbucketFilled,
  IconFolderFilled,
  IconList,
} from "@tabler/icons-react"
import type { TabType } from "../../types/tabs"
import { BsGit, BsPuzzleFill, BsStopCircleFill } from "react-icons/bs"

interface SideLeftProps {
  activeTab: TabType | null
  setActiveTab: (tab: TabType) => void
}

export const SideLeft = ({ activeTab, setActiveTab }: SideLeftProps) => {
  const iconStyle = (tab: TabType) =>
    `text-lg p-2 rounded ${
      activeTab === tab
        ? "bg-primary-50 hover:bg-primary-100"
        : "bg-transparent hover:bg-gray-100"
    }`

  const iconColor = (tab: TabType) =>
    activeTab === tab ? "text-primary" : "text-black-400"

  return (
    <div className="w-12 flex flex-col items-center py-2 space-y-6">
      <button
        className={iconStyle("object_file")}
        title="Object File"
        onClick={() => setActiveTab("object_file")}
      >
        <IconBrandBitbucketFilled
          size={20}
          className={iconColor("object_file")}
        />
      </button>
      <button
        className={iconStyle("file_browser")}
        title="File Browser"
        onClick={() => setActiveTab("file_browser")}
      >
        <IconFolderFilled size={20} className={iconColor("file_browser")} />
      </button>
      <button
        className={iconStyle("run")}
        title="Run"
        onClick={() => setActiveTab("run")}
      >
        <BsStopCircleFill className={iconColor("run")} />
      </button>
      <button
        className={iconStyle("git")}
        title="Git"
        onClick={() => setActiveTab("git")}
      >
        <BsGit className={iconColor("git")} />
      </button>
      <button
        className={iconStyle("table_contents")}
        title="Table Contents"
        onClick={() => setActiveTab("table_contents")}
      >
        <IconList size={20} className={iconColor("table_contents")} />
      </button>
      <button
        className={iconStyle("extension")}
        title="Extension"
        onClick={() => setActiveTab("extension")}
      >
        <BsPuzzleFill className={iconColor("extension")} />
      </button>
    </div>
  )
}
