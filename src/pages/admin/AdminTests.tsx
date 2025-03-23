import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { useAppSelector } from "../../hooks/redux-hooks"
import { selectUser } from "../../app/authSlice"
import api from "../../services/api"

interface Test {
    id: number
    title: string
    subject: string
    description: string
    startTime: string
    endTime: string
    durationMinutes: number
    isActive: boolean
    createdBy: string
    questionCount: number
    totalPoints: number
}

export default function AdminTests() {
    const [tests, setTests] = useState<Test[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null)
    const [actionLoading, setActionLoading] = useState(false)
    const user = useAppSelector(selectUser)

    useEffect(() => {
        const fetchTests = async () => {
            try {
                setLoading(true)
                const response = await api.get("/api/admin/tests")
                setTests(response.data)
            } catch (error) {
                console.error("Error fetching tests:", error)
                alert("Testlarni yuklashda xatolik yuz berdi.")
            } finally {
                setLoading(false)
            }
        }

        fetchTests()
    }, [])

    // Filter tests by search term
    const filteredTests = tests.filter(
        (test) =>
            test.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            test.subject.toLowerCase().includes(searchTerm.toLowerCase())
    )

    // Toggle test active status
    const toggleTestStatus = async (testId: number, currentStatus: boolean) => {
        try {
            setActionLoading(true)

            if (currentStatus) {
                await api.post(`/api/admin/tests/${testId}/deactivate`)
            } else {
                await api.post(`/api/admin/tests/${testId}/activate`)
            }

            // Update local state
            setTests((prevTests) =>
                prevTests.map((test) => (test.id === testId ? { ...test, isActive: !currentStatus } : test))
            )

            alert(currentStatus ? "Test faol emas holatiga o'tkazildi." : "Test faol holatiga o'tkazildi.")
        } catch (error) {
            console.error("Error toggling test status:", error)
            alert("Test holatini o'zgartirishda xatolik yuz berdi.")
        } finally {
            setActionLoading(false)
        }
    }

    // Delete test
    const deleteTest = async (testId: number) => {
        try {
            setActionLoading(true)
            await api.delete(`/api/admin/tests/${testId}`)

            // Update local state
            setTests((prevTests) => prevTests.filter((test) => test.id !== testId))

            alert("Test o'chirildi.")
        } catch (error) {
            console.error("Error deleting test:", error)
            alert("Testni o'chirishda xatolik yuz berdi.")
        } finally {
            setActionLoading(false)
            setShowDeleteConfirm(null)
        }
    }

    if (!user) {
        return (
            <div className="pt-4 pb-24">
                <div className="bg-red-100 p-4 rounded-md text-red-700 max-w-md mx-auto">
                    <h2 className="font-bold mb-2">Ruxsat yo'q</h2>
                    <p>Bu sahifani ko'rish uchun tizimga kirishingiz kerak.</p>
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
                <h1 className="text-2xl font-bold text-gray-800">Testlarni boshqarish</h1>
                <Link
                    to="/admin/tests/create"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    Yangi test
                </Link>
            </div>

            {/* Search */}
            <div className="px-4 mb-4">
                <div className="relative">
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Test yoki fan qidirish..."
                        className="w-full p-3 pl-10 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                    </svg>
                    {searchTerm && (
                        <button onClick={() => setSearchTerm("")} className="absolute right-3 top-3.5">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </button>
                    )}
                </div>
            </div>

            {/* Tests list */}
            {loading ? (
                <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            ) : filteredTests.length > 0 ? (
                <div className="space-y-3 px-4">
                    {filteredTests.map((test) => (
                        <div key={test.id} className="bg-white p-4 rounded-lg shadow-md">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <h3 className="font-medium text-gray-800">{test.title}</h3>
                                    <p className="text-sm text-gray-500">{test.subject}</p>
                                </div>
                                <div
                                    className={`px-2 py-1 rounded-full text-xs ${test.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                                        }`}
                                >
                                    {test.isActive ? "Faol" : "Faol emas"}
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2 mb-3">
                                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                                    {test.questionCount} ta savol
                                </span>
                                <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs">
                                    {test.durationMinutes} daqiqa
                                </span>
                                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                                    {test.totalPoints} ball
                                </span>
                            </div>

                            <div className="text-xs text-gray-500 mb-3">
                                <p>
                                    Vaqt:{" "}
                                    {new Date(test.startTime).toLocaleDateString("uz-UZ", {
                                        month: "short",
                                        day: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    })}{" "}
                                    -{" "}
                                    {new Date(test.endTime).toLocaleDateString("uz-UZ", {
                                        month: "short",
                                        day: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    })}
                                </p>
                            </div>

                            <div className="flex justify-between items-center">
                                <div className="text-xs text-gray-500">Yaratuvchi: {test.createdBy}</div>

                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => toggleTestStatus(test.id, test.isActive)}
                                        disabled={actionLoading}
                                        className={`p-2 rounded-md ${test.isActive
                                                ? "bg-gray-100 hover:bg-gray-200 text-gray-700"
                                                : "bg-green-100 hover:bg-green-200 text-green-700"
                                            }`}
                                    >
                                        {test.isActive ? (
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                            </svg>
                                        ) : (
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                        )}
                                    </button>

                                    <Link
                                        to={`/admin/tests/${test.id}/edit`}
                                        className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-md"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                        </svg>
                                    </Link>

                                    <button
                                        onClick={() => setShowDeleteConfirm(test.id)}
                                        disabled={actionLoading}
                                        className="p-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-md"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            {/* Delete confirmation */}
                            {showDeleteConfirm === test.id && (
                                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
                                    <p className="text-sm text-red-700 mb-2">Haqiqatan ham bu testni o'chirmoqchimisiz?</p>
                                    <div className="flex justify-end space-x-2">
                                        <button
                                            onClick={() => setShowDeleteConfirm(null)}
                                            className="px-3 py-1 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md text-sm"
                                        >
                                            Bekor qilish
                                        </button>
                                        <button
                                            onClick={() => deleteTest(test.id)}
                                            disabled={actionLoading}
                                            className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm flex items-center"
                                        >
                                            {actionLoading && (
                                                <div className="animate-spin rounded-full h-3 w-3 border-t-2 border-b-2 border-white mr-1"></div>
                                            )}
                                            O'chirish
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-8 px-4">
                    <h3 className="text-lg font-medium text-gray-700 mb-2">Testlar topilmadi</h3>
                    <p className="text-gray-500 mb-4">
                        {searchTerm
                            ? "Qidiruv bo'yicha testlar topilmadi. Boshqa so'zlar bilan qidirib ko'ring."
                            : "Hozirda testlar mavjud emas. Yangi test yarating."}
                    </p>
                    <Link
                        to="/admin/tests/create"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md inline-flex items-center"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                        Yangi test yaratish
                    </Link>
                </div>
            )}
        </div>
    )
}
