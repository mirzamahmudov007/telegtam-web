"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { BookOpen, Users, PlusCircle, BarChart } from "lucide-react"
import api from "../../services/api"
import { useAppSelector } from "../../hooks/redux-hooks"
import { selectUser } from "../../app/authSlice"

export default function AdminDashboard() {
  const user = useAppSelector(selectUser)
 
  const [stats, setStats] = useState({
    totalTests: 0,
    activeTests: 0,
    totalUsers: 0,
    adminUsers: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)

        // Fetch tests
        const testsData = await api.get("/api/admin/tests")

        // Fetch users
        const usersData = await api.get("/api/admin/users")

        // Calculate stats
        setStats({
          totalTests: testsData.length,
          activeTests: testsData.filter((test) => test.isActive).length,
          totalUsers: usersData.length,
          adminUsers: usersData.filter((user) => user.role === "ADMIN").length,
        })
      } catch (error) {
        console.error("Error fetching stats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (!user || user.role !== "SUPERADMIN") {
    return (
      <div className="pt-4 pb-24">
        <div className="bg-red-100 p-4 rounded-md text-red-700 max-w-md mx-auto">
          <h2 className="font-bold mb-2">Ruxsat yo'q</h2>
          <p>Bu sahifani ko'rish uchun admin huquqlariga ega bo'lishingiz kerak.</p>
          <Link to="/" className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md inline-block">
            Bosh sahifaga qaytish
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-4 pb-24">
      <div className="flex justify-between items-center mb-6 px-4">
        <h1 className="text-2xl font-bold text-gray-800">Admin panel</h1>
      </div>

      {/* Welcome section */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-4 mx-4">
        <h2 className="text-lg font-semibold mb-2">Xush kelibsiz, {user.firstName || user.username}!</h2>
        <p className="text-gray-600 mb-3">
          Bu yerda siz testlarni boshqarish, foydalanuvchilarni ko'rish va statistikani kuzatish imkoniyatiga egasiz.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6 px-4">
        <div className="bg-indigo-50 p-4 rounded-lg shadow-sm">
          <div className="flex items-center mb-2">
            <BookOpen className="h-5 w-5 text-indigo-600 mr-2" />
            <h3 className="font-medium">Testlar</h3>
          </div>
          {loading ? (
            <div className="h-8 bg-indigo-100 animate-pulse rounded"></div>
          ) : (
            <div className="flex justify-between">
              <div>
                <div className="text-2xl font-bold">{stats.totalTests}</div>
                <div className="text-xs text-gray-500">Jami</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{stats.activeTests}</div>
                <div className="text-xs text-gray-500">Faol</div>
              </div>
            </div>
          )}
        </div>

        <div className="bg-purple-50 p-4 rounded-lg shadow-sm">
          <div className="flex items-center mb-2">
            <Users className="h-5 w-5 text-purple-600 mr-2" />
            <h3 className="font-medium">Foydalanuvchilar</h3>
          </div>
          {loading ? (
            <div className="h-8 bg-purple-100 animate-pulse rounded"></div>
          ) : (
            <div className="flex justify-between">
              <div>
                <div className="text-2xl font-bold">{stats.totalUsers}</div>
                <div className="text-xs text-gray-500">Jami</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-indigo-600">{stats.adminUsers}</div>
                <div className="text-xs text-gray-500">Adminlar</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6 mx-4">
        <h2 className="text-lg font-semibold mb-3">Tezkor harakatlar</h2>
        <div className="grid grid-cols-2 gap-3">
          <Link
            to="/admin/tests/create"
            className="bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded-lg flex items-center justify-center"
          >
            <PlusCircle className="h-5 w-5 mr-2" />
            <span>Yangi test yaratish</span>
          </Link>
          <Link
            to="/admin/users"
            className="bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-lg flex items-center justify-center"
          >
            <Users className="h-5 w-5 mr-2" />
            <span>Foydalanuvchilarni boshqarish</span>
          </Link>
        </div>
      </div>

      {/* Navigation menu */}
      <div className="bg-white rounded-lg shadow-md p-4 mx-4">
        <h2 className="text-lg font-semibold mb-3">Boshqaruv menyusi</h2>
        <div className="space-y-2">
          <Link to="/admin/tests" className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
            <BookOpen className="h-5 w-5 text-indigo-600 mr-3" />
            <div>
              <h3 className="font-medium">Testlarni boshqarish</h3>
              <p className="text-xs text-gray-500">Testlarni yaratish, tahrirlash va o'chirish</p>
            </div>
          </Link>

          <Link to="/admin/users" className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
            <Users className="h-5 w-5 text-purple-600 mr-3" />
            <div>
              <h3 className="font-medium">Foydalanuvchilarni boshqarish</h3>
              <p className="text-xs text-gray-500">Foydalanuvchilarni ko'rish va admin huquqlarini berish</p>
            </div>
          </Link>

          <div className="flex items-center p-3 bg-gray-50 rounded-lg">
            <BarChart className="h-5 w-5 text-green-600 mr-3" />
            <div>
              <h3 className="font-medium">Statistika</h3>
              <p className="text-xs text-gray-500">Test natijalari va foydalanuvchi statistikasi (Tez kunda)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

