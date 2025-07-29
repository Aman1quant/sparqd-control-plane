import React from "react"

import Default from "@pages/Default"
import New from "@pages/Dashboard/General/New"
import WorkflowList from "@pages/Dashboard/General/Workflow"
import DetailWorklist from "@pages/Dashboard/General/Workflow/Detail"
import SQLEditor from "@pages/Dashboard/SQL/SQLEditor"
import Dashboard from "@pages/Dashboard/SQL/Dashboard"
import Marketplace from "@pages/Dashboard/MachineLearning/Marketplace"
import Catalog from "@pages/Dashboard/General/Catalog"
import CreateWorkspace from "@pages/Dashboard/General/Workspace/Create"
import { IconBook2, IconChartDots3, IconClock, IconCloud, IconCloudCog, IconFlask, IconIcons, IconLayoutDashboard, IconListCheck, IconNotebook, IconPlus, IconPuzzle, IconRoute, IconSparkles, IconStack3 } from "@tabler/icons-react"
import Workspace from "@pages/Dashboard/General/Workspace/ListData"
import ManageWorkspace from "@pages/ManageWorkspace"

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
        title: "Manage Workspace",
        // icon: IconClock,
        component: ManageWorkspace,
        path: "manage_workspace",
        layout: "/admin",
        hidden: true,
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
        // icon: IconClock,
        component: CreateWorkspace,
        path: "workspace/create",
        layout: "/admin",
        hidden: true,
        roleAccess: ["admin", "editor"],
      },
      { title: "Recent", icon: IconClock, roleAccess: ["admin", "editor"] },
      { 
        title: "Catalog",
        icon: IconIcons,
        component: Catalog,
        path: "catalog",
        layout: "/admin",
         roleAccess: ["admin", "editor"] 
        },
      {
        title: "Detail Workflow",
        // icon: IconPlus,
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
      { title: "Compute", icon: IconCloud, roleAccess: ["admin", "editor"] },
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
  {
    section: { title: "DATA ENGINEERING" },
    items: [
      {
        title: "Job Runs",
        icon: IconListCheck,
        gap: true,
        roleAccess: ["admin", "editor"],
      },
    ],
  },
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
      { title: "Models", icon: IconChartDots3, roleAccess: ["admin", "editor"] },
      { title: "Serving", icon: IconCloudCog, roleAccess: ["admin", "editor"] },
    ],
  },
]

export default routes