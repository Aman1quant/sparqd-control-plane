import React, { useRef, useEffect, useState } from "react"
import * as d3 from "d3"

type Task = {
  name: string
  start: string
  end: string
  color: string
}

const tasks: Task[] = [
  {
    name: "Name of the Task",
    start: "2025-05-22T03:00:00",
    end: "2025-05-22T03:20:00",
    color: "#2E7D32",
  },
  {
    name: "Name of the Task",
    start: "2025-05-22T03:10:00",
    end: "2025-05-22T03:50:00",
    color: "#547DBF",
  },
  {
    name: "Name of the Task",
    start: "2025-05-22T03:30:00",
    end: "2025-05-22T04:00:00",
    color: "#D77E8A",
  },
]

const Gantt: React.FC = () => {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const [containerWidth, setContainerWidth] = useState(500)

  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        if (entry.contentRect) {
          setContainerWidth(entry.contentRect.width)
        }
      }
    })

    if (wrapperRef.current) {
      observer.observe(wrapperRef.current)
    }

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!svgRef.current) return

    const margin = { top: 40, right: 20, bottom: 20, left: 0 }
    const width = containerWidth - margin.left - margin.right

    const svg = d3.select(svgRef.current)
    svg.selectAll("*").remove()

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`)

    const parseTime = d3.timeParse("%Y-%m-%dT%H:%M:%S")
    const parsedTasks = tasks.map((d) => ({
      ...d,
      startDate: parseTime(d.start)!,
      endDate: parseTime(d.end)!,
    }))

    const x = d3
      .scaleTime()
      .domain([
        d3.min(parsedTasks, (d) => d.startDate)!,
        d3.max(parsedTasks, (d) => d.endDate)!,
      ])
      .range([0, width])

    const y = d3
      .scaleBand()
      .domain(parsedTasks.map((d, i) => d.name + i))
      .range([0, 100])
      .padding(0.5)

    const timeInterval = d3.timeMinute.every(10)
    const ticks = timeInterval ? x.ticks(timeInterval) : x.ticks(10)

    g.selectAll(".grid-line")
      .data(ticks)
      .enter()
      .append("line")
      .attr("x1", (d) => x(d))
      .attr("x2", (d) => x(d))
      .attr("y1", 0)
      .attr("y2", y.range()[1])
      .attr("stroke", "#e0e0e0")

    g.selectAll(".time-label")
      .data(ticks)
      .enter()
      .append("text")
      .attr("x", (d) => x(d))
      .attr("y", -10)
      .attr("text-anchor", "middle")
      .attr("font-size", "10px")
      .attr("fill", "#666")
      .text((d) => d3.timeFormat("%H:%M:%S IST")(d))

    g.selectAll(".task-bar")
      .data(parsedTasks)
      .enter()
      .append("rect")
      .attr("x", (d) => x(d.startDate))
      .attr("y", (_, i) => i * 30)
      .attr("width", (d) => x(d.endDate) - x(d.startDate))
      .attr("height", 20)
      .attr("rx", 10)
      .attr("ry", 10)
      .attr("fill", (d) => d.color)

    g.selectAll(".task-label")
      .data(parsedTasks)
      .enter()
      .append("text")
      .attr("x", (d) => x(d.startDate) + 10)
      .attr("y", (_, i) => i * 30 + 14)
      .attr("fill", "white")
      .attr("font-size", "12px")
      .attr("font-weight", "bold")
      .text((d) => d.name)
  }, [containerWidth])

  return (
    <div ref={wrapperRef} style={{ width: "100%" }}>
      <svg ref={svgRef} width={containerWidth} />
    </div>
  )
}

export default Gantt
