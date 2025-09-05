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
    password: "sparq-qd@3454",
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
  {
    id: 3,
    username: "dat01",
    password: "sparq-qd@dat01",
    name: "Admin dat01",
    role: "admin",
  },
    {
    id: 4,
    username: "dat02",
    password: "sparq-qd@dat02",
    name: "Admin dat02",
    role: "admin",
  },
  {
    id: 5,
    username: "zeal.aug",
    password: "sparq-qd@zeal.aug",
    name: "Admin zeal.aug",
    role: "admin",
  },
]

export type { User }
export { dataUser }
