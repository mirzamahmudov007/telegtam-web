"use client"

import * as React from "react"
import { Toast, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport } from "./toast"

const TOAST_LIMIT = 5
const TOAST_REMOVE_DELAY = 5000

type ToastType = {
    id: string
    title?: string
    description?: string
    action?: React.ReactNode
    duration?: number
    variant?: "default" | "destructive"
}

type ToastContextType = {
    toasts: ToastType[]
    addToast: (toast: Omit<ToastType, "id">) => void
    removeToast: (id: string) => void
    removeAll: () => void
}

const ToastContext = React.createContext<ToastContextType>({
    toasts: [],
    addToast: () => { },
    removeToast: () => { },
    removeAll: () => { },
})

export function useToast() {
    const context = React.useContext(ToastContext)

    if (!context) {
        throw new Error("useToast must be used within a ToastProvider")
    }

    return context
}

export function ToastContainer({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = React.useState<ToastType[]>([])

    const addToast = React.useCallback((toast: Omit<ToastType, "id">) => {
        setToasts((prevToasts) => {
            const newToast = {
                id: crypto.randomUUID(),
                ...toast,
                duration: toast.duration || TOAST_REMOVE_DELAY,
            }

            return [...prevToasts, newToast].slice(-TOAST_LIMIT)
        })
    }, [])

    const removeToast = React.useCallback((id: string) => {
        setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id))
    }, [])

    const removeAll = React.useCallback(() => {
        setToasts([])
    }, [])

    return (
        <ToastContext.Provider value= {{ toasts, addToast, removeToast, removeAll }
}>
    <ToastProvider>
    { children }
{
    toasts.map(({ id, title, description, action, ...props }) => (
        <Toast key= { id } { ...props } >
    <div className="grid gap-1" >
    { title && <ToastTitle>{ title } </ToastTitle>}
{ description && <ToastDescription>{ description } </ToastDescription> }
</div>
{ action }
<ToastClose onClick={ () => removeToast(id) } />
    </Toast>
        ))}
<ToastViewport />
    </ToastProvider>
    </ToastContext.Provider>
  )
}

type ToastProps = {
    title?: string
    description?: string
    variant?: "default" | "destructive"
    [key: string]: any
}

export function toast({ title, description, variant, ...props }: ToastProps) {
    const { addToast } = useToast()

    addToast({
        title,
        description,
        variant,
        ...props,
    })
}

