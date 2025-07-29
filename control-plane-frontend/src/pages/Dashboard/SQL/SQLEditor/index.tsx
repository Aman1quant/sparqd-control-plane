import { useEffect, useState } from "react"
import clsx from "clsx"
import { TiBook } from "react-icons/ti"
import hugIcon from "@assets/hugeIcon.png"

import { useHeader } from "@context/layout/header/HeaderContext"

import styles from "./SQLEditor.module.scss"
import { Button, Select, Table, Tabs } from "@components/commons"
import { BiFullscreen, BiSearch } from "react-icons/bi"
import { MdArrowDropDown, MdOutlineSensorWindow } from "react-icons/md"
import { FiDatabase } from "react-icons/fi"
import Dropdown from "@components/commons/Dropdown"
import { BsStar, BsThreeDotsVertical } from "react-icons/bs"
import { GoShareAndroid } from "react-icons/go"
import QueryEditor from "@components/shared/QueryEditor"
import { TbAlignBoxTopRight } from "react-icons/tb"
import { IoClose } from "react-icons/io5"
import SQLMenu from "./SQLMenu"
import { IconPlayerPlayFilled } from "@tabler/icons-react"

interface TableData {
  day: string
  site: string
  access_method: string
  ad_type: string
  ad_format: string
  ad_size: string
  device: string
  section: string
}

