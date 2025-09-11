import React from "react"
import { useAuth } from "@/context/AuthContext"
import styles from "./UserAvatar.module.scss"

interface UserAvatarProps {
  size?: "sm" | "md" | "lg"
  className?: string
  onClick?: () => void
}

const UserAvatar: React.FC<UserAvatarProps> = ({ 
  size = "md", 
  className = "", 
  onClick 
}) => {
  const { user } = useAuth()

  const getInitials = (name: string): string => {
    return name
      .split(" ")
      .map(word => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2) // Limit to 2 characters
  }

  const getInitialsFromUsername = (username: string): string => {
    return username
      .charAt(0)
      .toUpperCase()
  }

  const getDisplayInitials = (): string => {
    if (user?.name) {
      return getInitials(user.name)
    }
    if (user?.username) {
      return getInitialsFromUsername(user.username)
    }
    return "U" // Default fallback
  }

  const getBackgroundColor = (initials: string): string => {
    // Generate a consistent color based on initials using website's color palette
    const colors = [
      "#084E8F", // Primary blue
      "#3971A5", // Primary 700
      "#5283B0", // Primary 600
      "#1E7E25", // Green
      "#348A3A", // Green 800
      "#4B9750", // Green 700
      "#FF3B30", // Red
      "#FF4E44", // Red 800
      "#6FAAEc", // Secondary 500
      "#8BBBF0", // Secondary 600
    ]
    const index = initials.charCodeAt(0) % colors.length
    return colors[index]
  }

  const initials = getDisplayInitials()
  const backgroundColor = getBackgroundColor(initials)

  return (
    <div
      className={`${styles.avatar} ${styles[`avatar--${size}`]} ${className}`}
      style={{ backgroundColor }}
      onClick={onClick}
    >
      <span className={styles.avatar__initials}>{initials}</span>
    </div>
  )
}

export default UserAvatar