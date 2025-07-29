export interface GridData {
  id: number
  enabled: boolean
  name: string
  runID: string
  launched: string
  duration: string
  status: string
  errorCode: string
  runParameter: string
}

export const dataGrid: GridData[] = [
  {
    id: 1,
    enabled: true,
    name: "Mar 17,2025 at 10:50 PM",
    runID: "123242347253111",
    launched: "Manually",
    duration: "2m 30s",
    status: "Success",
    errorCode: "",
    runParameter: "1:1200",
  },
  {
    id: 2,
    enabled: true,
    name: "Mar 17,2025 at 10:50 PM",
    runID: "123242347253111",
    launched: "Manually",
    duration: "2m 30s",
    status: "Queued",
    errorCode: "",
    runParameter: "1:1200",
  },
  {
    id: 3,
    enabled: true,
    name: "Mar 17,2025 at 10:50 PM",
    runID: "123242347253111",
    launched: "Manually",
    duration: "2m 30s",
    status: "Queued",
    errorCode: "",
    runParameter: "1:1200",
  },
  {
    id: 4,
    enabled: true,
    name: "Mar 17,2025 at 10:50 PM",
    runID: "123242347253111",
    launched: "Manually",
    duration: "2m 30s",
    status: "Running",
    errorCode: "",
    runParameter: "1:1200",
  },
]
