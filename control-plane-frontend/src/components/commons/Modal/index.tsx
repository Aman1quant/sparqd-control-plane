import React, { useEffect, useRef } from "react"
import type { ReactNode } from "react"
import styles from "./Modal.module.scss"
import { BsX } from "react-icons/bs"

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: ReactNode
  footer?: ReactNode
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
}) => {
  const backdropRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", handleEsc)
    return () => document.removeEventListener("keydown", handleEsc)
  }, [onClose])

  const handleClickOutside = (e: React.MouseEvent) => {
    if (e.target === backdropRef.current) onClose()
  }

  if (!isOpen) return null

  return (
    <div
      ref={backdropRef}
      onClick={handleClickOutside}
      className={styles.backdrop}
      aria-modal="true"
      role="dialog"
    >
      <div className={styles.modalWrapper}>
        <div className={styles.modalContainer}>
          {/* Header */}
          <div className={styles.modalHeader}>
            <h3 className={styles.modalTitle}>{title}</h3>
            <button onClick={onClose} className={styles.modalClose}>
              <span className="sr-only">Close modal</span>
              <BsX />
            </button>
          </div>

          {/* Body */}
          <div className={styles.modalBody}>{children}</div>

          {/* Footer */}
          <div className={styles.modalFooter}>
            {footer ?? (
              <>
                <button onClick={onClose}>OK</button>
                <button onClick={onClose}>Cancel</button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Modal
