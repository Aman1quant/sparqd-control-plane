import { IconFolderFilled } from "@tabler/icons-react"

import Markdown from "@/images/icons/markdown.svg"
import IpynbIco from "@/images/icons/notebook.svg"
import PyIco from "@/images/icons/icon_9.svg"

type FileType = "file" | "notebook" | "directory" | "markdown" | "py" | "text"

const FileIcon = ({ type }: { type: FileType }) => {
  const base = "h-5"
  switch (type) {
    case "directory":
      return <IconFolderFilled className={`${base} text-black-400`} />
    case "markdown":
      return <img src={Markdown} className={base} alt="markdown icon" />
    case "notebook":
      return <img src={IpynbIco} className={base} alt="ipynb icon" />
    case "py":
      return <img src={PyIco} className={base} alt="python icon" />
    default:
      return <img src={Markdown} className={base} alt="markdown icon" />
  }
}

export default FileIcon
