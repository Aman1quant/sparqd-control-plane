import Keycloak from "keycloak-js"

const keycloak = new Keycloak({
  url: import.meta.env.VITE_KEYCLOAK_URL,
  realm: import.meta.env.VITE_KEYCLOAK_REALM || "default",
  clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID || "default-client",
})

export default keycloak
