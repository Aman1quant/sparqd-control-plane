import { useState } from "react"
import ReactDOM from "react-dom"
import { Button } from "@components/commons"
import styles from "./UserCreate.module.scss"
import { useUserManagement } from "@context/user/UserContext"
import TextInput from "@components/commons/TextInput"

const UserCreate = () => {
  const { closeAddUserModal, addUser } = useUserManagement()
  const [email, setEmail] = useState("")
  const [fullName, setFullName] = useState("")

  const handleSubmit = () => {
    if (!email) {
      alert("Email is required")
      return
    }
    addUser(email, fullName)
  }

  return ReactDOM.createPortal(
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>Add user</h2>
          <button onClick={closeAddUserModal} className={styles.closeButton}>
            &times;
          </button>
        </div>
        <div className={styles.content}>
          <p className={styles.description}>
            Add a new user to this account.{" "}
            <a href="#" className="text-primary">
              Learn more
            </a>
          </p>
          <div className="space-y-4 mt-6">
            <TextInput
              label="New user email"
              value={email}
              onChange={setEmail}
              placeholder="user@example.com"
            />
            <TextInput
              label="New user full name"
              value={fullName}
              onChange={setFullName}
              placeholder="Enter full name"
            />
          </div>
        </div>
        <div className={styles.footer}>
          <Button
            label="Cancel"
            variant="outline"
            onClick={closeAddUserModal}
          />
          <Button label="Add user" variant="solid" onClick={handleSubmit} />
        </div>
      </div>
    </div>,
    document.body,
  )
}

export default UserCreate
