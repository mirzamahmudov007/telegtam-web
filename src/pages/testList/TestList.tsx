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
  questionCount: number
  totalPoints: number
}

export default function TestList() {
  const [tests, setTests] = useState<Test[]>([])
  const [subjects, setSubjects] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const user = useAppSelector(selectUser)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Fetch active subjects
        const subjectsResponse = await api.get("/api/quiz/subjects")
        setSubjects(subjectsResponse.data)

        // Fetch active tests
        const testsResponse = await api.get("/api/quiz/tests")
        setTests(testsResponse.data)
      } catch (error) {
        console.error("Error fetching tests:", error)
        alert("Testlarni yuklashda xatolik yuz berdi.")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Filter tests by subject and search term
  const filteredTests = tests.filter((test) => {
    const matchesSubject = selectedSubject ? test.subject === selectedSubject : true
    const matchesSearch = test.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      test.description.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSubject && matchesSearch
  })

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
        <h1 className="text-2xl font-bold text-gray-800">Testlar</h1>
      </div>

      {/* Search and filter */}
      <div className="px-4 mb-4">
        <div className="relative mb-3">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Test qidirish..."
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

        {/* Subject filter */}
        <div className="flex overflow-x-auto pb-2 -mx-1">
          <button
            onClick={() => setSelectedSubject(null)}
            className={`flex-shrink-0 px-3 py-1 mx-1 rounded-full text-sm ${selectedSubject === null
                ? "bg-blue-600 text-white"
                : "bg-gray-200 hover:bg-gray-300 text-gray-700"
              }`}
          >
            Barcha fanlar
          </button>
          {subjects.map((subject) => (
            <button
              key={subject}
              onClick={() => setSelectedSubject(subject)}
              className={`flex-shrink-0 px-3 py-1 mx-1 rounded-full text-sm ${selectedSubject === subject
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                }`}
            >
              {subject}
            </button>
          ))}
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
              </div>

              {test.description && (
                <p className="text-sm text-gray-600 mb-3">{test.description}</p>
              )}

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

              <Link
                to={`/tests/${test.id}/take`}
                className="w-full block text-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
              >
                Testni boshlash
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 px-4">
          <h3 className="text-lg font-medium text-gray-700 mb-2">Testlar topilmadi</h3>
          <p className="text-gray-500 mb-4">
            {searchTerm || selectedSubject
              ? "Qidiruv bo'yicha testlar topilmadi. Boshqa parametrlar bilan qidirib ko'ring."
              : "Hozirda faol testlar mavjud emas."}
          </p>
        </div>
      )}
    </div>
  )
}
