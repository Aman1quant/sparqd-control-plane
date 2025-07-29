import axios from "axios"
import type { AxiosError, AxiosInstance } from "axios"
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

const createInstanceWithoutToken = (baseURL: string): AxiosInstance => {
  const instance = axios.create({
    baseURL,
    timeout: 50000,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
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

const http: AxiosInstance = createInstance(
  import.meta.env.VITE_API_URL || "https://dth-airflow.askmedh.com/api",
)

export const httpKeycloak: AxiosInstance = createInstanceWithoutToken(
  import.meta.env.VITE_KEYCLOAK_URL || "https://dth-airflow.askmedh.com/auth",
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

export default http
