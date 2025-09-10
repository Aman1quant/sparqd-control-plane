import { Routes, Route, Navigate } from "react-router-dom"
import { ToastContainer } from "react-toastify"

import DefaultLayout from "@pages/DefaultLayout"
import { ModalProvider } from "@context/layout/ModalContext"
import SignIn from "@pages/Auth/Signin"
import { AuthProvider } from "@context/AuthContext"
import { RoleManagementProvider } from "@context/role/RoleContext"
import { QueryProvider } from "@context/query/QueryContext"
import { CatalogProvider } from "@context/catalog/CatalogContext"
import { CreateWorkspaceProvider } from "@context/workspace/CreateWorkspace"

import { ReactKeycloakProvider } from "@react-keycloak/web"
import keycloak from "@http/keycloak"

function App() {
  console.log("🔑 Env Vars:");
  console.log("VITE_API_URL =", import.meta.env.VITE_API_URL);
  console.log("VITE_JUPYTER_API_URL =", import.meta.env.VITE_JUPYTER_API_URL);
  console.log("VITE_AIRFLOW_URL =", import.meta.env.VITE_AIRFLOW_URL);
  console.log("VITE_KEYCLOAK_URL =", import.meta.env.VITE_KEYCLOAK_URL);
  console.log("VITE_CONTROL_PLANE_API_BASE_URL =", import.meta.env.VITE_CONTROL_PLANE_API_BASE_URL);
  console.log("VITE_CONTROL_PLANE_API_BASE_URL_ONBOARDING =", import.meta.env.VITE_CONTROL_PLANE_API_BASE_URL_ONBOARDING);
  console.log("VITE_NEW_API =", import.meta.env.VITE_NEW_API);
  console.log("VITE_KEYCLOAK_REALM =", import.meta.env.VITE_KEYCLOAK_REALM);
  console.log("VITE_KEYCLOAK_CLIENT_ID =", import.meta.env.VITE_KEYCLOAK_CLIENT_ID);
  console.log("VITE_KEYCLOAK_CLIENT_SECRET =", import.meta.env.VITE_KEYCLOAK_CLIENT_SECRET);
  console.log("VITE_AUTH_USERNAME =", import.meta.env.VITE_AUTH_USERNAME);
  console.log("VITE_AUTH_PASSWORD =", import.meta.env.VITE_AUTH_PASSWORD);
  console.log("VITE_SUPERSET_URL =", import.meta.env.VITE_SUPERSET_URL);
  console.log("VITE_SUPERSET_NODE_URL =", import.meta.env.VITE_SUPERSET_NODE_URL);
  console.log("VITE_SUPERSET_USERNAME =", import.meta.env.VITE_SUPERSET_USERNAME);
  console.log("VITE_SUPERSET_PASSWORD =", import.meta.env.VITE_SUPERSET_PASSWORD);

  return (
    <ReactKeycloakProvider
      authClient={keycloak}
      initOptions={{
        onLoad: "check-sso",
        silentCheckSsoRedirectUri:
          window.location.origin + "/silent-check-sso.html",
        pkceMethod: "S256",
        responseMode: "query",
        redirectUri: `${window.location.origin}/auth/redirect`,
      }}
      onEvent={async (event, error) => {
        if (event === "onAuthSuccess") {
          // await httpControlPlaneAPI
          //   .post(endpoint.new_api.onboarding, {})
          //   .catch((error) => {
          //     console.error("Error fetching onboarding data:", error)
          //   })
        } else if (event === "onAuthError") {
          console.error("Authentication error:", error)
        } else if (event === "onTokenExpired") {
          keycloak.updateToken(30).catch((err) => {
            console.error("Failed to refresh token:", err)
            keycloak.logout({
              redirectUri: window.location.origin + "/auth/login",
            })
          })
        }
      }}
      LoadingComponent={<div>Loading...</div>}
    >
    <ModalProvider>
      <ToastContainer />
      <AuthProvider>
        <RoleManagementProvider>
        <CatalogProvider>
          <QueryProvider>
            <CreateWorkspaceProvider>
              <Routes>
                <Route path="auth/*" element={<SignIn />} />
                <Route path="admin/*" element={<DefaultLayout />} />
                <Route path="/" element={<Navigate to="/admin" replace />} />
              </Routes>
            </CreateWorkspaceProvider>
          </QueryProvider>
        </CatalogProvider>
        </RoleManagementProvider>
      </AuthProvider>
    </ModalProvider>
    </ReactKeycloakProvider>
  )
}

export default App
