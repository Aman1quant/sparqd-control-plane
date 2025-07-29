import Breadcrumb from "@components/commons/Breadcrumb"
import { BsFolderFill } from "react-icons/bs"

const ObjectFile = () => {
  const breadcrumbItems = [
    { label: <BsFolderFill />, href: "/admin/workspace", isActive: false },
    { label: "", isActive: true },
  ]
  const objectItems = [
    { name: "dataplatform-loki-logs" },
    { name: "dataplatform-spark-history-server" },
    { name: "ghr-orange-linux-x64-dist-k0tii7b71x11a2h6n2zmsbr8" },
    { name: "qd-data-on-eks-tfstate-dev" },
    { name: "qd-data-platform-deltalake-20250521040204996600000002" },
    { name: "qd-data-platform-jupyterhub-20250521040204995700000001" },
    { name: "qd-data-platform-logs-20250506025303275300000004" },
    { name: "qd-gaming-uc-v2" },
    { name: "qd-sparq" },
    { name: "qd-sparq-sync-from-git" },
    { name: "qd-special-uc-playground" },
    { name: "qd-transaction-ambking-001" },
    { name: "qd-trino-exchange-bucket-20250525062509152400000001" },
    { name: "spark-operator-doeks-spark-logs-20250430051106464900000002" },
    { name: "trino-data-bucket-20250426102843911100000005" },
    { name: "trino-exchange-bucket-20250426102843943200000009" },
    { name: "trino-on-eks-trino-20250426102843914600000008" },
  ]
  return (
    <div className="text-sm font-sans w-full max-w-md">
      <div className="px-1 mt-2 mb-4">
        <Breadcrumb items={breadcrumbItems} />
      </div>
      <ul className="flex font-semibold gap-x-4 border-y pb-1 mb-1">
        <li className="align-top items-center">
          <input
            id="default-checkbox"
            type="checkbox"
            value=""
            className="mt-1"
          />
        </li>
        <li>Name</li>
      </ul>
      <ul className="space-y-1">
        {objectItems.map((item, index) => (
          <li key={index} className="flex gap-x-4">
            <span className="text-black-500 text-xs">
              <input
                id="default-checkbox"
                type="checkbox"
                value=""
                className="mt-1"
              />
            </span>
            <span className="flex items-center gap-x-2">
              <BsFolderFill className="text-black-500" />
              <span className="overflow-hidden whitespace-nowrap text-ellipsis max-w-[200px]">
                {item.name}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default ObjectFile
