import axios, { type AxiosError, type AxiosInstance } from "axios"
import Cookies from "js-cookie"
import endpoint from "./endpoint"
import keycloak from "./keycloak"

const encodeBasicAuth = (username: string, password: string): string => {
  const token = `${username}:${password}`
  return btoa(token)
}

const createInstance = (baseURL: string): AxiosInstance => {
  const instance = axios.create({
    baseURL,
    timeout: 50000,
  })

  instance.interceptors.request.use(
    (config) => {
      const basicToken = encodeBasicAuth(
        import.meta.env.VITE_AUTH_USERNAME || "",
        import.meta.env.VITE_AUTH_PASSWORD || "",
      )
      config.headers = config.headers || {}
      config.headers["Authorization"] = `Basic ${basicToken}`
      return config
    },
    (error) => Promise.reject(error),
  )

  instance.interceptors.response.use(
    (res) => res,
    async (err: AxiosError) => {
      if (err.response?.status === 401) {
        window.location.href = "/auth/login"
      }

      return Promise.reject(err)
    },
  )

  return instance
}

const createInstance2 = (baseURL: string): AxiosInstance => {
  const instance = axios.create({
    baseURL,
    timeout: 50000,
  })

  instance.interceptors.request.use(
    (config) => {
      return config
    },
    (error) => Promise.reject(error),
  )

  instance.interceptors.response.use(
    (res) => res,
    async (err: AxiosError) => {
      if (err.response?.status === 401) {
        window.location.href = "/auth/login"
      }

      return Promise.reject(err)
    },
  )

  return instance
}

const createInstanceWithoutToken = (
  baseURL: string,
  contentType: string,
): AxiosInstance => {
  const instance = axios.create({
    baseURL,
    timeout: 50000,
    headers: {
      "Content-Type": contentType,
    },
  })

  instance.interceptors.response.use(
    (res) => res,
    (err: AxiosError) => {
      const pathname = window.location.pathname
      if (err.response?.status === 401 && pathname !== "/auth/login") {
        window.location.href = "/auth/login"
      }
      return Promise.reject(err)
    },
  )

  return instance
}

const createInstanceKeycloak = (baseURL: string): AxiosInstance => {
  const instance = axios.create({
    baseURL,
    timeout: 50000,
    headers: {
      "Content-Type": "application/json",
    },
  })

  instance.interceptors.request.use(
    (config) => {
      const token = keycloak.token
      if (token) {
        config.headers["Authorization"] = `Bearer ${token}`
      }
      return config
    },
    (error) => Promise.reject(error),
  )

  return instance
}

const createInstanceSuperset = (baseURL: string): AxiosInstance => {
  const instance = axios.create({
    baseURL,
    timeout: 50000,
  })

  instance.interceptors.request.use(
    (config) => {
      const token = Cookies.get("access_token_superset")

      if (token) config.headers["Authorization"] = `Bearer ${token}`
      return config
    },
    (error) => Promise.reject(error),
  )

  instance.interceptors.response.use(
    (res) => res,
    async (err: AxiosError) => {
      if (err.response?.status === 401) {
        const refreshToken = Cookies.get("refresh_token_superset")

        if (refreshToken) {
          try {
            const response = await axios.post(
              `${baseURL}${endpoint.superset.auth.refresh}`,
              {
                refresh_token: refreshToken,
              },
            )

            const newAccessToken = response.data.access_token
            Cookies.set("access_token_superset", newAccessToken)

            if (err.config) {
              err.config.headers["Authorization"] = `Bearer ${newAccessToken}`
              return instance.request(err.config)
            }
          } catch (refreshError) {
            try {
              const loginResponse = await axios.post(
                `${baseURL}${endpoint.superset.auth.login}`,
                {
                  username: import.meta.env.VITE_SUPERSET_USERNAME || "",
                  password: import.meta.env.VITE_SUPERSET_PASSWORD || "",
                  provider: "db",
                  refresh: true,
                },
              )

              const { access_token, refresh_token } = loginResponse.data
              Cookies.set("access_token_superset", access_token)
              Cookies.set("refresh_token_superset", refresh_token)

              if (err.config) {
                err.config.headers["Authorization"] = `Bearer ${access_token}`
                return instance.request(err.config)
              }
            } catch (loginError) {
              Cookies.remove("access_token_superset")
              Cookies.remove("refresh_token_superset")
              window.location.href = "/auth/login"
            }
          }
        } else {
          try {
            const loginResponse = await axios.post(
              `${baseURL}${endpoint.superset.auth.login}`,
              {
                username: import.meta.env.VITE_SUPERSET_USERNAME || "",
                password: import.meta.env.VITE_SUPERSET_PASSWORD || "",
                provider: "db",
              },
            )

            const { access_token, refresh_token } = loginResponse.data
            Cookies.set("access_token_superset", access_token)
            Cookies.set("refresh_token_superset", refresh_token)

            if (err.config) {
              err.config.headers["Authorization"] = `Bearer ${access_token}`
              return instance.request(err.config)
            }
          } catch (loginError) {
            window.location.href = "/auth/login"
          }
        }
      }

      return Promise.reject(err)
    },
  )

  return instance
}

const http: AxiosInstance = createInstance(
  import.meta.env.VITE_API_URL || "https://dth-airflow.askmedh.com/api",
)

export const httpKeycloak: AxiosInstance = createInstanceWithoutToken(
  import.meta.env.VITE_KEYCLOAK_URL || "https://dth-airflow.askmedh.com/auth",
  "application/x-www-form-urlencoded",
)

export const httpAirflow: AxiosInstance = createInstance(
  import.meta.env.VITE_AIRFLOW_URL || "https://dth-airflow.askmedh.com",
)

export const httpJupyter: AxiosInstance = createInstance(
  import.meta.env.VITE_JUPYTER_API_URL || "http://localhost:3002",
)

export const httpNewApi: AxiosInstance = createInstance2(
  import.meta.env.VITE_NEW_API || "http://localhost:3000/api",
)

export const httpControlPlaneAPI: AxiosInstance = createInstanceKeycloak(
  import.meta.env.VITE_CONTROL_PLANE_API_BASE_URL || "http://localhost:3000",
)

export const httpControlPlaneAPIOnboarding: AxiosInstance = createInstanceKeycloak(
  import.meta.env.VITE_CONTROL_PLANE_API_BASE_URL_OONBOARDING || "http://localhost:3000",
)

export const httpSuperset: AxiosInstance = createInstanceSuperset(
  import.meta.env.VITE_SUPERSET_URL || "https://dth-superset.askmedh.com/api",
)

export const httpNodeSuperset: AxiosInstance = createInstanceWithoutToken(
  import.meta.env.VITE_SUPERSET_NODE_URL || "http://localhost:3001/api",
  "application/json",
)

export default http
