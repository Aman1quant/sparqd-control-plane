import { useDetailWorkflow } from "@context/workflow/DetailWorkflow"
import http from "@http/axios"
import endpoint from "@http/endpoint"
import { useEffect, useState } from "react"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { darkula } from "react-syntax-highlighter/dist/cjs/styles/hljs"

export default function CodeViewer() {
  const { workflowDetail } = useDetailWorkflow()
  const [code, setCode] = useState("")

  const getCode = async (token: string) => {
    try {
      const response = await http.get(endpoint.dagSource.file(token))
      setCode(response.data)
    } catch (error) {
      console.error("Error fetching code:", error)
    }
  }

  useEffect(() => {
    if (workflowDetail.file_token) {
      getCode(workflowDetail.file_token)
    }
  }, [workflowDetail.file_token])

  return (
    <div className="mt-3 text-body-small">
      <span className="text-black font-bold">Parsed at: Mar 16, 2025</span>

      <div className="relative mt-2 border border-gray-200 rounded-lg bg-white">
        <div className="max-w-full overflow-auto rounded-lg transition-all duration-300">
          <SyntaxHighlighter
            language="python"
            style={darkula}
            showLineNumbers
            wrapLines={true}
            wrapLongLines={false}
            customStyle={{
              margin: 0,
              padding: "1rem",
              fontSize: "0.85rem",
              whiteSpace: "pre-wrap",
              overflow: "auto",
              minWidth: "fit-content",
              maxHeight: "300px",
            }}
            codeTagProps={{
              style: {
                whiteSpace: "pre-wrap",
                overflowX: "auto",
              },
            }}
          >
            {code}
          </SyntaxHighlighter>
        </div>
      </div>
    </div>
  )
}
