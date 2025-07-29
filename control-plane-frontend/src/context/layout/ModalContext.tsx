"use client"

import useDialogModal, { type TModalContent } from "@/hooks/useDialogModal"
import { createContext, useContext } from "react"
import { createPortal } from "react-dom"

export interface IModalContext {
  modal: boolean
  modalContent: TModalContent
  handleModal: (content: TModalContent) => void
  openModal: () => void
  closeModal: () => void
  toggleModal: () => void
}

const ModalContext = createContext<IModalContext | undefined>(undefined)

export const ModalProvider = ({ children }: { children: React.ReactNode }) => {
  const dialogModal = useDialogModal()

  return (
    <ModalContext.Provider value={dialogModal}>
      <Modal />
      {children}
    </ModalContext.Provider>
  )
}

const Modal = () => {
  const { modal, modalContent } = useContext(ModalContext) as IModalContext

  if (modal)
    return createPortal(
      <>{modalContent}</>,
      document.querySelector("#modal-root")!,
    )
  else return null
}

export const useModal = () => {
  const context = useContext(ModalContext)
  if (!context) throw new Error("useModal must be used within a ModalProvider")

  return context
}
