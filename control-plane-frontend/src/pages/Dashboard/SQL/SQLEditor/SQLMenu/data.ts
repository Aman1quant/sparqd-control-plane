export interface IDatabase {
  name: string
}

export interface ISection {
  title: string
  databases: IDatabase[]
}

export const sections: ISection[] = [
  {
    title: "My Organisation",
    databases: [
      { name: "system name" },
      { name: "aileen" },
      { name: "aileen-ext" },
      { name: "main" },
      { name: "ailmleen" },
      { name: "ripple_dev" },
      { name: "ripple_prod" },
      { name: "sso" },
      { name: "sso_prod" },
    ],
  },
  {
    title: "Delta Shares Received",
    databases: [{ name: "samples" }],
  },
  {
    title: "Legacy",
    databases: [{ name: "hive_megastores" }],
  },
]
