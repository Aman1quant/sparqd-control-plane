import { useRef, useEffect, useState } from "react"
import * as d3 from "d3"

import { httpAirflow } from "@http/axios"
import endpoint from "@http/endpoint"
import { useDetailWorkflow } from "@context/workflow/DetailWorkflow"

import type { AirflowData, Series } from "./data"

export default function TaskDuration({ taskId }: { taskId?: string }) {
  const { workflowDetail } = useDetailWorkflow()
  const svgRef = useRef<SVGSVGElement | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [dataGrid, setDataGrid] = useState<AirflowData | null>(null)
  const [hiddenSeries, setHiddenSeries] = useState<Set<string>>(new Set())

  const formatDuration = (d: number) => {
    const h = Math.floor(d / 3600)
    const m = Math.floor((d % 3600) / 60)
    const s = Math.floor(d % 60)
    return `${String(h).padStart(2, "0")}h:${String(m).padStart(2, "0")}m:${String(s).padStart(2, "0")}s`
  }

  const getGrid = async (dag_id: string) => {
    try {
      const response = await httpAirflow.get(endpoint.grid_data.main, {
        params: { dag_id },
      })
      setDataGrid(response.data)
    } catch (error) {
      console.error("Error fetching grid:", error)
    }
  }

  useEffect(() => {
    if (workflowDetail.dag_id) {
      getGrid(workflowDetail.dag_id)
    }
  }, [workflowDetail.dag_id])

  useEffect(() => {
    if (taskId || !dataGrid || !containerRef.current) return

    const containerWidth = containerRef.current.clientWidth
    const containerHeight = containerRef.current.clientHeight
    const margin = { top: 60, right: 10, bottom: 60, left: 80 }
    const width = containerWidth - margin.left - margin.right
    const height = containerHeight - margin.top - margin.bottom

    const dagRuns = dataGrid.dag_runs
    const tasks = dataGrid.groups.children

    const runs = dagRuns
      .map((run) => ({
        run_id: run.run_id,
        date: new Date(run.data_interval_end || run.execution_date),
      }))
      .sort((a, b) => a.date.getTime() - b.date.getTime())

    const series: Series[] = tasks.map((task) => {
      const instanceMap: Record<string, { duration: number }> = {}
      task.instances.forEach((inst) => {
        if (inst.start_date && inst.end_date) {
          const start = new Date(inst.start_date)
          const end = new Date(inst.end_date)
          instanceMap[inst.run_id] = {
            duration: (end.getTime() - start.getTime()) / 1000,
          }
        }
      })
      return {
        id: task.label,
        color:
          task.label === "spark-task-raw"
            ? "#3564c8"
            : task.label === "spark-task-bronze"
              ? "#7DB86D"
              : "#FFC14A",
        values: runs.map((run) => ({
          date: run.date,
          duration: instanceMap[run.run_id]?.duration ?? null,
        })),
      }
    })

    d3.select(svgRef.current).selectAll("*").remove()

    const svg = d3
      .select(svgRef.current)
      .attr("width", "100%")
      .attr("height", height + margin.top + margin.bottom)
      .attr(
        "viewBox",
        `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`,
      )

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`)

    const xScale = d3
      .scaleTime()
      .domain(d3.extent(runs, (d) => d.date) as [Date, Date])
      .range([0, width])

    const yScale = d3
      .scaleLinear()
      .domain([
        0,
        d3.max(series.flatMap((s) => s.values.map((d) => d.duration || 0))) ||
          0,
      ])
      .nice()
      .range([height, 0])

    const tickCount = 4
    const xTickValues = [runs[0].date]
    for (let i = 2; xTickValues.length < tickCount && i < runs.length; i += 2) {
      xTickValues.push(runs[i].date)
    }

    // X Axis
    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(
        d3
          .axisBottom(xScale)
          .tickValues(xTickValues)
          .tickFormat(d3.timeFormat("%Y-%m-%d, %H:%M:%S") as any),
      )
      .selectAll("text")
      .style("font-size", "10px")
      .attr("dy", "1.5em")

    // X Label
    g.append("text")
      .attr("x", width / 2)
      .attr("y", height + 45)
      .attr("text-anchor", "middle")
      .style("font-size", "12px")

    // Y Axis
    g.append("g").call(
      d3
        .axisLeft(yScale)
        .ticks(7)
        .tickFormat((d: any) => {
          const h = Math.floor(d / 3600)
          const m = Math.floor((d % 3600) / 60)
          const s = Math.floor(d % 60)
          return `${String(h).padStart(2, "0")}h:${String(m).padStart(2, "0")}m:${String(s).padStart(2, "0")}s`
        }),
    )

    // Y Label
    g.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", -60)
      .attr("text-anchor", "middle")
      .style("font-size", "12px")

    // Grid lines
    g.append("g")
      .call(
        d3
          .axisLeft(yScale)
          .tickSize(-width)
          .tickFormat(() => ""),
      )
      .selectAll("line")
      .style("stroke", "#eee")

    // Tooltip
    const tooltip = d3
      .select(containerRef.current)
      .append("div")
      .attr("class", "tooltip")
      .style("position", "absolute")
      .style("background", "white")
      .style("border", "1px solid #ccc")
      .style("padding", "5px 8px")
      .style("border-radius", "4px")
      .style("pointer-events", "none")
      .style("opacity", 0)
      .style("font-size", "12px")
      .style("z-index", "1000")

    const line = d3
      .line<{ date: Date; duration: number | null }>()
      .defined((d) => d.duration !== null)
      .x((d) => xScale(d.date))
      .y((d) => yScale(d.duration!))

    series.forEach((s) => {
      if (hiddenSeries.has(s.id)) return

      g.append("path")
        .datum(s.values)
        .attr("fill", "none")
        .attr("stroke", s.color)
        .attr("stroke-width", 2)
        .attr("d", line)

      g.selectAll(`circle.${s.id}`)
        .data(s.values.filter(line.defined()))
        .enter()
        .append("circle")
        .attr("class", s.id)
        .attr("cx", (d) => xScale(d.date))
        .attr("cy", (d) => yScale(d.duration!))
        .attr("r", 4)
        .attr("fill", s.color)
        .on("mouseover", function (__event, d) {
          const circle = d3.select(this)
          const cx = +circle.attr("cx")
          const cy = +circle.attr("cy")

          const left = cx + margin.left
          const top = cy + margin.top

          tooltip
            .style("opacity", 1)
            .html(
              `<strong>Date:</strong> ${d3.timeFormat("%Y-%m-%d %H:%M")(d.date)}<br/>
       <strong>Duration:</strong> ${formatDuration(d.duration!)}`,
            )
            .style("left", `${left}px`)
            .style("top", `${top - 40}px`)
        })
        .on("mouseout", () => tooltip.style("opacity", 0))
    })

    // Legend
    const legendSpacing = 200
    const legendWidth = (series.length - 1) * legendSpacing
    const legendStartX = (width - legendWidth) / 2

    const legend = g
      .selectAll(".legend")
      .data(series)
      .enter()
      .append("g")
      .attr("class", "legend")
      .attr(
        "transform",
        (_, i) => `translate(${legendStartX + i * legendSpacing}, -15)`,
      )
      .style("cursor", "pointer")
      .on("click", (_, d) => {
        const newHidden = new Set(hiddenSeries)
        if (newHidden.has(d.id)) newHidden.delete(d.id)
        else newHidden.add(d.id)
        setHiddenSeries(newHidden)
      })

    legend
      .append("circle")
      .attr("cx", 0)
      .attr("cy", 0)
      .attr("r", 6)
      .style("fill", (d) => (hiddenSeries.has(d.id) ? "#ccc" : d.color))

    legend
      .append("text")
      .attr("x", 15)
      .attr("y", 3)
      .text((d) => d.id)
      .style("font-size", "12px")
      .style("font-weight", "bold")
      .style("text-decoration", (d) =>
        hiddenSeries.has(d.id) ? "line-through" : "none",
      )
  }, [dataGrid, taskId, hiddenSeries])

  // useEffect(() => {
  //   if (!containerRef.current) return
  //   const resizeObserver = new ResizeObserver(() => {
  //     setHiddenSeries(new Set(hiddenSeries))
  //   })
  //   resizeObserver.observe(containerRef.current)
  //   return () => resizeObserver.disconnect()
  // }, [hiddenSeries])

  /* single task */
  useEffect(() => {
    if (!taskId || !containerRef.current || !svgRef.current) return

    const data = dataGrid?.groups?.children?.find((d) => d.id === taskId)
    if (!data?.instances?.length) return

    const instances = data.instances
    const items = instances
      .filter((d) => d.start_date && d.end_date)
      .map((d) => ({
        run_id: d.run_id,
        start: new Date(d.start_date),
        end: new Date(d.end_date),
        queued: d.queued_dttm ? new Date(d.queued_dttm) : null,
      }))
      .sort((a, b) => a.start.getTime() - b.start.getTime())

    if (!items.length) return

    const durations = items.map(
      (d) => (d.end.getTime() - d.start.getTime()) / 1000 / 60,
    )
    const queuedDurations = items.map((d) =>
      d.queued ? (d.start.getTime() - d.queued.getTime()) / 1000 / 60 : 0,
    )

    const median = (arr: number[]) => {
      const filtered = arr.filter((v) => !isNaN(v)).sort((a, b) => a - b)
      const mid = Math.floor(filtered.length / 2)
      return filtered.length
        ? filtered.length % 2 !== 0
          ? filtered[mid]
          : (filtered[mid - 1] + filtered[mid]) / 2
        : 0
    }

    const medianDuration = median(durations)
    const medianQueued = median(queuedDurations)

    const containerWidth = containerRef.current.clientWidth
    const containerHeight = containerRef.current.clientHeight
    const margin = { top: 40, right: 10, bottom: 50, left: 40 }
    const width = containerWidth - margin.left - margin.right
    const height = containerHeight - margin.top - margin.bottom

    d3.select(svgRef.current).selectAll("*").remove()

    const svg = d3
      .select(svgRef.current)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`)

    const x = d3
      .scaleBand()
      .domain(items.map((d) => d.start.toISOString()))
      .range([0, width])
      .padding(0.2)

    const y = d3
      .scaleLinear()
      .domain([
        0,
        Math.max(
          d3.max(durations) || 0,
          d3.max(queuedDurations) || 0,
          medianDuration,
          medianQueued,
        ) * 1.1,
      ])
      .range([height, 0])

    g.selectAll(".bar")
      .data(durations)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", (_, i) => x(items[i].start.toISOString())!)
      .attr("y", (d) => y(d))
      .attr("width", x.bandwidth())
      .attr("height", (d) => height - y(d))
      .attr("fill", "green")

    g.selectAll(".bar-queued")
      .data(queuedDurations)
      .enter()
      .append("rect")
      .attr("class", "bar-queued")
      .attr("x", (_, i) => x(items[i].start.toISOString())!)
      .attr("y", (d) => y(d))
      .attr("width", x.bandwidth())
      .attr("height", (d) => height - y(d))
      .attr("fill", "#aaa")
      .attr("opacity", 0.7)

    svg
      .append("defs")
      .append("marker")
      .attr("id", "arrow-queued")
      .attr("viewBox", "0 0 10 10")
      .attr("refX", 10)
      .attr("refY", 5)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto-start-reverse")
      .append("path")
      .attr("d", "M 0 0 L 10 5 L 0 10 z")
      .attr("fill", "#aaa")

    g.append("line")
      .attr("class", "line-queued")
      .attr("x1", 0)
      .attr("x2", width)
      .attr("y1", y(medianQueued))
      .attr("y2", y(medianQueued))
      .attr("stroke", "#888")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "4 2")
      .attr("marker-end", "url(#arrow-queued)")

    g.append("line")
      .attr("class", "line-duration")
      .attr("x1", 0)
      .attr("x2", width)
      .attr("y1", y(medianDuration))
      .attr("y2", y(medianDuration))
      .attr("stroke", "blue")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "4 2")
      .attr("marker-end", "url(#arrow-queued)")

    g.append("circle")
      .attr("class", "dot-duration")
      .attr("cx", width + 22)
      .attr("cy", y(medianDuration))
      .attr("r", 6)
      .attr("fill", "blue")
    g.append("text")
      .attr("class", "text-duration")
      .attr("x", width + 35)
      .attr("y", y(medianDuration) + 4)
      .text(medianDuration.toFixed(2))
      .style("fill", "blue")
      .style("font-size", "10px")

    g.append("circle")
      .attr("class", "dot-queued")
      .attr("cx", width + 22)
      .attr("cy", y(medianQueued))
      .attr("r", 6)
      .attr("fill", "#888")
    g.append("text")
      .attr("class", "text-queued")
      .attr("x", width + 35)
      .attr("y", y(medianQueued) + 4)
      .text(medianQueued.toFixed(2))
      .style("fill", "#888")
      .style("font-size", "10px")

    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(
        d3
          .axisBottom(x)
          .tickFormat((d) => d3.timeFormat("%Y-%m-%d, %H:%M:%S")(new Date(d))),
      )
      .selectAll("text")
      .attr("font-size", "10px")
      .attr("transform", "rotate(15)")
      .style("text-anchor", "start")

    g.append("g").call(
      d3
        .axisLeft(y)
        .ticks(7)
        .tickFormat((d) => d.toString()),
    )

    const legend = svg.append("g").attr("class", "legend-group")

    const legendStates = {
      duration: true,
      queued: true,
    }

    const toggleVisibility = (key: keyof typeof legendStates) => {
      legendStates[key] = !legendStates[key]

      const display = legendStates[key] ? "inline" : "none"
      if (key === "duration") {
        svg.selectAll(".bar").style("display", display)
        svg.selectAll(".line-duration").style("display", display)
        svg.selectAll(".dot-duration").style("display", display)
        svg.selectAll(".text-duration").style("display", display)
      } else if (key === "queued") {
        svg.selectAll(".bar-queued").style("display", display)
        svg.selectAll(".line-queued").style("display", display)
        svg.selectAll(".dot-queued").style("display", display)
        svg.selectAll(".text-queued").style("display", display)
      }
    }

    const legendDuration = legend
      .append("g")
      .style("cursor", "pointer")
      .on("click", () => toggleVisibility("duration"))
    legendDuration
      .append("circle")
      .attr("cx", 0)
      .attr("cy", 0)
      .attr("r", 7)
      .style("fill", "green")
    legendDuration
      .append("text")
      .attr("x", 13)
      .attr("y", 4)
      .text("Median total duration")
      .style("font-size", "13px")
      .style("fill", "black")

    const legendQueued = legend
      .append("g")
      .attr("transform", "translate(180, 0)")
      .style("cursor", "pointer")
      .on("click", () => toggleVisibility("queued"))
    legendQueued
      .append("circle")
      .attr("cx", 0)
      .attr("cy", 0)
      .attr("r", 7)
      .style("fill", "#888")
    legendQueued
      .append("text")
      .attr("x", 13)
      .attr("y", 4)
      .text("Median queued duration")
      .style("font-size", "13px")
      .style("fill", "black")

    const legendGroup = svg.select(".legend-group")
    const legendNode = legendGroup.node() as SVGGraphicsElement | null
    const legendWidth = legendNode?.getBBox().width || 0
    legendGroup.attr(
      "transform",
      `translate(${(width + margin.left + margin.right - legendWidth) / 2}, 20)`,
    )

    return () => {
      d3.select(svgRef.current).selectAll("*").remove()
    }
  }, [dataGrid, taskId])

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        position: "relative",
        minWidth: "600px",
        minHeight: "280px",
        marginTop: "20px",
      }}
    >
      <svg ref={svgRef} />
    </div>
  )
}
