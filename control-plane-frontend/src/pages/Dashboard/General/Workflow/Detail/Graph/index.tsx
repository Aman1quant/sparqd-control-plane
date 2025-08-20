import React, { useEffect, useMemo } from "react"
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  type Node,
  type Edge,
  Position,
} from "reactflow"
import dagre from "dagre"
import "reactflow/dist/style.css"

import { useDetailWorkflow } from "@context/workflow/DetailWorkflow"
import { httpAirflow } from "@http/axios"
import endpoint from "@http/endpoint"

const operatorLabel = "SparkKubernetesOperator"

function parseStyleString(styleStr?: string): React.CSSProperties {
  if (!styleStr) return {}
  return styleStr.split(";").reduce(
    (acc, s) => {
      const [key, val] = s.split(":")
      if (key && val) acc[key.trim()] = val.trim()
      return acc
    },
    {} as Record<string, string>,
  ) as React.CSSProperties
}

function getLayoutedElements(
  nodes: Node[],
  edges: Edge[],
  direction: "LR" | "TB",
) {
  const dagreGraph = new dagre.graphlib.Graph()
  dagreGraph.setDefaultEdgeLabel(() => ({}))
  dagreGraph.setGraph({ rankdir: direction })

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: 200, height: 60 })
  })
  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target)
  })

  dagre.layout(dagreGraph)

  return [
    nodes.map((node) => {
      const nodeWithPosition = dagreGraph.node(node.id)
      node.position = {
        x: nodeWithPosition.x - 100,
        y: nodeWithPosition.y - 30,
      }
      return node
    }),
    edges,
  ] as [Node[], Edge[]]
}

const TaskFlowDiagram: React.FC = () => {
  const { workflowDetail } = useDetailWorkflow()

  const [dataGraph, setDataGraph] = React.useState({
    arrange: "LR",
    edges: [],
    nodes: { children: [] },
  })

  const [nodes, edges] = useMemo(() => {
    const nodes: Node[] = (dataGraph.nodes.children || []).map((n: any) => ({
      id: n.id,
      type: "default",
      position: { x: 0, y: 0 },
      data: {
        label: (
          <div style={{ textAlign: "left" }}>
            <div style={{ fontWeight: "bold" }}>{n.value.label}</div>
            <div style={{ fontSize: 13, color: "#444" }}>{operatorLabel}</div>
          </div>
        ),
      },
      style: {
        backgroundColor: "#f4a460",
        borderColor: "#aaa",
        borderRadius: 5,
        width: 200,
        height: 60,
        ...parseStyleString(n.value.style),
      },
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
    }))

    const edges: Edge[] = (dataGraph.edges || []).map((e: any) => ({
      id: `${e.source_id}->${e.target_id}`,
      source: e.source_id,
      target: e.target_id,
      animated: false,
      style: { stroke: "#aaa", strokeWidth: 2 },
    }))

    return getLayoutedElements(
      nodes,
      edges,
      dataGraph.arrange === "LR" ? "LR" : "TB",
    )
  }, [dataGraph])

  const getGraphData = async (dag_id: string) => {
    try {
      const response = await httpAirflow.get(endpoint.graph_data.main, {
        params: { dag_id },
      })
      setDataGraph(response.data)
    } catch (error) {
      console.error("Error fetching code:", error)
    }
  }

  useEffect(() => {
    if (workflowDetail.dag_id) {
      getGraphData(workflowDetail.dag_id)
    }
  }, [workflowDetail.dag_id])

  return (
    <div
      style={{
        width: "100%",
        height: 430,
        background: "#fff",
        borderRadius: 6,
        position: "relative",
      }}
    >
      <div style={{ position: "absolute", right: 30, top: 15, zIndex: 10 }}>
        <div style={{ fontSize: 15, color: "#555" }}>
          <label>
            Layout:{" "}
            <span>
              {dataGraph.arrange === "LR" ? "Left -> Right" : "Top -> Bottom"}
            </span>
          </label>
        </div>
      </div>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        fitView
        panOnScroll
        nodesDraggable={false}
        nodesConnectable={false}
        zoomOnPinch={false}
        panOnDrag
      >
        <MiniMap />
        <Controls />
        <Background gap={18} size={1.5} color="#eaeaea" />
      </ReactFlow>
      <div
        style={{
          fontSize: 12,
          color: "#888",
          textAlign: "right",
          marginTop: 3,
          marginRight: 10,
        }}
      >
        React Flow
      </div>
    </div>
  )
}

export default TaskFlowDiagram
