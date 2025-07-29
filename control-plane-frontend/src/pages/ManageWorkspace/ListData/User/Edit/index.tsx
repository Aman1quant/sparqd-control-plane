import { useState, useEffect } from "react"
import ReactDOM from "react-dom"
import { Button, Tabs } from "@components/commons"
import styles from "./UserEdit.module.scss"
import { useUserManagement } from "@context/user/UserContext"
import Switch from "@components/commons/Switch"
import TextInput from "@components/commons/TextInput"

const UserEdit = () => {
  const { closeEditModal, editingUser, handleUpdateUser } = useUserManagement()
  const [userData, setUserData] = useState(editingUser)

  useEffect(() => {
    setUserData(editingUser)
  }, [editingUser])

  if (!userData) return null

  const handleInputChange = (field: string, value: string) => {
    setUserData((prev) => (prev ? { ...prev, [field]: value } : null))
  }

  const handleRoleToggle = (role: string, checked: boolean) => {
    setUserData((prev) => {
      if (!prev) return null
      const newRoles = checked
        ? [...prev.roles, role]
        : prev.roles.filter((r) => r !== role)
      return { ...prev, roles: newRoles }
    })
  }

  const handleSave = () => {
    handleUpdateUser(userData.id, userData)
  }

  const tabItems = [
    { label: "User information", active: true },
    { label: "Roles", active: false },
  ]

  const allRoles = {
    "Account admin":
      "Can manage workspaces, users & groups, cloud resources and settings. This only indicates direct assignment of the role.",
    "Marketplace admin":
      "Can manage exchanges and listings on the Marketplace. This change might take a few minutes to update.",
    "Billing admin":
      "Can view Budgets and create budget policies. This change might take a few minutes to update.",
  }

  return ReactDOM.createPortal(
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>Edit user: {editingUser?.name}</h2>
          <button onClick={closeEditModal} className={styles.closeButton}>
            &times;
          </button>
        </div>
        <div className={styles.content}>
          <Tabs
            items={tabItems}
            renderContent={(activeTab) => {
              if (activeTab === "User information") {
                return (
                  <div className="space-y-4 mt-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        ID
                      </label>
                      <p>{userData.id}</p>
                    </div>
                    <TextInput label="Email" value={userData.email} readOnly />
                    <div className="grid grid-cols-2 gap-4">
                      <TextInput
                        label="First name*"
                        value={userData.firstName || ""}
                        onChange={(val) => handleInputChange("firstName", val)}
                      />
                      <TextInput
                        label="Last name"
                        value={userData.lastName || ""}
                        onChange={(val) => handleInputChange("lastName", val)}
                      />
                    </div>
                  </div>
                )
              }
              if (activeTab === "Roles") {
                return (
                  <div className="space-y-3 mt-4">
                    {Object.entries(allRoles).map(([role, description]) => (
                      <div
                        key={role}
                        className="flex items-center justify-between p-2 border rounded-md"
                      >
                        <div>
                          <label className="font-medium text-sm">{role}</label>
                          <p className="text-xs text-gray-500">{description}</p>
                        </div>
                        <Switch
                          checked={userData.roles.includes(role)}
                          onChange={(checked) =>
                            handleRoleToggle(role, checked)
                          }
                        />
                      </div>
                    ))}
                  </div>
                )
              }
              return null
            }}
          />
        </div>
        <div className={styles.footer}>
          <Button label="Cancel" variant="outline" onClick={closeEditModal} />
          <Button label="Save" variant="solid" onClick={handleSave} />
        </div>
      </div>
    </div>,
    document.body,
  )
}

export default UserEdit
