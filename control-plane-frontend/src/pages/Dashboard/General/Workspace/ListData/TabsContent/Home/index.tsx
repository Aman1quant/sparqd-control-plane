import { useNavigate } from "react-router-dom"
import styles from "./Home.module.scss"
import { dataWorkspaceTableHome } from "./data"
import { Table } from "@components/commons"
import Dropdown from "@components/commons/Dropdown"
import { Button } from "@components/commons"
import { useModal } from "@context/layout/ModalContext"
import CreateModalWorkspace from "./CreateModal"
import {
  IconDotsVertical,
  IconMessageDots,
  IconNotebook,
  IconStar,
} from "@tabler/icons-react"

const WorkspaceTableHome = () => {
  const navigate = useNavigate()
  const { modal, handleModal, closeModal } = useModal()

  const handleOpenModal = () => {
    if (modal) return closeModal()
    handleModal(
      <CreateModalWorkspace isOpen={true} handleCloseModal={closeModal} />,
    )
  }
  const columns = [
    {
      label: "",
      sortable: false,
    },
    {
      label: "Name",
      sortable: true,
    },
    {
      label: "Type",
      sortable: true,
    },
    {
      label: "Owner",
      sortable: true,
    },
    {
      label: "Created at",
      sortable: true,
    },
    {
      label: "",
      sortable: false,
    },
  ]

  return (
    <>
      <div className="grid grid-cols-2 gap-4 mb-8 items-center">
        <label className="flex items-center text-black text-heading-6 font-medium px-3 gap-x-2">
          List of Workspace
          <IconStar size={16} />
        </label>
        <div className="flex justify-end gap-x-2">
          <Button
            variant="link"
            color="primary"
            size="md"
            iconLeft={<IconMessageDots size={20} />}
            label="Send Feedback"
          />
          <Button
            variant="link"
            color="primary"
            size="md"
            iconLeft={<IconDotsVertical size={20} />}
            showLabel={false}
          />
          <Button variant="outline" color="primary" size="md" label="Share" />
          <Button
            variant="solid"
            color="primary"
            size="md"
            label="Create"
            onClick={handleOpenModal}
          />
        </div>
      </div>

      <div className={styles.workspaceTableHomeWrapper}>
        <Table.Table className="w-full">
          <Table.TableHeader columns={columns} />
          <Table.TableBody>
            {dataWorkspaceTableHome.map((workspaceTableHome) => (
              <Table.TableRow key={workspaceTableHome.id} className="group">
                <Table.TableCell>
                  <div className="invisible group-hover:visible flex  items-center align-middle gap-x-2">
                    <input id="default-checkbox" type="checkbox" value="" />
                    <IconStar size={16} />
                  </div>
                </Table.TableCell>
                <Table.TableCell>
                  <Button
                    variant="link"
                    color="primary"
                    size="sm"
                    iconLeft={<IconNotebook size={16} />}
                    label={workspaceTableHome.name}
                    onClick={() => {
                      navigate("/admin/workspace/create")
                    }}
                  />
                </Table.TableCell>

                <Table.TableCell>{workspaceTableHome.type}</Table.TableCell>
                <Table.TableCell>{workspaceTableHome.owner}</Table.TableCell>

                <Table.TableCell>
                  {workspaceTableHome.createdAt}
                </Table.TableCell>

                <Table.TableCell>
                  <Dropdown
                    items={[
                      {
                        label: "Detail",
                      },
                      {
                        label: "Edit",
                        onClick: () => {
                          console.log("Edit")
                        },
                      },
                    ]}
                    theme="default"
                    size="sm"
                    showArrow={false}
                    label={<IconDotsVertical size={16} />}
                  />
                </Table.TableCell>
              </Table.TableRow>
            ))}
          </Table.TableBody>
        </Table.Table>
      </div>
    </>
  )
}

export default WorkspaceTableHome
