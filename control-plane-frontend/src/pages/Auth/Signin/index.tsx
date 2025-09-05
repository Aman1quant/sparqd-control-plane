import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useKeycloak } from "@react-keycloak/web"

// import qs from "qs"

import Logo from "@/images/new-logo.svg"
import TextInput from "@components/commons/TextInput"
import { Button } from "@components/commons"
import { useAuth } from "@context/AuthContext"
import { IconLock, IconUser } from "@tabler/icons-react"
import { dataUser } from "./data"

import styles from "./Signin.module.scss"
import axios from "axios"
import { httpControlPlaneAPIOnboarding } from "@http/axios"
// import { httpSuperset } from "@http/axios"
// import endpoint from "@http/endpoint"
// import { httpKeyCloack } from "@http/axios"
import endpoint from "@http/endpoint"

const SignIn = () => {
  const { keycloak } = useKeycloak()
  const navigate = useNavigate()
  const { login, logout } = useAuth()
  const onboarding = async () => {
    await httpControlPlaneAPIOnboarding.post(endpoint.new_api.onboarding, {}).catch((error) => {
      console.error("Error fetching onboarding data:", error)
    })
  }

  useEffect(() => {
    if (keycloak.authenticated) {
      login(dataUser[0])
      onboarding()
      navigate("/admin/workspace", { replace: true })
    } else {
      logout()
    }
  }, [keycloak.authenticated, navigate])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    keycloak.login()
  }


  // const [username, setUsername] = useState("")
  // const [password, setPassword] = useState("")

  // const { login } = useAuth()

  // const handleSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault()

  //   try {
  //     // const data = qs.stringify({
  //     //   username,
  //     //   password,
  //     //   grant_type: "password",
  //     //   client_id: import.meta.env.VITE_KEYCLOAK_CLIENT_ID,
  //     //   client_secret: import.meta.env.VITE_KEYCLOAK_CLIENT_SECRET,
  //     // })

  //     // const response = await httpKeyCloack.post(endpoint.auth.main, data)

  //     // const { access_token, refresh_token } = response.data

  //     // login(dataUser[0], access_token, refresh_token)

  //     const user = dataUser.find(
  //       (u) => u.username === username && u.password === password,
  //     )
  //     if (!user) {
  //       throw new Error("Invalid username or password")
  //     }

  //     // const loginSuperset = await httpSuperset.post(
  //     //   endpoint.superset.auth.login,
  //     //   {
  //     //     username: import.meta.env.VITE_SUPERSET_USERNAME || user.username,
  //     //     password: import.meta.env.VITE_SUPERSET_PASSWORD || user.password,
  //     //     refresh: true,
  //     //     provider: "db",
  //     //   },
  //     // )

  //     // console.log(loginSuperset)

  //     login(user)

  //     navigate("/admin/")
  //   } catch (error) {
  //     alert("Invalid username or password")
  //   }
  // }

  return (
    <>
      <div className={styles.container}>
        <div className={styles.card}>
          <h2 className={styles.title}>
            Log in to <img src={Logo} alt="Logo" className={styles.logo} />
            <span className=" text-primary text-2xl font-medium pl-1">
              <h1>SparQ</h1>
            </span>{" "}
          </h2>
          <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
            {/* <TextInput
              type="text"
              value={username}
              placeholder="Enter your username"
              onChange={setUsername}
              iconLeft={<IconUser />}
              autoFocus
              size="md"
            />
            <TextInput
              type="password"
              value={password}
              placeholder="Enter your password"
              onChange={setPassword}
              iconLeft={<IconLock />}
              size="md"
            /> */}
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
    </>
  )
}

export default SignIn
