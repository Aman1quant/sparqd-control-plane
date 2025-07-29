import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react"
import Cookies from "js-cookie"

interface User {
  id: number
  name: string
  username: string
  role: string
}

// const ACCESS_KEY = "auth.access_token"
// const REFRESH_KEY = "auth.refresh_token"

type TUserData = Partial<User>

interface AuthContextType {
  user: User | null
  token: string | null
  refreshToken?: string | null
  loading: boolean
  login: (user: User, token?: string, refreshToken?: string) => void
  logout: () => void
  updateUser: (userData: TUserData) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)
const { Provider } = AuthContext

const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [refreshToken, setRefreshToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const cookiesOptions = (): Cookies.CookieAttributes => {
    return {}
  }

  const login = (user: User) => {
    setUser(user)
    setToken(token)
    setRefreshToken(refreshToken)

    Cookies.set("user", JSON.stringify(user), cookiesOptions())
    // Cookies.set(ACCESS_KEY, token, cookiesOptions())
    // Cookies.set(REFRESH_KEY, refreshToken, cookiesOptions())

    setLoading(false)
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    setRefreshToken(null)

    Cookies.remove("user", cookiesOptions())
    // Cookies.remove(ACCESS_KEY, cookiesOptions())
    // Cookies.remove(REFRESH_KEY, cookiesOptions())

    setLoading(false)
  }

  const updateUser = (userData: TUserData) => {
    if (user) {
      const updatedUser = {
        ...user,
        ...userData,
      }

      setUser(updatedUser)
      Cookies.set("user", JSON.stringify(updatedUser), cookiesOptions())
    }
  }

  useEffect(() => {
    const storedUser = Cookies.get("user")
    // const storedToken = Cookies.get(ACCESS_KEY)
    // const storedRefreshToken = Cookies.get(REFRESH_KEY)

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
        // setToken(storedToken)
        // setRefreshToken(storedRefreshToken || null)
      } catch (error) {
        console.error("Failed to parse user data from cookie", error)
      }
    }

    setLoading(false)
  }, [])

  return (
    <Provider
      value={{ user, token, refreshToken, loading, login, logout, updateUser }}
    >
      {children}
    </Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export { AuthContext, AuthProvider }
