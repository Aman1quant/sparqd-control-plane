import { Routes, Route, Navigate } from "react-router-dom"

import DefaultLayout from "@pages/DefaultLayout"
import { ModalProvider } from "@context/layout/ModalContext"
import SignIn from "@pages/Auth/Signin"
import { AuthProvider } from "@context/AuthContext"
import { RoleManagementProvider } from "@context/role/RoleContext"
import { CreateWorkspaceProvider } from "@context/workspace/CreateWorkspace"

import { ReactKeycloakProvider } from "@react-keycloak/web"
import keycloak from "@http/keycloak"

import Redirect from "@pages/Auth/Redirect"

function App() {
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
        <AuthProvider>
          <RoleManagementProvider>
            <CreateWorkspaceProvider>
              <Routes>
                <Route path="auth/login" element={<SignIn />} />
                <Route path="auth/redirect" element={<Redirect />} />
                <Route path="admin/*" element={<DefaultLayout />} />
                <Route path="/" element={<Navigate to="/admin" replace />} />
                <Route
                  path="auth"
                  element={<Navigate to="/auth/login" replace />}
                />
              </Routes>
            </CreateWorkspaceProvider>
          </RoleManagementProvider>
        </AuthProvider>
      </ModalProvider>
    </ReactKeycloakProvider>
  )
}

export default App
