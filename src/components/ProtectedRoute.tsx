import type { ReactNode } from "react"
import { useAppSelector } from "../hooks/redux-hooks"
import { selectIsAuthenticated } from "../app/authSlice"

interface ProtectedRouteProps {
    children: ReactNode
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
    const isAuthenticated = useAppSelector(selectIsAuthenticated)

    if (!isAuthenticated) {
       
        return (
            <div className="flex items-center justify-center h-screen flex-col">
                <h1 className="text-2xl font-bold mb-4">Authentication Required</h1>
                <p className="text-gray-600">Please log in to access this page</p>
            </div>
        )
    }

    return <>{children}</>
}

export default ProtectedRoute

