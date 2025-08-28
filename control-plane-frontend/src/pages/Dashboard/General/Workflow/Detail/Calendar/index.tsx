import { useEffect, useState } from "react"
import CalendarHeatmap from "react-calendar-heatmap"
import ReactTooltip from "react-tooltip"
import "react-calendar-heatmap/dist/styles.css"
import { BsSquare, BsSquareFill } from "react-icons/bs"

import { useDetailWorkflow } from "@context/workflow/DetailWorkflow"

import styles from "./Calendar.module.scss"
interface CalendarValue {
  date: string
  count: number
  status: "success" | "failed" | "running" | "planned" | string
  failed: number
  success: number
}

const classForValue = (value: any) => {
  if (!value) return "color-empty"
  if (value?.status === "success") return "color-github-4"
  if (value?.status === "failed") return "color-red"
  return "color-empty"
}

const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

export default function Calendar() {
  const { runsData } = useDetailWorkflow()

  const [calendar, setCalendar] = useState<CalendarValue[]>([])

  const manipulateData = () => {
    const dataCalendar: CalendarValue[] = []
    runsData?.dag_runs.forEach((run) => {
      const date = run.start_date.slice(0, 10)

      const alreadyDate = dataCalendar.find((d) => d.date === date)

      if (alreadyDate) {
        alreadyDate.count += 1
        if (run.state === "success") {
          alreadyDate.success += 1
        }
        if (run.state === "failed") {
          alreadyDate.failed += 1
        }
      } else {
        dataCalendar.push({
          date,
          count: 1,
          status: run.state,
          failed: run.state === "failed" ? 1 : 0,
          success: run.state === "success" ? 1 : 0,
        })
      }
    })

    setCalendar(dataCalendar)
  }

  useEffect(() => {
    manipulateData()
  }, [runsData?.dag_runs])

  return (
    <div>
      <div className={styles["calendar-legend"]}>
        <div className={styles["legend-item"]}>
          <BsSquareFill className={`${styles.icon} text-green`} />
          <label className={styles.label}>Success</label>
        </div>
        <div className={styles["legend-item"]}>
          <BsSquareFill className={`${styles.icon} text-red`} />
          <label className={styles.label}>Failed</label>
        </div>
        <div className={styles["legend-item"]}>
          <BsSquareFill className={`${styles.icon} text-green-200`} />
          <label className={styles.label}>Running</label>
        </div>
        <div className={styles["legend-item"]}>
          <BsSquareFill className={`${styles.icon} text-black-100`} />
          <label className={styles.label}>Planned</label>
        </div>
        <div className={styles["legend-item"]}>
          <BsSquare className={`${styles.icon} text-black-100`} />
          <label className={styles.label}>No Status</label>
        </div>
      </div>
      <div className={styles["calendar-container"]}>
        <label className={styles["calendar-title"]}>2025</label>
        <div className={styles["weekday-labels-vertical"]}>
          {weekdayLabels.map((label) => (
            <div key={label}>{label}</div>
          ))}
        </div>
        <div
          className={styles["react-calendar-heatmap-wrapper"]}
          style={{ width: "100%", maxWidth: 800 }}
        >
          <CalendarHeatmap
            startDate={new Date("2025-01-01")}
            endDate={new Date("2025-12-31")}
            values={calendar}
            classForValue={classForValue}
            showMonthLabels={false}
            gutterSize={3}
            showWeekdayLabels={false}
            tooltipDataAttrs={(value): { [key: string]: string } => {
              if (!value || !value.date) {
                return { "data-tip": "No data" }
              }
              return {
                "data-tip": `${value.date} (${new Date(
                  value.date,
                ).toLocaleDateString("en-US", {
                  weekday: "long",
                })}) : ${value.count ?? 0} runs - Success: ${value.success ?? 0}, Failed: ${value.failed ?? 0}`,
              }
            }}
          />
        </div>
      </div>
      <ReactTooltip />
    </div>
  )
}
