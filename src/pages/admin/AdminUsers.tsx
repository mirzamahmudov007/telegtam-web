"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { useAppSelector } from "../../hooks/redux-hooks"
import { selectUser } from "../../app/authSlice"
import api from "../../services/api"

interface User {
  id: number
  username: string
  firstName: string
  lastName: string
  telegramId: string
  role: "USER" | "ADMIN" | "SUPERADMIN"
  createdAt: string
  lastLoginAt: string
}

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [roleChangeUser, setRoleChangeUser] = useState<{
    id: number
    name: string
    currentRole: string
    newRole: string
  } | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const currentUser = useAppSelector(selectUser)

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true)
        const response = await api.get("/api/admin/users")
        setUsers(response.data)
      } catch (error) {
        console.error("Error fetching users:", error)
        alert("Foydalanuvchilarni yuklashda xatolik yuz berdi.")
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [])

  // Filter users by search term
  const filteredUsers = users.filter(
    (user) =>
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.telegramId.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Open role change dialog
  const openRoleChangeDialog = (user: User, newRole: string) => {
    setRoleChangeUser({
      id: user.id,
      name: `${user.firstName} ${user.lastName}`,
      currentRole: user.role,
      newRole,
    })
  }

  // Change user role
  const changeUserRole = async () => {
    if (!roleChangeUser || !currentUser) return

    try {
      setActionLoading(true)
      await api.patch(
        `/api/admin/users/${roleChangeUser.id}/role/${roleChangeUser.newRole}?currentUserId=${currentUser.id}`,
      )

      // Update local state
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === roleChangeUser.id
            ? { ...user, role: roleChangeUser.newRole as "USER" | "ADMIN" | "SUPERADMIN" }
            : user,
        ),
      )

      alert(`Foydalanuvchi roli muvaffaqiyatli o'zgartirildi: ${roleChangeUser.newRole}`)
    } catch (error) {
      console.error("Error changing user role:", error)
      alert("Foydalanuvchi rolini o'zgartirishda xatolik yuz berdi.")
    } finally {
      setActionLoading(false)
      setRoleChangeUser(null)
    }
  }

  // Check if current user is SUPERADMIN
  const isSuperAdmin = currentUser?.role === "SUPERADMIN"

  if (!currentUser || !isSuperAdmin) {
    return (
      <div className="pt-4 pb-24">
        <div className="bg-red-100 p-4 rounded-md text-red-700 max-w-md mx-auto">
          <h2 className="font-bold mb-2">Ruxsat yo'q</h2>
          <p>Bu sahifani ko'rish uchun SUPERADMIN huquqiga ega bo'lishingiz kerak.</p>
          <Link to="/" className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md inline-block">
            Bosh sahifaga qaytish
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-4 pb-24">
      <div className="flex justify-between items-center mb-4 px-4">
        <h1 className="text-2xl font-bold text-gray-800">Foydalanuvchilarni boshqarish</h1>
      </div>

      {/* Search */}
      <div className="px-4 mb-4">
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Foydalanuvchi qidirish..."
            className="w-full p-3 pl-10 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="absolute left-3 top-3.5 h-5 w-5 text-gray-400"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
              clipRule="evenodd"
            />
          </svg>
          {searchTerm && (
            <button onClick={() => setSearchTerm("")} className="absolute right-3 top-3.5">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-gray-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Users list */}
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : filteredUsers.length > 0 ? (
        <div className="space-y-3 px-4">
          {filteredUsers.map((user) => (
            <div key={user.id} className="bg-white p-4 rounded-lg shadow-md">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-medium text-gray-800">
                    {user.firstName} {user.lastName}
                  </h3>
                  <p className="text-sm text-gray-500">{user.username || "Foydalanuvchi nomi yo'q"}</p>
                </div>
                <div
                  className={`px-2 py-1 rounded-full text-xs ${user.role === "SUPERADMIN"
                      ? "bg-purple-100 text-purple-800"
                      : user.role === "ADMIN"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-green-100 text-green-800"
                    }`}
                >
                  {user.role}
                </div>
              </div>

              <div className="text-xs text-gray-500 mb-3">
                <p>Telegram ID: {user.telegramId}</p>
                <p>
                  Ro'yxatdan o'tgan:{" "}
                  {new Date(user.createdAt).toLocaleDateString("uz-UZ", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
                <p>
                  Oxirgi kirish:{" "}
                  {new Date(user.lastLoginAt).toLocaleDateString("uz-UZ", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>

              {/* Role management buttons */}
              <div className="flex justify-end space-x-2">
                {user.id !== currentUser.id && (
                  <>
                    {user.role !== "USER" && (
                      <button
                        onClick={() => openRoleChangeDialog(user, "USER")}
                        className="px-3 py-1 bg-green-100 hover:bg-green-200 text-green-700 rounded-md text-sm"
                      >
                        USER ga o'zgartirish
                      </button>
                    )}

                    {user.role !== "ADMIN" && (
                      <button
                        onClick={() => openRoleChangeDialog(user, "ADMIN")}
                        className="px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-md text-sm"
                      >
                        ADMIN ga o'zgartirish
                      </button>
                    )}

                    {user.role !== "SUPERADMIN" && (
                      <button
                        onClick={() => openRoleChangeDialog(user, "SUPERADMIN")}
                        className="px-3 py-1 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-md text-sm"
                      >
                        SUPERADMIN ga o'zgartirish
                      </button>
                    )}
                  </>
                )}

                {user.id === currentUser.id && (
                  <span className="text-xs text-gray-500 italic">Bu sizning hisobingiz</span>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 px-4">
          <h3 className="text-lg font-medium text-gray-700 mb-2">Foydalanuvchilar topilmadi</h3>
          <p className="text-gray-500 mb-4">
            {searchTerm
              ? "Qidiruv bo'yicha foydalanuvchilar topilmadi. Boshqa so'zlar bilan qidirib ko'ring."
              : "Hozirda foydalanuvchilar mavjud emas."}
          </p>
        </div>
      )}

      {/* Role change confirmation dialog */}
      {roleChangeUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Rolni o'zgartirish</h3>
            <p className="mb-4">
              <span className="font-medium">{roleChangeUser.name}</span> foydalanuvchisining rolini{" "}
              <span className="font-medium text-red-600">{roleChangeUser.currentRole}</span> dan{" "}
              <span className="font-medium text-green-600">{roleChangeUser.newRole}</span> ga o'zgartirishni istaysizmi?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setRoleChangeUser(null)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md"
              >
                Bekor qilish
              </button>
              <button
                onClick={changeUserRole}
                disabled={actionLoading}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md flex items-center"
              >
                {actionLoading && (
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                )}
                O'zgartirish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

