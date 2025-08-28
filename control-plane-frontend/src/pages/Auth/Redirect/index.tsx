import { httpControlPlaneAPI } from "@http/axios"
import endpoint from "@http/endpoint"
import keycloak from "@http/keycloak"
import { useEffect } from "react"
import { useNavigate } from "react-router-dom"

const Redirect = () => {
  const navigate = useNavigate()
  const fetchOnboardingData = async () => {
    try {
      await httpControlPlaneAPI.post(endpoint.new_api.onboarding, {})

      navigate("/admin/manage_workspace", { replace: true })
    } catch (error) {
      console.error("Error fetching onboarding data:", error)
    }
  }

  useEffect(() => {
    if (keycloak.authenticated) {
      fetchOnboardingData()
    } else {
      keycloak.login({
        redirectUri: `${window.location.origin}/admin/manage_workspace`,
      })
    }
  }, [])

  return <div>Redirect..</div>
}

export default Redirect
