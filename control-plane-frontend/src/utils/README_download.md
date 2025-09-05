# Download Utils - Contoh Penggunaan.

## Instalasi Dependencies

```bash
npm install xlsx file-saver
npm install --save-dev @types/file-saver
```

## Import Functions

```typescript
import {
  downloadAsExcel,
  downloadAsCSV,
  downloadAsTSV,
  copyDataToClipboard,
  downloadAsJSON,
  downloadData,
} from "@utils/downloadUtils"
```

## Contoh Data

```typescript
const data = [
  { id: 1, name: "John", age: 30, city: "New York" },
  { id: 2, name: "Jane", age: 25, city: "Los Angeles" },
  { id: 3, name: "Bob", age: 35, city: "Chicago" },
]
```

## Penggunaan Functions

### 1. Download sebagai Excel (.xlsx)

```typescript
// Basic usage
downloadAsExcel(data)

// With custom filename and sheet name
downloadAsExcel(data, {
  filename: "users_data.xlsx",
  sheetName: "Users",
})
```

### 2. Download sebagai CSV

```typescript
// Basic usage
downloadAsCSV(data)

// With custom filename
downloadAsCSV(data, { filename: "users_data.csv" })
```

### 3. Download sebagai TSV

```typescript
// Basic usage
downloadAsTSV(data)

// With custom filename
downloadAsTSV(data, { filename: "users_data.tsv" })
```

### 4. Download sebagai JSON

```typescript
// Basic usage
downloadAsJSON(data)

// With custom filename
downloadAsJSON(data, { filename: "users_data.json" })
```

### 5. Copy ke Clipboard

```typescript
// Async function
const handleCopy = async () => {
  try {
    await copyDataToClipboard(data)
    console.log("Data berhasil disalin ke clipboard!")
  } catch (error) {
    console.error("Gagal menyalin data:", error)
  }
}
```

### 6. Generic Download Function

```typescript
// Download dengan format yang berbeda
downloadData(data, "xlsx", { filename: "data.xlsx" })
downloadData(data, "csv", { filename: "data.csv" })
downloadData(data, "tsv", { filename: "data.tsv" })
downloadData(data, "json", { filename: "data.json" })
```

## Penggunaan dalam Component React

```typescript
import React from 'react'
import { downloadAsExcel, downloadAsCSV } from "@utils/downloadUtils"

const MyComponent = () => {
  const tableData = [
    { id: 1, name: "Product A", price: 100 },
    { id: 2, name: "Product B", price: 200 },
  ]

  const handleDownloadExcel = () => {
    downloadAsExcel(tableData, { filename: "products.xlsx" })
  }

  const handleDownloadCSV = () => {
    downloadAsCSV(tableData, { filename: "products.csv" })
  }

  return (
    <div>
      <button onClick={handleDownloadExcel}>Download Excel</button>
      <button onClick={handleDownloadCSV}>Download CSV</button>
    </div>
  )
}
```

## Features

- ✅ Support Excel (.xlsx)
- ✅ Support CSV
- ✅ Support TSV
- ✅ Support JSON
- ✅ Copy to clipboard
- ✅ Custom filenames
- ✅ Custom sheet names untuk Excel
- ✅ TypeScript support
- ✅ Error handling

## Browser Support

- Chrome ✅
- Firefox ✅
- Safari ✅
- Edge ✅

## Notes

- File akan otomatis terdownload ke folder Downloads
- Untuk copy to clipboard, butuh HTTPS atau localhost
- Data harus berupa array of objects
- Semua functions menggunakan client-side processing
