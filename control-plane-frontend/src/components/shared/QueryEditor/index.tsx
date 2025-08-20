import {
  useRef,
  useCallback,
  useEffect,
  useMemo,
  useImperativeHandle,
  forwardRef,
} from "react"
import MonacoEditor, { type OnMount, type OnChange } from "@monaco-editor/react"
import * as monaco from "monaco-editor"
import {
  extractDatabaseNames,
  extractSchemaNames,
  extractTableNames,
  extractColumnNames,
  extractQualifiedTableNames,
  adaptCatalogToDatabase,
} from "@/types/database"
import type { ISectionWithTree } from "@/context/catalog/CatalogContext"

export interface QueryEditorRef {
  getSelectedText: () => string
  getSelectedTextOrCurrentLine: () => string
}

interface QueryEditorProps {
  value?: string
  onChange?: (value: string) => void
  theme?: "light" | "dark"
  className?: string
  placeholder?: string
  readOnly?: boolean
  height?: string | number
  language?: string
  onSave?: () => void
  onRun?: () => void
  onRunSelection?: (selectedText: string) => void
  loading?: boolean
  databaseStructure?: ISectionWithTree[]
  onSelectionChange?: (hasSelection: boolean) => void;
}

const QueryEditor = forwardRef<QueryEditorRef, QueryEditorProps>(
  (
    {
      value = "",
      onChange,
      theme = "dark",
      className,
      placeholder = "-- Write your SQL query here...",
      readOnly = false,
      height = "100%",
      language = "sql",
      onSave,
      onRun,
      onRunSelection,
      loading = false,
      databaseStructure,
      onSelectionChange
    },
    ref,
  ) => {
    const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null)
    const completionProviderRef = useRef<monaco.IDisposable | null>(null)
    const hoverProviderRef = useRef<monaco.IDisposable | null>(null)

    const onRunRef = useRef(onRun);
    const onRunSelectionRef = useRef(onRunSelection);

    useEffect(() => {
      onRunRef.current = onRun;
      onRunSelectionRef.current = onRunSelection;
    }, [onRun, onRunSelection]);

    // Expose methods to parent component
    useImperativeHandle(
      ref,
      () => ({
        getSelectedText: () => {
          if (!editorRef.current) return ""
          const selection = editorRef.current.getSelection()
          if (selection && !selection.isEmpty()) {
            return (
              editorRef.current.getModel()?.getValueInRange(selection) || ""
            )
          }
          return ""
        },
        getSelectedTextOrCurrentLine: () => {
          if (!editorRef.current) return ""
          const selection = editorRef.current.getSelection()
          if (selection && !selection.isEmpty()) {
            return (
              editorRef.current.getModel()?.getValueInRange(selection) || ""
            )
          } else {
            // If no selection, get current line
            const position = editorRef.current.getPosition()
            if (position) {
              const lineContent =
                editorRef.current
                  .getModel()
                  ?.getLineContent(position.lineNumber) || ""
              return lineContent.trim()
            }
          }
          return ""
        },
      }),
      [],
    )

    // Memoize the dynamic data extraction to avoid unnecessary recalculations
    const dynamicSuggestions = useMemo(() => {
      const adaptedStructure = databaseStructure
        ? adaptCatalogToDatabase(databaseStructure)
        : null

      return {
        databaseNames: adaptedStructure
          ? extractDatabaseNames(adaptedStructure)
          : ["trino"],
        schemaNames: adaptedStructure
          ? extractSchemaNames(adaptedStructure)
          : ["quantdata", "information_schema", "default"],
        tableNames: adaptedStructure
          ? extractTableNames(adaptedStructure)
          : [
              "users",
              "products",
              "orders",
              "customers",
              "transactions",
              "categories",
              "inventory",
              "employees",
              "departments",
              "sales",
              "analytics",
              "logs",
            ],
        qualifiedTableNames: adaptedStructure
          ? extractQualifiedTableNames(adaptedStructure)
          : [],
        columnNames: adaptedStructure
          ? extractColumnNames(adaptedStructure)
          : [
              "id",
              "name",
              "email",
              "created_at",
              "updated_at",
              "deleted_at",
              "status",
              "type",
              "category",
              "description",
              "amount",
              "quantity",
              "price",
              "date",
              "timestamp",
              "user_id",
              "product_id",
              "order_id",
            ],
      }
    }, [databaseStructure])

    // Function to register completion provider
    const registerCompletionProvider = useCallback(
      (monacoInstance: typeof monaco) => {
        // Dispose existing provider if exists
        if (completionProviderRef.current) {
          completionProviderRef.current.dispose()
        }

        // SQL Keywords
        const sqlKeywords = [
          "SELECT", "FROM", "WHERE", "INSERT", "UPDATE", "DELETE", "CREATE", "DROP", "ALTER",
          "TABLE", "INDEX", "VIEW", "JOIN", "INNER", "LEFT", "RIGHT", "FULL", "ON", "AS",
          "AND", "OR", "NOT", "NULL", "IS", "IN", "LIKE", "BETWEEN", "ORDER", "BY", "GROUP",
          "HAVING", "LIMIT", "OFFSET", "DISTINCT", "COUNT", "SUM", "AVG", "MIN", "MAX",
          "CASE", "WHEN", "THEN", "ELSE", "END", "UNION", "ALL", "EXISTS", "ANY", "SOME",
          "SUBSTRING", "CAST", "CONVERT",
        ]

        // Register new completion provider
        completionProviderRef.current =
          monacoInstance.languages.registerCompletionItemProvider(language, {
            provideCompletionItems: (model, position) => {
              const word = model.getWordUntilPosition(position)
              const range = {
                startLineNumber: position.lineNumber,
                endLineNumber: position.lineNumber,
                startColumn: word.startColumn,
                endColumn: word.endColumn,
              }

              const suggestions: monaco.languages.CompletionItem[] = [
                // SQL Keywords
                ...sqlKeywords.map((keyword) => ({
                  label: keyword,
                  kind: monacoInstance.languages.CompletionItemKind.Keyword,
                  insertText: keyword,
                  range,
                  detail: "SQL Keyword",
                })),
                // Database names
                ...dynamicSuggestions.databaseNames.map((database) => ({
                  label: database,
                  kind: monacoInstance.languages.CompletionItemKind.Module,
                  insertText: database,
                  range,
                  detail: "Database",
                })),
                // Schema names
                ...dynamicSuggestions.schemaNames.map((schema) => ({
                  label: schema,
                  kind: monacoInstance.languages.CompletionItemKind.Folder,
                  insertText: schema,
                  range,
                  detail: "Schema",
                })),
                // Table names (simple)
                ...dynamicSuggestions.tableNames.map((table) => ({
                  label: table,
                  kind: monacoInstance.languages.CompletionItemKind.Class,
                  insertText: table,
                  range,
                  detail: "Table",
                })),
                // Qualified table names (schema.table)
                ...dynamicSuggestions.qualifiedTableNames.map(
                  (qualifiedTable) => ({
                    label: qualifiedTable,
                    kind: monacoInstance.languages.CompletionItemKind.Class,
                    insertText: qualifiedTable,
                    range,
                    detail: "Qualified Table",
                  }),
                ),
                // Column names
                ...dynamicSuggestions.columnNames.map((column) => ({
                  label: column,
                  kind: monacoInstance.languages.CompletionItemKind.Field,
                  insertText: column,
                  range,
                  detail: "Column",
                })),
                // SQL Functions
                {
                  label: "COUNT(*)",
                  kind: monacoInstance.languages.CompletionItemKind.Function,
                  insertText: "COUNT(*)",
                  range,
                  detail: "Aggregate Function",
                },
                {
                  label: "DATE_FORMAT",
                  kind: monacoInstance.languages.CompletionItemKind.Function,
                  insertText: "DATE_FORMAT(${1:date_column}, '${2:%Y-%m-%d}')",
                  insertTextRules:
                    monacoInstance.languages.CompletionItemInsertTextRule
                      .InsertAsSnippet,
                  range,
                  detail: "Date Function",
                },
                // Context-aware suggestions
                ...(word.word.includes(".")
                  ? []
                  : [
                      {
                        label: "schema.table",
                        kind: monacoInstance.languages.CompletionItemKind
                          .Snippet,
                        insertText: "${1:schema}.${2:table}",
                        insertTextRules:
                          monacoInstance.languages.CompletionItemInsertTextRule
                            .InsertAsSnippet,
                        range,
                        detail: "Schema.Table pattern",
                      },
                    ]),
              ]

              return { suggestions }
            },
          })
      },
      [language, dynamicSuggestions],
    )

    // Function to register hover provider
    const registerHoverProvider = useCallback(
      (monacoInstance: typeof monaco) => {
        // Dispose existing provider if exists
        if (hoverProviderRef.current) {
          hoverProviderRef.current.dispose()
        }

        const sqlKeywords = [
            "SELECT", "FROM", "WHERE", "INSERT", "UPDATE", "DELETE", "CREATE", "DROP", "ALTER",
            "TABLE", "INDEX", "VIEW", "JOIN", "INNER", "LEFT", "RIGHT", "FULL", "ON", "AS",
            "AND", "OR", "NOT", "NULL", "IS", "IN", "LIKE", "BETWEEN", "ORDER", "BY", "GROUP",
            "HAVING", "LIMIT", "OFFSET", "DISTINCT", "COUNT", "SUM", "AVG", "MIN", "MAX",
            "CASE", "WHEN", "THEN", "ELSE", "END", "UNION", "ALL", "EXISTS", "ANY", "SOME",
            "SUBSTRING", "CAST", "CONVERT",
        ]

        hoverProviderRef.current =
          monacoInstance.languages.registerHoverProvider(language, {
            provideHover: (model, position) => {
              const word = model.getWordAtPosition(position)
              if (word && sqlKeywords.includes(word.word.toUpperCase())) {
                return {
                  range: new monacoInstance.Range(
                    position.lineNumber,
                    word.startColumn,
                    position.lineNumber,
                    word.endColumn,
                  ),
                  contents: [
                    { value: `**${word.word.toUpperCase()}**` },
                    { value: "SQL Keyword" },
                  ],
                }
              }
              return null
            },
          })
      },
      [language],
    )

    const handleEditorMount: OnMount = useCallback(
      (editor, monacoInstance) => {
        editorRef.current = editor

        editor.onDidChangeCursorSelection((e) => {
          if (onSelectionChange) {
            const hasSelection = !e.selection.isEmpty();
            onSelectionChange(hasSelection);
          }
        });

        // Set placeholder text
        if (!value && placeholder) {
          editor.setValue(placeholder)
          editor.setSelection(new monacoInstance.Selection(1, 1, 1, 1))
        }

        // Method to get selected text or current line
        // const getSelectedTextOrCurrentLine = () => {
        //   const selection = editor.getSelection()
        //   if (selection && !selection.isEmpty()) {
        //     return editor.getModel()?.getValueInRange(selection) || ""
        //   } else {
        //     // If no selection, get current line
        //     const position = editor.getPosition()
        //     if (position) {
        //       const lineContent =
        //         editor.getModel()?.getLineContent(position.lineNumber) || ""
        //       return lineContent.trim()
        //     }
        //   }
        //   return ""
        // }

        // Keyboard shortcuts
        editor.addCommand(
          monacoInstance.KeyMod.CtrlCmd | monacoInstance.KeyCode.KeyS,
          () => {
            onSave?.()
          },
        )

        // FIX: Run full query - Ctrl+Enter
        editor.addCommand(
          monacoInstance.KeyMod.CtrlCmd | monacoInstance.KeyCode.Enter,
          () => {
            // This shortcut should only trigger onRun, not onRunSelection
            onRunRef.current?.();
          },
        )
        
        editor.addCommand(
          monacoInstance.KeyMod.CtrlCmd |
            monacoInstance.KeyMod.Shift |
            monacoInstance.KeyCode.Enter,
          () => {
            onRunRef.current?.();
          },
        );

        // Register completion and hover providers
        registerCompletionProvider(monacoInstance)
        registerHoverProvider(monacoInstance)
      },
      [
        value,
        placeholder,
        onSave,
        onRun,
        onRunSelection,
        registerCompletionProvider,
        registerHoverProvider,
        onSelectionChange
      ],
    )

    // Update providers when databaseStructure changes
    useEffect(() => {
      if (editorRef.current) {
        const monacoInstance = (window as any).monaco
        if (monacoInstance) {
          registerCompletionProvider(monacoInstance)
          registerHoverProvider(monacoInstance)
        }
      }
    }, [databaseStructure, registerCompletionProvider, registerHoverProvider])

    const handleEditorChange: OnChange = useCallback(
      (val) => {
        if (val !== placeholder) {
          onChange?.(val || "")
        }
      },
      [onChange, placeholder],
    )

    // Handle placeholder clearing
    useEffect(() => {
      if (editorRef.current && value && value !== placeholder) {
        const currentValue = editorRef.current.getValue()
        if (currentValue === placeholder) {
          editorRef.current.setValue(value)
        }
      }
    }, [value, placeholder])

    // Cleanup providers on unmount
    useEffect(() => {
      return () => {
        if (completionProviderRef.current) {
          completionProviderRef.current.dispose()
        }
        if (hoverProviderRef.current) {
          hoverProviderRef.current.dispose()
        }
      }
    }, [])

    return (
      <div className={className} style={{ height }}>
        {loading && (
          <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center z-10">
            <div className="text-white">Loading...</div>
          </div>
        )}
        <MonacoEditor
          defaultLanguage={language}
          value={value || placeholder}
          theme={theme === "dark" ? "vs-dark" : "vs"}
          onMount={handleEditorMount}
          onChange={handleEditorChange}
          options={{
            fontSize: 14,
            fontFamily: "'Fira Code', 'Monaco', 'Menlo', monospace",
            lineHeight: 1.6,
            minimap: { enabled: false },
            wordWrap: "on",
            lineNumbers: "on",
            renderLineHighlight: "line",
            selectOnLineNumbers: true,
            automaticLayout: true,
            scrollBeyondLastLine: false,
            readOnly,
            contextmenu: true,
            mouseWheelZoom: true,
            cursorBlinking: "smooth",
            cursorSmoothCaretAnimation: "on",
            smoothScrolling: true,
            suggest: {
              showKeywords: true,
              showSnippets: true,
              showFunctions: true,
            },
            quickSuggestions: {
              other: true,
              comments: false,
              strings: false,
            },
            parameterHints: {
              enabled: true,
            },
            formatOnPaste: true,
            formatOnType: true,
            tabSize: 2,
            insertSpaces: true,
            bracketPairColorization: {
              enabled: true,
            },
          }}
        />
      </div>
    )
  },
)

QueryEditor.displayName = "QueryEditor"

export default QueryEditor;