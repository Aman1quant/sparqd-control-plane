import { useLocation } from "react-router-dom"
import { useDetailWorkflow } from "@context/workflow/DetailWorkflow"
import http from "@http/axios"
import endpoint from "@http/endpoint"
import { useEffect, useState } from "react"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { darkula } from "react-syntax-highlighter/dist/cjs/styles/hljs"
import { Button } from "@components/commons"
import { BsArrowClockwise, BsJustify } from "react-icons/bs"

export default function LogPage() {
  const location = useLocation()
  const query = new URLSearchParams(location.search)

  const { runsData, workflowDetail } = useDetailWorkflow()

  const [code, setCode] = useState("")

  const getLogs = async () => {
    try {
      const dagId = workflowDetail.dag_id || ""
      const runId =
        query.get("run_id") ||
        runsData?.dag_runs[runsData?.dag_runs?.length - 1]?.dag_run_id ||
        ""

      const taskId = query.get("task_id") || workflowDetail.dag_id || ""

      const response = await http.get(
        endpoint.dags.run.log(dagId, runId, taskId),
      )

      setCode(response.data)
    } catch (error) {
      console.error("Error fetching data:", error)
    }
  }

  const handleDownload = () => {
    const blob = new Blob([code], { type: "text/plain" })
    const url = URL.createObjectURL(blob)

    const now = new Date()
    const formattedDate = now.toISOString().replace(/[:.]/g, "-")
    const filename = `dag_id=${workflowDetail.dag_id || "unknown"}-${formattedDate}.log`

    const link = document.createElement("a")
    link.href = url
    link.download = filename
    link.click()

    URL.revokeObjectURL(url)
  }

  useEffect(() => {
    if (!workflowDetail.dag_id) return

    getLogs()

    const interval = setInterval(() => {
      getLogs()
    }, 1000)

    return () => clearInterval(interval)
  }, [location.search, workflowDetail.dag_id])

  return (
    <div className="mt-3 text-body-small">
      <div>
        <div className="grid grid-cols-1 md:grid-cols-2 items-center align-middle">
          <label className="font-semibold flex items-center align-middle">
            <BsJustify className="mr-2" />
            Log Data
          </label>
          <div className="flex justify-end items-start align-middle gap-x-2">
            <Button
              variant="outline"
              color="primary"
              size="sm"
              showLabel={false}
              iconLeft={<BsArrowClockwise />}
              onClick={getLogs}
            />
            <Button
              variant="link"
              color="primary"
              size="sm"
              label="Download"
              onClick={handleDownload}
            />
          </div>
        </div>
        <div className="relative mt-2 border border-gray-200 rounded-lg bg-white">
          <div className="max-w-full overflow-auto rounded-lg transition-all duration-300">
            <SyntaxHighlighter
              language="python"
              style={darkula}
              wrapLines={true}
              wrapLongLines={false}
              customStyle={{
                margin: 0,
                padding: "1rem",
                fontSize: "0.85rem",
                whiteSpace: "pre-line",
                overflow: "scroll",
                minWidth: "fit-content",
                maxHeight: "300px",
                wordBreak: "break-all",
              }}
              codeTagProps={{
                style: {
                  whiteSpace: "pre-line",
                  overflowX: "auto",
                },
              }}
            >
              {code}
            </SyntaxHighlighter>
          </div>
        </div>
      </div>
    </div>
  )
}
