import {
  IconDatabase,
  IconFolderFilled,
  IconMarkdown,
  IconNotebook,
} from "@tabler/icons-react"

// import Markdown from "@/images/icons/markdown.svg"
// import IpynbIco from "@/images/icons/ipynb_icon.svg"
import PyIco from "@/images/icons/icon_9.svg"
// import SqlIco from "@/images/icons/sql_icon.svg"

type FileType =
  | "file"
  | "code"
  | "notebook"
  | "ipynb"
  | "directory"
  | "markdown"
  | "py"
  | "text"
  | "sql"
  | "folder"

const FileIcon = ({ type }: { type: FileType }) => {
  const base = "h-5"
  switch (type) {
    case "directory":
      return <IconFolderFilled size={18} className={`${base} text-black-400`} />
    case "markdown":
      return <IconMarkdown size={18} className={`${base} text-black-800`} />
    case "notebook":
      return <IconNotebook size={18} className={`${base} text-primary`} />
    case "ipynb":
      return <IconNotebook size={18} className={`${base} text-primary`} />
    case "py":
      return <img src={PyIco} className={base} alt="python icon" />
    case "sql":
      return <IconDatabase size={18} className={`${base} text-black-800`} />
    case "folder":
      return <IconFolderFilled size={18} className={`${base} text-primary`} />
    case "file":
      return <IconNotebook size={18} className={`${base} text-primary`} />
    default:
      return <IconMarkdown size={18} className={`${base} text-purple-900`} />
  }
}

export default FileIcon
