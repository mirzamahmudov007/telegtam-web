"use client"

import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { useAppSelector } from "../../hooks/redux-hooks"
import { selectUser } from "../../app/authSlice"
import api from "../../services/api"

interface OptionResult {
  optionId: number
  optionText: string
  isCorrect: boolean
}

interface QuestionResult {
  questionId: number
  questionText: string
  points: number
  earnedPoints: number
  isAnswered: boolean
  isCorrect: boolean
  selectedOptionIds: number[]
  options: OptionResult[]
}

interface TestResult {
  userTestId: number
  testId: number
  testTitle: string
  startedAt: string
  finishedAt: string
  score: number
  maxScore: number
  scorePercentage: number
  questionResults: QuestionResult[]
}

export default function TestResult() {
  const { userTestId } = useParams<{ userTestId: string }>()
  const user = useAppSelector(selectUser)

  const [loading, setLoading] = useState(true)
  const [result, setResult] = useState<TestResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [expandedQuestions, setExpandedQuestions] = useState<number[]>([])

  // Toggle question expansion
  const toggleQuestion = (questionId: number) => {
    if (expandedQuestions.includes(questionId)) {
      setExpandedQuestions(expandedQuestions.filter((id) => id !== questionId))
    } else {
      setExpandedQuestions([...expandedQuestions, questionId])
    }
  }

  // Calculate test duration
  const calculateDuration = (startTime: string, endTime: string) => {
    const start = new Date(startTime)
    const end = new Date(endTime)
    const durationMs = end.getTime() - start.getTime()

    const minutes = Math.floor(durationMs / (1000 * 60))
    const seconds = Math.floor((durationMs % (1000 * 60)) / 1000)

    return `${minutes} daqiqa ${seconds} soniya`
  }

  // Load test result
  useEffect(() => {
    const fetchResult = async () => {
      if (!userTestId) return

      try {
        setLoading(true)
        const response = await api.get(`/api/quiz/tests/${userTestId}/result`)
        setResult(response.data)
      } catch (error) {
        console.error("Error loading test result:", error)
        setError("Test natijasini yuklashda xatolik yuz berdi.")
      } finally {
        setLoading(false)
      }
    }

    fetchResult()
  }, [userTestId])

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
      ) : result ? (
        <div className="px-4">
          {/* Test summary */}
          <div className="bg-white p-4 rounded-lg shadow-md mb-4">
            <h1 className="text-xl font-bold text-gray-800 mb-3">{result.testTitle}</h1>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-gray-50 p-3 rounded-md">
                <p className="text-sm text-gray-500">Natija</p>
                <p className="text-2xl font-bold text-gray-800">
                  {result.score} / {result.maxScore}
                </p>
                <p className="text-sm text-blue-600">{result.scorePercentage.toFixed(1)}%</p>
              </div>

              <div className="bg-gray-50 p-3 rounded-md">
                <p className="text-sm text-gray-500">Vaqt</p>
                <p className="text-sm font-medium">
                  Boshlangan: {new Date(result.startedAt).toLocaleTimeString("uz-UZ")}
                </p>
                <p className="text-sm font-medium">
                  Yakunlangan: {new Date(result.finishedAt).toLocaleTimeString("uz-UZ")}
                </p>
                <p className="text-xs text-gray-500">
                  Davomiyligi: {calculateDuration(result.startedAt, result.finishedAt)}
                </p>
              </div>
            </div>

            {/* Score visualization */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-gray-700">Natija</span>
                <span className="text-sm font-medium text-gray-700">{result.scorePercentage.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className={`h-2.5 rounded-full ${result.scorePercentage >= 70
                      ? "bg-green-600"
                      : result.scorePercentage >= 50
                        ? "bg-yellow-500"
                        : "bg-red-600"
                    }`}
                  style={{ width: `${result.scorePercentage}%` }}
                ></div>
              </div>
            </div>

            <div className="flex justify-center">
              <Link to="/tests" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md mr-2">
                Testlar ro'yxatiga qaytish
              </Link>
              <Link to="/history" className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md">
                Test tarixini ko'rish
              </Link>
            </div>
          </div>

          {/* Questions */}
          <h2 className="text-lg font-bold text-gray-800 mb-3">Savollar va javoblar</h2>

          <div className="space-y-3">
            {result.questionResults.map((question) => (
              <div key={question.questionId} className="bg-white p-4 rounded-lg shadow-md">
                <div
                  className="flex justify-between items-start cursor-pointer"
                  onClick={() => toggleQuestion(question.questionId)}
                >
                  <div className="flex-1">
                    <div className="flex items-start">
                      <div
                        className={`mt-1 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${question.isCorrect
                            ? "bg-green-100 text-green-600"
                            : question.isAnswered
                              ? "bg-red-100 text-red-600"
                              : "bg-gray-100 text-gray-600"
                          }`}
                      >
                        {question.isCorrect ? (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        ) : question.isAnswered ? (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                              clipRule="evenodd"
                            />
                          </svg>
                        ) : (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </div>
                      <div className="ml-2">
                        <p className="text-gray-700">{question.questionText}</p>
                        <p className="text-xs text-gray-500">
                          {question.isAnswered
                            ? `${question.earnedPoints} / ${question.points} ball`
                            : "Javob berilmagan"}
                        </p>
                      </div>
                    </div>
                  </div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-5 w-5 text-gray-400 transform ${expandedQuestions.includes(question.questionId) ? "rotate-180" : ""}`}
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>

                {expandedQuestions.includes(question.questionId) && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="space-y-2">
                      {question.options.map((option) => (
                        <div
                          key={option.optionId}
                          className={`p-2 rounded-md ${option.isCorrect
                              ? "bg-green-50 border border-green-200"
                              : question.selectedOptionIds.includes(option.optionId) && !option.isCorrect
                                ? "bg-red-50 border border-red-200"
                                : "bg-gray-50 border border-gray-200"
                            }`}
                        >
                          <div className="flex items-center">
                            <div
                              className={`flex-shrink-0 w-4 h-4 rounded-full ${option.isCorrect
                                  ? "bg-green-100 text-green-600"
                                  : question.selectedOptionIds.includes(option.optionId) && !option.isCorrect
                                    ? "bg-red-100 text-red-600"
                                    : "bg-gray-100 text-gray-400"
                                } flex items-center justify-center`}
                            >
                              {option.isCorrect ? (
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-3 w-3"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              ) : question.selectedOptionIds.includes(option.optionId) ? (
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-3 w-3"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              ) : null}
                            </div>
                            <span className="ml-2 text-sm">{option.optionText}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-8 px-4">
          <h3 className="text-lg font-medium text-gray-700 mb-2">Natija topilmadi</h3>
          <p className="text-gray-500 mb-4">So'ralgan test natijasi mavjud emas yoki sizga tegishli emas.</p>
          <Link to="/tests" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md inline-block">
            Testlar ro'yxatiga qaytish
          </Link>
        </div>
      )}
    </div>
  )
}

