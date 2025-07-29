"use client"

import { type ReactNode, useEffect } from "react"
import { useNavigate } from "react-router-dom"

import { useAuth } from "@/context/AuthContext"

export default function PrivateRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()

  const navigate = useNavigate()

  useEffect(() => {
    if (!user && !loading) {
      navigate("/auth")
    }
  }, [loading, user])

  if (loading) return <> </>
  return <>{children}</>
}
