import * as XLSX from "xlsx"
import { saveAs } from "file-saver"

export interface DownloadOptions {
  filename?: string
  sheetName?: string
}

/**
 * Download array of objects as Excel (.xlsx) file
 * @param data - Array of objects to download
 * @param options - Download options (filename, sheetName)
 */
export const downloadAsExcel = (data: any[], options: DownloadOptions = {}) => {
  const { filename = "data.xlsx", sheetName = "Data" } = options

  const worksheet = XLSX.utils.json_to_sheet(data)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)

  const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" })
  const blob = new Blob([excelBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  })
  saveAs(blob, filename)
}

/**
 * Download array of objects as CSV file
 * @param data - Array of objects to download
 * @param options - Download options (filename)
 */
export const downloadAsCSV = (data: any[], options: DownloadOptions = {}) => {
  const { filename = "data.csv" } = options

  const worksheet = XLSX.utils.json_to_sheet(data)
  const csv = XLSX.utils.sheet_to_csv(worksheet)

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  saveAs(blob, filename)
}

/**
 * Download array of objects as TSV (Tab-Separated Values) file
 * @param data - Array of objects to download
 * @param options - Download options (filename)
 */
export const downloadAsTSV = (data: any[], options: DownloadOptions = {}) => {
  const { filename = "data.tsv" } = options

  const worksheet = XLSX.utils.json_to_sheet(data)
  const tsv = XLSX.utils.sheet_to_csv(worksheet, { FS: "\t" })

  const blob = new Blob([tsv], {
    type: "text/tab-separated-values;charset=utf-8;",
  })
  saveAs(blob, filename)
}

/**
 * Copy array of objects data to clipboard as CSV format
 * @param data - Array of objects to copy
 * @returns Promise that resolves when copy is successful
 */
export const copyDataToClipboard = async (data: any[]): Promise<void> => {
  const worksheet = XLSX.utils.json_to_sheet(data)
  const csv = XLSX.utils.sheet_to_csv(worksheet)

  try {
    await navigator.clipboard.writeText(csv)
    console.log("Data copied to clipboard successfully")
  } catch (err) {
    console.error("Failed to copy data to clipboard:", err)
    throw err
  }
}

/**
 * Convert array of objects to JSON and download
 * @param data - Array of objects to download
 * @param options - Download options (filename)
 */
export const downloadAsJSON = (data: any[], options: DownloadOptions = {}) => {
  const { filename = "data.json" } = options

  const jsonString = JSON.stringify(data, null, 2)
  const blob = new Blob([jsonString], { type: "application/json" })
  saveAs(blob, filename)
}

/**
 * Generic download function that supports multiple formats
 * @param data - Array of objects to download
 * @param format - File format ("xlsx" | "csv" | "tsv" | "json")
 * @param options - Download options
 */
export const downloadData = (
  data: any[],
  format: "xlsx" | "csv" | "tsv" | "json",
  options: DownloadOptions = {},
) => {
  switch (format) {
    case "xlsx":
      downloadAsExcel(data, options)
      break
    case "csv":
      downloadAsCSV(data, options)
      break
    case "tsv":
      downloadAsTSV(data, options)
      break
    case "json":
      downloadAsJSON(data, options)
      break
    default:
      throw new Error(`Unsupported format: ${format}`)
  }
}
