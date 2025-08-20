export interface ICatalog {
  name: string
}

export interface ISection {
  title: string
  catalogs: ICatalog[]
}

export const sections: ISection[] = [
  {
    title: "My Organisation",
    catalogs: [
      { name: "workspace" },
      { name: "system" },
      { name: "test_catalog" },
      { name: "main" },
      { name: "development" },
    ],
  },
  {
    title: "Delta Shares Received",
    catalogs: [{ name: "samples" }],
  },
  {
    title: "Legacy",
    catalogs: [{ name: "hive_metastore" }],
  },
]