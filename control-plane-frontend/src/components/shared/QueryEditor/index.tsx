import React, { useEffect, useRef } from "react"

import { EditorState } from "@codemirror/state"
import { EditorView, lineNumbers, keymap } from "@codemirror/view"
import { history, defaultKeymap } from "@codemirror/commands"
import { foldGutter, indentOnInput } from "@codemirror/language"
import { autocompletion } from "@codemirror/autocomplete"
import { sql } from "@codemirror/lang-sql"
import { oneDark } from "@codemirror/theme-one-dark"

interface QueryEditorProps {
  initialValue?: string
  onChange?: (value: string) => void
  extensions?: any[]
  theme?: "light" | "dark"
  className?: string
}

const QueryEditor: React.FC<QueryEditorProps> = ({
  initialValue = "select *\nfrom digital_inventory_log limit 10;",
  onChange,
  extensions = [],
  theme = "dark",
  className,
}) => {
  const editorRef = useRef<HTMLDivElement>(null)
  const editorViewRef = useRef<EditorView | null>(null)

  useEffect(() => {
    if (editorRef.current) {
      const updateListener = EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          const newValue = update.state.doc.toString()
          if (onChange) {
            onChange(newValue)
          }
        }
      })

      const state = EditorState.create({
        doc: initialValue,
        extensions: [
          lineNumbers(),
          history(),
          foldGutter(),
          indentOnInput(),
          // bracketMatching(),
          // closeBrackets(),
          autocompletion(),
          // rectangularSelection(),
          // defaultHighlightStyle,
          keymap.of(defaultKeymap),
          sql(),
          theme === "dark"
            ? oneDark
            : EditorView.theme({
                "&": { backgroundColor: "white", color: "black" },
              }),
          updateListener,
          ...extensions,
        ],
      })

      editorViewRef.current = new EditorView({
        state,
        parent: editorRef.current,
      })
    }

    return () => {
      if (editorViewRef.current) {
        editorViewRef.current.destroy()
      }
    }
  }, [initialValue, onChange, extensions, theme])

  return <div ref={editorRef} className={className} />
}

export default QueryEditor
