"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { BookOpen, Clock, Award, ChevronRight } from "lucide-react"
import  api  from "./../../services/api"
import { selectUser } from "../../app/authSlice"
import { useAppSelector } from "../../hooks/redux-hooks"

export default function Home() {
    const user = useAppSelector(selectUser)
  const [activeTests, setActiveTests] = useState([])
  const [subjects, setSubjects] = useState([])
  const [userHistory, setUserHistory] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Fetch active tests
        const testsData = await api.get("/api/quiz/tests")
        setActiveTests(testsData.slice(0, 3)) // Show only 3 tests

        // Fetch subjects
        const subjectsData = await api.get(`/api/quiz/subjects`)
        setSubjects(subjectsData)

        // Fetch user history
        if (user) {
          const historyData = await api.get(`/api/quiz/users/${user.id}/history`)
          setUserHistory(historyData.slice(0, 3)) // Show only 3 history items
        }
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user])

  return (
    <div className="pt-4 pb-24">
      <div className="flex justify-between items-center mb-6 px-4">
        <h1 className="text-2xl font-bold text-gray-800">Bosh sahifa</h1>
      </div>

      {/* Welcome section */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-4">
        <h2 className="text-lg font-semibold mb-2">
          Xush kelibsiz, {user?.firstName || user?.username || "Foydalanuvchi"}!
        </h2>
        <p className="text-gray-600 mb-3">
          Telegram Quiz platformasida bilimingizni sinab ko'ring va yangi bilimlar orttiring.
        </p>
        <Link
          to="/tests"
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md inline-flex items-center"
        >
          <BookOpen className="mr-2 h-5 w-5" />
          Testlarni ko'rish
        </Link>
      </div>

      {/* Active tests section */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-4">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-semibold">Faol testlar</h2>
          <Link to="/tests" className="text-indigo-600 hover:text-indigo-800 text-sm flex items-center">
            Barchasini ko'rish <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : activeTests.length > 0 ? (
          <div className="space-y-3">
            {activeTests.map((test) => (
              <Link
                key={test.id}
                to={`/tests/${test.id}/take`}
                className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-gray-800">{test.title}</h3>
                    <p className="text-sm text-gray-500">{test.subject}</p>
                  </div>
                  <div className="flex items-center text-xs text-gray-500">
                    <Clock className="h-3 w-3 mr-1" />
                    <span>{test.durationMinutes} daqiqa</span>
                  </div>
                </div>
                <div className="flex justify-between items-center mt-2 text-xs">
                  <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full">
                    {test.questionCount} ta savol
                  </span>
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full">{test.totalPoints} ball</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">Hozirda faol testlar mavjud emas</div>
        )}
      </div>

      {/* Subjects section */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-4">
        <h2 className="text-lg font-semibold mb-3">Fanlar</h2>

        {loading ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : subjects.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {subjects.map((subject, index) => (
              <Link
                key={index}
                to={`/tests?subject=${subject}`}
                className="bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg text-sm"
              >
                {subject}
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-gray-500">Hozirda fanlar mavjud emas</div>
        )}
      </div>

      {/* Recent history section */}
      {user && (
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold">So'nggi natijalar</h2>
            <Link to="/history" className="text-indigo-600 hover:text-indigo-800 text-sm flex items-center">
              Barchasini ko'rish <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          ) : userHistory.length > 0 ? (
            <div className="space-y-3">
              {userHistory.map((result) => (
                <Link
                  key={result.userTestId}
                  to={`/tests/${result.userTestId}/result`}
                  className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-800">{result.testTitle}</h3>
                      <p className="text-xs text-gray-500">
                        {new Date(result.finishedAt).toLocaleDateString("uz-UZ", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <div className="flex items-center">
                      <Award
                        className={`h-5 w-5 mr-1 ${result.scorePercentage >= 80
                            ? "text-green-500"
                            : result.scorePercentage >= 60
                              ? "text-yellow-500"
                              : "text-red-500"
                          }`}
                      />
                      <span className="font-medium">
                        {result.score}/{result.maxScore} ({Math.round(result.scorePercentage)}%)
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">Siz hali hech qanday testni yechmadingiz</div>
          )}
        </div>
      )}
    </div>
  )
}

