interface User {
  id: number
  username: string
  password: string
  name: string
  role: "admin" | "editor"
}

const dataUser: User[] = [
  {
    id: 1,
    username: "admin",
    password: "admin123",
    name: "Admin",
    role: "admin",
  },
  {
    id: 2,
    username: "editor",
    password: "editor123",
    name: "Editor",
    role: "editor",
  },
]

export type { User }
export { dataUser }
