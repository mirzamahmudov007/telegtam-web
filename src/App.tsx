"use client"

import { useEffect, useState } from "react"
import { Navigate, Route, Routes } from "react-router-dom"
import MainLayout from "./layout/MainLayout"
import Home from "./pages/home/Home"
import ProtectedRoute from "./components/ProtectedRoute"
import Tasks from "./pages/tasks/Task"
import TelegramDebug from "./context/TelegramDebug"
import { loginUser, selectToken, selectUser, selectAuthLoading, selectAuthError } from "./app/authSlice"
import { useAppDispatch, useAppSelector } from "./hooks/redux-hooks"
import type { TelegramWindow } from "./types"
import TestList from "./pages/testList/TestList"
import TestTake from "./pages/testTake/TestTake"
import TestResult from "./pages/testResult/TestResult"
import UserHistory from "./pages/userHistory/UserHistory"
import AdminDashboard from "./pages/admin/AdminDashboard"
import AdminUsers from "./pages/admin/AdminUsers"
import AdminTests from "./pages/admin/AdminTests"
import TestCreate from "./pages/admin/TestCreate"
import TestEdit from "./pages/admin/TestEdit"

function App() {
  const [isLoaded, setIsLoaded] = useState(false)
  const [showDebug, setShowDebug] = useState(false)
  const dispatch = useAppDispatch()

  // Get auth state from Redux
  const token = useAppSelector(selectToken)
  const user = useAppSelector(selectUser)
  const loading = useAppSelector(selectAuthLoading)
  const error = useAppSelector(selectAuthError)

  
  useEffect(() => {
 
    // Safe initialization for Telegram WebApp
    const initAuth = async () => {
      try {
        // Check if we're in Telegram WebApp environment
        const telegramWindow = window as TelegramWindow

        if (telegramWindow.Telegram && telegramWindow.Telegram.WebApp) {

          // Initialize the WebApp
          telegramWindow.Telegram.WebApp.ready()

          // Try to get user from Telegram
          const telegramUser = telegramWindow.Telegram.WebApp.initDataUnsafe?.user

          if (telegramUser && telegramUser.id) {
            console.log("Found Telegram user:", telegramUser)
            dispatch(loginUser(telegramUser.id))
          } else {
            console.log("No Telegram user data available")

            // Try to get from URL params as fallback
            const urlParams = new URLSearchParams(window.location.search)
            const telegramId = urlParams.get("tgid")

            if (telegramId) {
              console.log("Found telegramId in URL:", telegramId)
              dispatch(loginUser(telegramId))
            } else {
              // For development - use a hardcoded ID
              // if (process.env.NODE_ENV === "development") {
              //   console.log("Using development telegramId")
              //   dispatch(loginUser("1381579135"))
              // }
            }
          }
        } else {
          console.log("Not in Telegram WebApp environment")

          // For development - use a hardcoded ID
          // if (process.env.NODE_ENV === "development") {
          //   console.log("Using development telegramId")
          //   dispatch(loginUser("1381579135"))
          // }
        }
      } catch (error) {
        console.error("Error initializing auth:", error)

        // For development - use mock data
        // if (process.env.NODE_ENV === "development") {
        //   console.log("Using mock auth data for development")
        //   dispatch(
        //     setAuthState({
        //       user: {
        //         id: 1,
        //         username: "dev_user",
        //         firstName: "Dev",
        //         lastName: "User",
        //         telegramId: "0",
        //       },
        //       token: "mock-token-for-development",
        //     }),
        //   )
        // }
      } finally {
        setIsLoaded(true)
      }
    }

    initAuth()
  }, [dispatch])

  return (
    <>
      {/* {isLoaded && (
        <div className="debug-info bg-gray-100 p-2 text-xs">
          <p>Token: {token ? `${token.substring(0, 15)}...` : "No token"}</p>
          <p>User: {user ? `${user.firstName} ${user.lastName}` : "Not logged in"}</p>
          {error && <p className="text-red-500">Error: {error}</p>}
          <button
            onClick={() => setShowDebug(!showDebug)}
            className="bg-blue-500 text-white px-2 py-1 rounded text-xs mt-1"
          >
            {showDebug ? "Скрыть отладку" : "Показать отладку Telegram"}
          </button>
        </div>
      )} */}

      {/* {showDebug && <TelegramDebug />} */}

      {loading ? (
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Home />} />
            <Route path="tasks" element={<Tasks />} />
              <Route path="tests" element={<TestList />} />
              <Route path="tests/:testId/take" element={<TestTake />} />
              <Route path="tests/:userTestId/result" element={<TestResult />} />
              <Route path="history" element={<UserHistory />} />

              <Route path="admin" element={<AdminDashboard />} />
              <Route path="admin/users" element={<AdminUsers />} />
              <Route path="admin/tests" element={<AdminTests />} />
              <Route path="admin/tests/create" element={<TestCreate />} />
              <Route path="admin/tests/:testId/edit" element={<TestEdit />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      )}
    </>
  )
}

export default App

