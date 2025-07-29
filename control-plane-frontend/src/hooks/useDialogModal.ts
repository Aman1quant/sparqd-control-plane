"use client"

import { useState } from "react"

export type TModalContent = React.ReactNode | null

const useDialogModal = () => {
  const [modal, setModal] = useState<boolean>(false)
  const [modalContent, setModalContent] = useState<TModalContent>(null)

  const handleModal = (content: TModalContent = null) => {
    if (content) {
      setModal(true)
      setModalContent(content)
    }
  }

  const openModal = () => setModal(true)
  const closeModal = () => {
    setModal(false)
    setModalContent(null)
  }
  const toggleModal = () => setModal((prev) => !prev)

  return {
    modal,
    modalContent,
    handleModal,
    openModal,
    closeModal,
    toggleModal,
  }
}

export default useDialogModal
