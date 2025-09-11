import React, { lazy } from "react"
import {
  IconBook2,
  IconChartDots3,
  //IconClock,
  //IconCloud,
  IconCloudCog,
  IconFileCode,
  IconFlask,
  IconIcons,
  IconLayoutDashboard,
  //IconListCheck,
  IconNotebook,
  IconPlus,
  IconPuzzle,
  IconRoute,
  IconSparkles,
  IconStack3,
} from "@tabler/icons-react"

const Default = lazy(() => import("@pages/Default"))
const New = lazy(() => import("@pages/Dashboard/General/New"))
const WorkflowList = lazy(() => import("@pages/Dashboard/General/Workflow"))
const DetailWorklist = lazy(() => import("@pages/Dashboard/General/Workflow/Detail"))
const SQLEditor = lazy(() => import("@pages/Dashboard/SQL/SQLEditor"))
const Dashboard = lazy(() => import("@pages/Dashboard/SQL/Dashboard"))
const Queries = lazy(() => import("@pages/Dashboard/SQL/Queries"))
const Marketplace = lazy(() => import("@pages/Dashboard/MachineLearning/Marketplace"))
const Catalog = lazy(() => import("@pages/Dashboard/General/Catalog"))
const CreateWorkspace = lazy(() => import("@pages/Dashboard/General/Workspace/Create"))
const Workspace = lazy(() => import("@pages/Dashboard/General/Workspace/ListData"))

export interface RouteItem {
  title: string
  icon?: React.ComponentType<any>
  component?: React.ComponentType<any>
  path?: string
  layout?: string
  gap?: boolean
  sectionTitle?: string | null
  className?: string
  type?: "button" | "link"
  hidden?: boolean
  roleAccess?: string[]
}

export interface SectionTitle {
  title: string
}

export interface RouteSection {
  section?: SectionTitle | null
  items: RouteItem[]
}

const routes: RouteSection[] = [
  {
    section: null,
    items: [
      {
        title: "Spark",
        icon: IconNotebook,
        component: Default,
        path: "default",
        layout: "/admin",
        roleAccess: ["admin", "editor"],
        hidden: true,
      },
      {
        title: "New",
        icon: IconPlus,
        component: New,
        path: "new",
        layout: "/admin",
        type: "button",
        roleAccess: ["admin", "editor"],
      },
      {
        title: "Workspace",
        icon: IconNotebook,
        component: Workspace,
        path: "workspace",
        layout: "/admin",
        roleAccess: ["admin", "editor"],
      },
      {
        title: "Create Workspace",
        component: CreateWorkspace,
        path: "workspace/create",
        layout: "/admin",
        hidden: true,
        roleAccess: ["admin", "editor"],
      },
      //{ title: "Recent", icon: IconClock, roleAccess: ["admin", "editor"] },
      {
        title: "Catalog",
        icon: IconIcons,
        component: Catalog,
        path: "catalog/*",
        layout: "/admin",
        roleAccess: ["admin", "editor"],
      },
      {
        title: "Detail Workflow",
        component: DetailWorklist,
        path: "workflow/:id",
        layout: "/admin",
        hidden: true,
        roleAccess: ["admin", "editor"],
      },
      {
        title: "Workflow",
        icon: IconRoute,
        component: WorkflowList,
        path: "workflow",
        layout: "/admin",
        roleAccess: ["admin", "editor"],
      },
      //{ title: "Compute", icon: IconCloud, roleAccess: ["admin", "editor"] },
    ],
  },
  {
    section: { title: "SQL" },
    items: [
      {
        title: "SQL Editor",
        icon: IconBook2,
        gap: true,
        component: SQLEditor,
        path: "sql",
        layout: "/admin",
        roleAccess: ["admin"],
      },
      {
        title: "Queries",
        icon: IconFileCode,
        gap: true,
        component: Queries,
        path: "queries",
        layout: "/admin",
        roleAccess: ["admin"],
      },
      {
        title: "Dashboard",
        icon: IconLayoutDashboard,
        gap: true,
        component: Dashboard,
        path: "dashboard",
        layout: "/admin",
        roleAccess: ["admin", "editor"],
      },
    ],
  },
  //{
    //section: { title: "DATA ENGINEERING" },
    //items: [
      //{
        //title: "Job Runs",
        //icon: IconListCheck,
        //gap: true,
        //roleAccess: ["admin", "editor"],
      //},
    //],
  //},
  {
    section: { title: "MACHINE LEARNING" },
    items: [
      {
        title: "Play Ground",
        icon: IconSparkles,
        gap: true,
        roleAccess: ["admin", "editor"],
      },
      {
        title: "Connectors",
        icon: IconPuzzle,
        component: Marketplace,
        path: "connectors",
        layout: "/admin",
        roleAccess: ["admin", "editor"],
      },
      {
        title: "Experiments",
        icon: IconFlask,
        roleAccess: ["admin", "editor"],
      },
      {
        title: "Features",
        icon: IconStack3,
        roleAccess: ["admin", "editor"],
      },
      {
        title: "Models",
        icon: IconChartDots3,
        roleAccess: ["admin", "editor"],
      },
      { title: "Serving", icon: IconCloudCog, roleAccess: ["admin", "editor"] },
    ],
  },
]

export default routes