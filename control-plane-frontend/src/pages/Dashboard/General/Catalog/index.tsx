import { useEffect, useRef, useState } from "react"

import { useHeader } from "@context/layout/header/HeaderContext"
import styles from "./Catalog.module.scss"
// import Sidepanel from "@components/Sidepanel"
// import NotebookCell from "./Notebook"
import { Select } from "@components/commons"
import { BsStar } from "react-icons/bs"

const options = [
  { value: "py", label: "Python" },
  { value: "sql", label: "SQL" },
]

const Catalog = () => {
  const { dispatch } = useHeader()

  useEffect(() => {
    dispatch({
      type: "SET_HEADER",
      payload: {
        title: "Catalog",
        description: "A Short description will be placed right over here",
        search: true,
      },
    })
  }, [dispatch])

  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitle] = useState("Untitled")
  const [isHovering, setIsHovering] = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)
  const spanRef = useRef<HTMLSpanElement>(null)
  const [inputWidth, setInputWidth] = useState(0)

  useEffect(() => {
    if (spanRef.current) {
      const spanWidth = spanRef.current.offsetWidth
      const maxWidth = 495
      setInputWidth(Math.min(spanWidth + 1, maxWidth))
    }
  }, [title, isEditing, isHovering])

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

  const [selectedValue, setSelectedValue] = useState<string | number>("all")

  return (
    <div className={styles.catalogContentWrapper}>
      <div className="flex items-center">
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
          <BsStar />
        </div>
        <Select
          options={options}
          value={selectedValue}
          onChange={(option) => setSelectedValue(option)}
          className={styles.catalogSelectLanguage}
        />
        {/* <div className="items-center justify-between flex ml-auto p-3">
          <Button
            variant="outline"
            color="primary"
            size="sm"
            className={styles.runAllButton}
            onClick={() => console.log("Save")}
          >
            <BsPlayFill className="mr-2" />
            Run All
          </Button>{" "}
          <Button
            theme="secondary"
            size="sm"
            className={styles.runAllButton}
            onClick={() => console.log("Save")}
          >
            <BsCircleFill className="pl-1 mr-2" />
            Connect
          </Button>
          <Button
            theme="secondary"
            size="sm"
            className={styles.runAllButton}
            onClick={() => console.log("Save")}
          >
            Schedule
          </Button>
          <Button
            theme="primary"
            size="sm"
            className={styles.runAllButton}
            onClick={() => console.log("Save")}
          >
            Share
          </Button>
        </div> */}
      </div>

      {/* <div className={styles.wholeContent}>
        <Sidepanel />
        <main className={styles.mainContent}>
          <NotebookCell initialCode={`"Hello, world!"`} />
        </main>
      </div> */}
    </div>
  )
}

export default Catalog
