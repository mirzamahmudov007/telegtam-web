"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { useAppSelector } from "../../hooks/redux-hooks"
import { selectUser } from "../../app/authSlice"
import api from "../../services/api"

interface TestResult {
  userTestId: number
  testId: number
  testTitle: string
  startedAt: string
  finishedAt: string
  score: number
  maxScore: number
  scorePercentage: number
}

export default function UserHistory() {
  const [history, setHistory] = useState<TestResult[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const user = useAppSelector(selectUser)

  useEffect(() => {
    const fetchHistory = async () => {
      if (!user) return

      try {
        setLoading(true)
        const response = await api.get(`/api/quiz/users/${user.id}/history`)
        setHistory(response.data)
      } catch (error) {
        console.error("Error fetching test history:", error)
        setError("Test tarixini yuklashda xatolik yuz berdi.")
      } finally {
        setLoading(false)
      }
    }

    fetchHistory()
  }, [user])

  // Get score class based on percentage
  const getScoreClass = (percentage: number) => {
    if (percentage >= 80) return "text-green-600"
    if (percentage >= 60) return "text-blue-600"
    if (percentage >= 40) return "text-yellow-600"
    return "text-red-600"
  }

  if (!user) {
    return (
      <div className="pt-4 pb-24">
        <div className="bg-red-100 p-4 rounded-md text-red-700 max-w-md mx-auto">
          <h2 className="font-bold mb-2">Ruxsat yo'q</h2>
          <p>Bu sahifani ko'rish uchun tizimga kirishingiz kerak.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-4 pb-24">
      <div className="flex justify-between items-center mb-4 px-4">
        <h1 className="text-2xl font-bold text-gray-800">Test tarixi</h1>
      </div>

      {error && (
        <div className="bg-red-100 p-4 rounded-md text-red-700 max-w-md mx-auto mb-4">
          <h2 className="font-bold mb-2">Xatolik</h2>
          <p>{error}</p>
          <button
            onClick={() => setError(null)}
            className="mt-2 bg-red-600 hover:bg-red-700 text-white px-4 py-1 rounded-md"
          >
            Yopish
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : history.length > 0 ? (
        <div className="space-y-3 px-4">
          {history.map((result) => (
            <div key={result.userTestId} className="bg-white p-4 rounded-lg shadow-md">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-medium text-gray-800">{result.testTitle}</h3>
                  <p className="text-sm text-gray-500">
                    {new Date(result.startedAt).toLocaleDateString("uz-UZ", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <div className={`text-lg font-bold ${getScoreClass(result.scorePercentage)}`}>
                  {result.score} / {result.maxScore}
                </div>
              </div>

              <div className="mb-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-700">Natija</span>
                  <span className="text-sm font-medium text-gray-700">{result.scorePercentage.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className={`h-2.5 rounded-full ${result.scorePercentage >= 80
                        ? "bg-green-600"
                        : result.scorePercentage >= 60
                          ? "bg-blue-600"
                          : result.scorePercentage >= 40
                            ? "bg-yellow-500"
                            : "bg-red-600"
                      }`}
                    style={{ width: `${result.scorePercentage}%` }}
                  ></div>
                </div>
              </div>

              <div className="text-xs text-gray-500 mb-3">
                <p>
                  Boshlangan:{" "}
                  {new Date(result.startedAt).toLocaleString("uz-UZ", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
                <p>
                  Yakunlangan:{" "}
                  {new Date(result.finishedAt).toLocaleString("uz-UZ", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>

              <Link
                to={`/tests/${result.userTestId}/result`}
                className="w-full block text-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
              >
                Batafsil ko'rish
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 px-4">
          <h3 className="text-lg font-medium text-gray-700 mb-2">Test tarixi bo'sh</h3>
          <p className="text-gray-500 mb-4">Siz hali birorta ham testni yakunlamagansiz.</p>
          <Link to="/tests" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md inline-block">
            Testlarni ko'rish
          </Link>
        </div>
      )}
    </div>
  )
}

