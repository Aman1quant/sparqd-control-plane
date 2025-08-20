import {
  downloadAsExcel,
  downloadAsCSV,
  downloadAsTSV,
  downloadAsJSON,
  copyDataToClipboard,
} from "@utils/downloadUtils"

const DownloadTestComponent = () => {
  // Sample data untuk testing
  const sampleData = [
    {
      id: 1,
      name: "John Doe",
      age: 30,
      email: "john@example.com",
      city: "New York",
    },
    {
      id: 2,
      name: "Jane Smith",
      age: 25,
      email: "jane@example.com",
      city: "Los Angeles",
    },
    {
      id: 3,
      name: "Bob Johnson",
      age: 35,
      email: "bob@example.com",
      city: "Chicago",
    },
    {
      id: 4,
      name: "Alice Brown",
      age: 28,
      email: "alice@example.com",
      city: "Houston",
    },
    {
      id: 5,
      name: "Charlie Wilson",
      age: 32,
      email: "charlie@example.com",
      city: "Phoenix",
    },
  ]

  const handleDownloadExcel = () => {
    downloadAsExcel(sampleData, {
      filename: "sample_users.xlsx",
      sheetName: "Users Data",
    })
  }

  const handleDownloadCSV = () => {
    downloadAsCSV(sampleData, { filename: "sample_users.csv" })
  }

  const handleDownloadTSV = () => {
    downloadAsTSV(sampleData, { filename: "sample_users.tsv" })
  }

  const handleDownloadJSON = () => {
    downloadAsJSON(sampleData, { filename: "sample_users.json" })
  }

  const handleCopyToClipboard = async () => {
    try {
      await copyDataToClipboard(sampleData)
      alert("Data berhasil disalin ke clipboard!")
    } catch (error) {
      alert("Gagal menyalin data ke clipboard")
      console.error(error)
    }
  }

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h2>Test Download Functions</h2>

      <div style={{ marginBottom: "20px" }}>
        <h3>Sample Data Preview:</h3>
        <table style={{ border: "1px solid #ccc", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ backgroundColor: "#f5f5f5" }}>
              <th style={{ border: "1px solid #ccc", padding: "8px" }}>ID</th>
              <th style={{ border: "1px solid #ccc", padding: "8px" }}>Name</th>
              <th style={{ border: "1px solid #ccc", padding: "8px" }}>Age</th>
              <th style={{ border: "1px solid #ccc", padding: "8px" }}>
                Email
              </th>
              <th style={{ border: "1px solid #ccc", padding: "8px" }}>City</th>
            </tr>
          </thead>
          <tbody>
            {sampleData.map((user) => (
              <tr key={user.id}>
                <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                  {user.id}
                </td>
                <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                  {user.name}
                </td>
                <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                  {user.age}
                </td>
                <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                  {user.email}
                </td>
                <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                  {user.city}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
        <button
          onClick={handleDownloadExcel}
          style={{
            padding: "10px 20px",
            backgroundColor: "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Download Excel (.xlsx)
        </button>

        <button
          onClick={handleDownloadCSV}
          style={{
            padding: "10px 20px",
            backgroundColor: "#2196F3",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Download CSV
        </button>

        <button
          onClick={handleDownloadTSV}
          style={{
            padding: "10px 20px",
            backgroundColor: "#FF9800",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Download TSV
        </button>

        <button
          onClick={handleDownloadJSON}
          style={{
            padding: "10px 20px",
            backgroundColor: "#9C27B0",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Download JSON
        </button>

        <button
          onClick={handleCopyToClipboard}
          style={{
            padding: "10px 20px",
            backgroundColor: "#607D8B",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Copy to Clipboard
        </button>
      </div>

      <div style={{ marginTop: "20px", fontSize: "14px", color: "#666" }}>
        <p>
          <strong>Instructions:</strong>
        </p>
        <ul>
          <li>Click any button to test the download functionality</li>
          <li>
            Excel files will have proper formatting and can be opened in
            Excel/Google Sheets
          </li>
          <li>
            CSV files are comma-separated and can be opened in Excel or imported
            to databases
          </li>
          <li>TSV files are tab-separated (good for certain applications)</li>
          <li>JSON files preserve the original data structure</li>
          <li>Copy to clipboard will copy the data in CSV format</li>
        </ul>
      </div>
    </div>
  )
}

export default DownloadTestComponent
