import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useKeycloak } from "@react-keycloak/web"

import Logo from "@/images/new-logo.svg"
import Button from "@components/commons/Button"

import styles from "./Signin.module.scss"
import { useAuth } from "@context/AuthContext"
import { dataUser } from "./data"

const SignIn = () => {
  const { keycloak } = useKeycloak()
  const navigate = useNavigate()
  const { login, logout } = useAuth()

  useEffect(() => {
    if (keycloak.authenticated) {
      login(dataUser[0])
      navigate("/admin/workspace", { replace: true })
    } else {
      logout()
    }
  }, [keycloak.authenticated, navigate])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    keycloak.login()
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h2 className={styles.title}>
          Log in to <img src={Logo} alt="Logo" className={styles.logo} />
          <span className="text-primary text-2xl font-medium pl-1">SparQ</span>
        </h2>
        <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
          <div className="mb-5">
            <Button
              block
              variant="solid"
              color="primary"
              size="md"
              type="submit"
              label="Sign In"
            />
          </div>
        </form>
      </div>
    </div>
  )
}

export default SignIn
