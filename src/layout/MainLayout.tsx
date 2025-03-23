import { Link, Outlet, useLocation } from "react-router-dom"
import { useAppSelector } from "../hooks/redux-hooks"
import { selectUser } from "../app/authSlice"

export default function MainLayout() {
    const location = useLocation()
    const user = useAppSelector(selectUser)


    return (
        <div className="max-h-screen">
            <div className="bg-gray-100 min-w-screen min-h-screen relative px-5 pt-5 pb-24">
                <div>
                    <Outlet />
                </div>
                <div className="w-full max-w-md mx-auto fixed left-0 right-0 bottom-0">
                    <div className="px-7 bg-white shadow-lg rounded-t-xl">
                        <div className="flex">
                            <div className="flex-1 group">
                                <div
                                    className={`flex items-end justify-center text-center mx-auto px-4 pt-2 w-full ${location.pathname === "/"
                                            ? "text-blue-500 border-b-2 border-blue-500"
                                            : "text-gray-400 group-hover:text-blue-500 border-b-2 border-transparent group-hover:border-blue-500"
                                        }`}
                                >
                                    <Link to="/" className="block px-1 pt-1 pb-2">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-6 w-6 mx-auto mb-1"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                                            />
                                        </svg>
                                        <span className="block text-xs pb-1">Bosh sahifa</span>
                                    </Link>
                                </div>
                            </div>
                            <div className="flex-1 group">
                                <div
                                    className={`flex items-end justify-center text-center mx-auto px-4 pt-2 w-full ${location.pathname === "/tasks"
                                            ? "text-blue-500 border-b-2 border-blue-500"
                                            : "text-gray-400 group-hover:text-blue-500 border-b-2 border-transparent group-hover:border-blue-500"
                                        }`}
                                >
                                    <Link to="/tasks" className="block px-1 pt-1 pb-2">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-6 w-6 mx-auto mb-1"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                                            />
                                        </svg>
                                        <span className="block text-xs pb-1">Vazifalar</span>
                                    </Link>
                                </div>
                            </div>
                            <div className="flex-1 group">
                                <div
                                    className={`flex items-end justify-center text-center mx-auto px-4 pt-2 w-full ${location.pathname === "/tests" || location.pathname.startsWith("/tests/")
                                            ? "text-blue-500 border-b-2 border-blue-500"
                                            : "text-gray-400 group-hover:text-blue-500 border-b-2 border-transparent group-hover:border-blue-500"
                                        }`}
                                >
                                    <Link to="/tests" className="block px-1 pt-1 pb-2">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-6 w-6 mx-auto mb-1"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                            />
                                        </svg>
                                        <span className="block text-xs pb-1">Testlar</span>
                                    </Link>
                                </div>
                            </div>
                            <div className="flex-1 group">
                                <div
                                    className={`flex items-end justify-center text-center mx-auto px-4 pt-2 w-full ${location.pathname === "/history"
                                            ? "text-blue-500 border-b-2 border-blue-500"
                                            : "text-gray-400 group-hover:text-blue-500 border-b-2 border-transparent group-hover:border-blue-500"
                                        }`}
                                >
                                    <Link to="/history" className="block px-1 pt-1 pb-2">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-6 w-6 mx-auto mb-1"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                            />
                                        </svg>
                                        <span className="block text-xs pb-1">Tarix</span>
                                    </Link>
                                </div>
                            </div>
                            {user && user.role === "SUPERADMIN" && (
                                <div className="flex-1 group">
                                    <div
                                        className={`flex items-end justify-center text-center mx-auto px-4 pt-2 w-full ${location.pathname.startsWith("/admin")
                                                ? "text-blue-500 border-b-2 border-blue-500"
                                                : "text-gray-400 group-hover:text-blue-500 border-b-2 border-transparent group-hover:border-blue-500"
                                            }`}
                                    >
                                        <Link to="/admin" className="block px-1 pt-1 pb-2">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="h-6 w-6 mx-auto mb-1"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                                                />
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                                />
                                            </svg>
                                            <span className="block text-xs pb-1">Admin</span>
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

