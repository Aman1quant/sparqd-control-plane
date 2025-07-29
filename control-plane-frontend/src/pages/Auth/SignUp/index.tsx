import { useState } from "react"
import { useNavigate } from "react-router-dom"
// import qs from "qs"

import Logo from "@/images/new-logo.svg"
import TextInput from "@components/commons/TextInput"
import { Button } from "@components/commons"
import { IconLock, IconUser, IconMail, IconUserUp } from "@tabler/icons-react"

import styles from "./Signup.module.scss"
import { httpNewApi } from "@http/axios"
import endpoint from "@http/endpoint"
// import { httpKeycloak } from "@http/axios"
// import endpoint from "@http/endpoint"

const SignUp = () => {
  const navigate = useNavigate()
  const [payload, setPayload] = useState({
    accountName: "",
    fullName: "",
    email: "",
    password: "",
  })

  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setLoading(true)
      // const data = qs.stringify({
      //   username,
      //   password,
      //   grant_type: "password",
      //   client_id: import.meta.env.VITE_KEYCLOAK_CLIENT_ID,
      //   client_secret: import.meta.env.VITE_KEYCLOAK_CLIENT_SECRET,
      // })

      await httpNewApi.post(endpoint.new_api.auth.singup, payload)

      // const response = await httpKeycloak.post(endpoint.auth.main, data)

      // const { access_token, refresh_token } = response.data

      // login(dataUser[0], access_token, refresh_token)

      // navigate("/admin/")
      alert("Sign up successful! Please log in.")
      navigate("/auth/login", { replace: true })
    } catch (error) {
      alert("Error signing up. Please try again later.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className={styles.container}>
        <div className={styles.card}>
          <h2 className={styles.title}>
            Sign Up to <img src={Logo} alt="Logo" className={styles.logo} />
            <span className=" text-primary text-2xl font-medium pl-1">
              <h1>SparQ</h1>
            </span>{" "}
          </h2>
          <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
            <TextInput
              type="text"
              value={payload.accountName}
              placeholder="Enter your name"
              onChange={(value) =>
                setPayload({ ...payload, accountName: value })
              }
              iconLeft={<IconUser />}
              autoFocus
              size="md"
            />
            <TextInput
              type="text"
              value={payload.fullName}
              placeholder="Enter your full name"
              onChange={(value) => setPayload({ ...payload, fullName: value })}
              iconLeft={<IconUserUp />}
              size="md"
            />
            <TextInput
              type="text"
              value={payload.email}
              placeholder="Enter your email"
              onChange={(value) => setPayload({ ...payload, email: value })}
              iconLeft={<IconMail />}
              size="md"
            />
            <TextInput
              type="password"
              value={payload.password}
              placeholder="Enter your password"
              onChange={(value) => setPayload({ ...payload, password: value })}
              iconLeft={<IconLock />}
              size="md"
            />
            <div className="mb-5">
              <Button
                block
                variant="solid"
                color="primary"
                size="md"
                type="submit"
                label="Sign Up"
                disabled={loading}
              />
            </div>
          </form>
        </div>
      </div>
    </>
  )
}

export default SignUp