const SQLEditor = () => {
  const { dispatch } = useHeader()

  const sidebarItems = [
    { icon: <TiBook className="text-primary" />, active: true },
    { icon: <TiBook className="text-primary" />, active: false },
  ]

  const options = [
    { value: "cdp", label: "cdp" },
    { value: "user1", label: "User 1" },
    { value: "user2", label: "User 2" },
  ]

  const items = [
    { label: "New Query 2025-04-08 8:24pm", active: false },
    { label: "digital _inventory_test", active: true },
  ]

  const tabTable = [{ label: "Raw Result", active: true }]

  const columnTable = [
    { label: "", sortable: false },
    { label: "day", sortable: true },
    { label: "site", sortable: true },
    { label: "access_method", sortable: true },
    { label: "ad_type", sortable: true },
    { label: "ad_format", sortable: true },
    { label: "ad_size", sortable: true },
    { label: "device", sortable: true },
    { label: "section", sortable: true },
  ]

  const dataTable: TableData[] = [
    {
      day: "20220809",
      site: "CNA",
      access_method: "Mobile App",
      ad_type: "display",
      ad_format: "standard",
      ad_size: "300x600",
      device: "mobile",
      section: "Homepage",
    },
    {
      day: "20220809",
      site: "CNA",
      access_method: "Mobile App",
      ad_type: "display",
      ad_format: "standard",
      ad_size: "300x600",
      device: "mobile",
      section: "Homepage",
    },
    {
      day: "20220809",
      site: "CNA",
      access_method: "Mobile App",
      ad_type: "display",
      ad_format: "standard",
      ad_size: "300x600",
      device: "mobile",
      section: "Homepage",
    },
    {
      day: "20220809",
      site: "CNA",
      access_method: "Mobile App",
      ad_type: "display",
      ad_format: "standard",
      ad_size: "300x600",
      device: "mobile",
      section: "Homepage",
    },
    {
      day: "20220809",
      site: "CNA",
      access_method: "Mobile App",
      ad_type: "display",
      ad_format: "standard",
      ad_size: "300x600",
      device: "mobile",
      section: "Homepage",
    },
    {
      day: "20220809",
      site: "CNA",
      access_method: "Mobile App",
      ad_type: "display",
      ad_format: "standard",
      ad_size: "300x600",
      device: "mobile",
      section: "Homepage",
    },
    {
      day: "20220809",
      site: "CNA",
      access_method: "Mobile App",
      ad_type: "display",
      ad_format: "standard",
      ad_size: "300x600",
      device: "mobile",
      section: "Homepage",
    },
    {
      day: "20220809",
      site: "CNA",
      access_method: "Mobile App",
      ad_type: "display",
      ad_format: "standard",
      ad_size: "300x600",
      device: "mobile",
      section: "Homepage",
    },
    {
      day: "20220809",
      site: "CNA",
      access_method: "Mobile App",
      ad_type: "display",
      ad_format: "standard",
      ad_size: "300x600",
      device: "mobile",
      section: "Homepage",
    },
    {
      day: "20220809",
      site: "CNA",
      access_method: "Mobile App",
      ad_type: "display",
      ad_format: "standard",
      ad_size: "300x600",
      device: "mobile",
      section: "Homepage",
    },
    {
      day: "20220809",
      site: "CNA",
      access_method: "Mobile App",
      ad_type: "display",
      ad_format: "standard",
      ad_size: "300x600",
      device: "mobile",
      section: "Homepage",
    },
    {
      day: "20220809",
      site: "CNA",
      access_method: "Mobile App",
      ad_type: "display",
      ad_format: "standard",
      ad_size: "300x600",
      device: "mobile",
      section: "Homepage",
    },
    {
      day: "20220809",
      site: "CNA",
      access_method: "Mobile App",
      ad_type: "display",
      ad_format: "standard",
      ad_size: "300x600",
      device: "mobile",
      section: "Homepage",
    },
    {
      day: "20220809",
      site: "CNA",
      access_method: "Mobile App",
      ad_type: "display",
      ad_format: "standard",
      ad_size: "300x600",
      device: "mobile",
      section: "Homepage",
    },
  ]

  const [data, setData] = useState<TableData[]>([])

  useEffect(() => {
    dispatch({
      type: "SET_HEADER",
      payload: {
        title: "",
        description: "",
        search: true,
      },
    })
  }, [])

  return (
    <div className={styles.container}>
      <div className={styles.sidebar}>
        {sidebarItems.map((item, index) => (
          <div
            key={index}
            className={clsx(styles.item, item.active && styles.active)}
          >
            {item.icon}
          </div>
        ))}
      </div>
      <div className="sqlMenu">
        <SQLMenu />
      </div>
      <Tabs
        items={items}
        showCount={true}
        onAddClick={() => {}}
        renderContent={() => (
          <div>
            <div className="flex items-center justify-between px-[15px] py-2">
              <div className="flex gap-6">
                <Button
                  variant="solid"
                  color="primary"
                  size="sm"
                  label="Run now"
                  iconLeft={<IconPlayerPlayFilled size={16} />}
                  onClick={() => {
                    setData(dataTable)
                  }}
                />

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <MdOutlineSensorWindow className="text-[#1C1B1F] text-[18px]" />
                    <span className="text-black">aileen-ext.</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <FiDatabase className="text-[#1C1B1F] text-[18px]" />
                    <span className="text-black">aileen-ext.</span>
                    <MdArrowDropDown className="text-[#1C1B1F] text-[18px]" />
                  </div>
                </div>
              </div>

              <div className="flex gap-2 items-center">
                <Dropdown
                  items={[
                    {
                      label: "Clone",
                      onClick: () => {},
                    },
                    {
                      label: "Edit query info",
                      onClick: () => {},
                    },
                    {
                      label: "Manual",
                      onClick: () => {},
                    },
                    {
                      label: "Add to dashboard",
                      onClick: () => {},
                    },
                    {
                      label: "Create alert",
                      onClick: () => {},
                    },
                    {
                      divider: true,
                    },
                    {
                      label: "Format query",
                      onClick: () => {},
                    },
                    {
                      label: "Disable autocomplete",
                      onClick: () => {},
                    },
                    {
                      label: "Disable enter to accept autocomplete",
                      onClick: () => {},
                    },
                    {
                      label: "See keyboard shortcuts",
                      onClick: () => {},
                    },
                    {
                      label: "Query snippets",
                      onClick: () => {},
                    },
                    {
                      divider: true,
                    },
                    {
                      label: "Move",
                      onClick: () => {},
                    },
                    {
                      label: "Move to trash",
                      onClick: () => {},
                    },
                    {
                      label: "Go to folder",
                      onClick: () => {},
                    },
                    {
                      divider: true,
                    },
                    {
                      label: "Send feedback",
                      onClick: () => {},
                    },
                  ]}
                  theme="default"
                  size="sm"
                  showArrow={false}
                  label={<BsThreeDotsVertical className="text-body-medium" />}
                />

                <div className="w-7 h-7 flex items-center justify-center">
                  <BsStar className=" text-black" />
                </div>

                <Select
                  options={options}
                  value={"cdp"}
                  onChange={() => {}}
                  placeholder="Created by"
                  className="!w-[180px]"
                />

                <Button
                  variant="outline"
                  color="primary"
                  size="sm"
                  label="Save"
                />

                <Button
                  variant="outline"
                  color="primary"
                  size="sm"
                  label="Schedule"
                />

                <Button
                  variant="outline"
                  color="primary"
                  size="md"
                  showLabel={false}
                  iconLeft={<GoShareAndroid size={16} />}
                />
              </div>
            </div>

            <div className="">
              <QueryEditor
                theme="light"
                className="min-h-[320px] overflow-auto"
              />
            </div>

            <div className="border-t-2 min-h-12 flex justify-between p-3 relative">
              <Tabs
                items={tabTable}
                showCount={false}
                onAddClick={() => {}}
                showDropdown={true}
                dropdownOptions={[
                  {
                    label: "Create custom table",
                    onClick: () => console.log("Create custom table"),
                  },
                  {
                    label: "Download CSV",
                    onClick: () => console.log("Download CSV"),
                  },
                  {
                    label: "Download TSV",
                    onClick: () => console.log("Download TSV"),
                  },
                  {
                    label: "Download Excel",
                    onClick: () => console.log("Download Excel"),
                  },
                  {
                    label: "Copy results to clipboard",
                    onClick: () => console.log("Copy results"),
                  },
                ]}
                renderContent={() => (
                  <div className="w-full h-full flex items-center justify-center min-h-[400px]">
                    {data.length > 0 ? (
                      <Table.Table
                        className="!w-auto min-w-[1000px]"
                        theme="query"
                      >
                        <Table.TableHeader columns={columnTable} />
                        <Table.TableBody>
                          {dataTable.map((item, index) => (
                            <Table.TableRow key={index}>
                              <Table.TableCell>{index + 1}</Table.TableCell>
                              <Table.TableCell>{item.day}</Table.TableCell>
                              <Table.TableCell>{item.site}</Table.TableCell>
                              <Table.TableCell>
                                {item.access_method}
                              </Table.TableCell>
                              <Table.TableCell>{item.ad_type}</Table.TableCell>
                              <Table.TableCell>
                                {item.ad_format}
                              </Table.TableCell>
                              <Table.TableCell>{item.ad_size}</Table.TableCell>
                              <Table.TableCell>{item.device}</Table.TableCell>
                              <Table.TableCell>{item.section}</Table.TableCell>
                            </Table.TableRow>
                          ))}
                        </Table.TableBody>
                      </Table.Table>
                    ) : (
                      <div className="empty-state w-full flex items-center justify-center h-full flex-col max-w-[416px] text-center">
                        <img
                          src={hugIcon}
                          alt="hug"
                          className="w-[100px] h-[100px] mb-7"
                        />

                        <div className="text flex flex-col items-center justify-center">
                          <div className="span text-heading-6 font-bold text-black/50">
                            Quickly return to your Favorites
                          </div>
                          <div className="description text-black/50 text-body-medium">
                            Mark useful or frequently used assets as Favorites
                            to quickly access them again
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              />
              <div className="option flex justify-center gap-4 absolute right-3 top-[15px]">
                <BiSearch className="" />
                <TbAlignBoxTopRight />
                <BiFullscreen />
                <IoClose />
              </div>
            </div>
          </div>
        )}
      />
    </div>
  )
}

export default SQLEditor
