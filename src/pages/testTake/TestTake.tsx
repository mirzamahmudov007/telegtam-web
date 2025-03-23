"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useAppSelector } from "../../hooks/redux-hooks"
import { selectUser } from "../../app/authSlice"
import api from "../../services/api"

interface Option {
  optionId: number
  optionText: string
}

interface Question {
  questionId: number
  questionText: string
  questionType: "SINGLE_CHOICE" | "MULTIPLE_CHOICE"
  points: number
  options: Option[]
}

interface TestProgress {
  userTestId: number
  testId: number
  testTitle: string
  startedAt: string
  expiresAt: string
  isCompleted: boolean
  remainingSeconds: number
  totalQuestions: number
  answeredQuestions: number
  progressPercentage: number
}

export default function TestTake() {
  const { testId } = useParams<{ testId: string }>()
  const navigate = useNavigate()
  const user = useAppSelector(selectUser)

  const [loading, setLoading] = useState(true)
  const [startingTest, setStartingTest] = useState(false)
  const [submittingAnswer, setSubmittingAnswer] = useState(false)
  const [completingTest, setCompletingTest] = useState(false)

  const [userTestId, setUserTestId] = useState<number | null>(null)
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null)
  const [selectedOptions, setSelectedOptions] = useState<number[]>([])
  const [progress, setProgress] = useState<TestProgress | null>(null)
  const [timeLeft, setTimeLeft] = useState<string>("00:00:00")
  const [error, setError] = useState<string | null>(null)

  // Format remaining time
  const formatTimeLeft = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  // Start the test
  const startTest = async () => {
    if (!user || !testId) return

    try {
      setStartingTest(true)
      const response = await api.post(`/api/quiz/tests/${testId}/start?userId=${user.id}`)
      setUserTestId(response.data.id)
    } catch (error) {
      console.error("Error starting test:", error)
      setError("Testni boshlashda xatolik yuz berdi.")
    } finally {
      setStartingTest(false)
    }
  }

  // Load test progress
  const loadTestProgress = useCallback(async () => {
    if (!userTestId) return

    try {
      const response = await api.get(`/api/quiz/tests/progress/${userTestId}`)
      setProgress(response.data)
      setTimeLeft(formatTimeLeft(response.data.remainingSeconds))

      // If test is completed, navigate to results
      if (response.data.isCompleted) {
        navigate(`/tests/${userTestId}/result`)
      }
    } catch (error) {
      console.error("Error loading test progress:", error)
      setError("Test jarayonini yuklashda xatolik yuz berdi.")
    }
  }, [userTestId, navigate])

  // Load next question
  const loadNextQuestion = useCallback(async () => {
    if (!userTestId) return

    try {
      const response = await api.get(`/api/quiz/tests/${userTestId}/next-question`)

      // If no more questions (204 No Content)
      if (response.status === 204) {
        setCurrentQuestion(null)
        return
      }

      setCurrentQuestion(response.data)
      setSelectedOptions([])
    } catch (error) {
      console.error("Error loading next question:", error)
      setError("Savolni yuklashda xatolik yuz berdi.")
    }
  }, [userTestId])

  // Submit answer
  const submitAnswer = async () => {
    if (!userTestId || !currentQuestion || selectedOptions.length === 0) return

    try {
      setSubmittingAnswer(true)
      await api.post(`/api/quiz/tests/${userTestId}/submit-answer`, {
        questionId: currentQuestion.questionId,
        optionIds: selectedOptions,
      })

      // Reload progress and next question
      await loadTestProgress()
      await loadNextQuestion()
    } catch (error) {
      console.error("Error submitting answer:", error)
      setError("Javobni yuborishda xatolik yuz berdi.")
    } finally {
      setSubmittingAnswer(false)
    }
  }

  // Complete test
  const completeTest = async () => {
    if (!userTestId) return

    try {
      setCompletingTest(true)
      await api.post(`/api/quiz/tests/${userTestId}/complete`)
      navigate(`/tests/${userTestId}/result`)
    } catch (error) {
      console.error("Error completing test:", error)
      setError("Testni yakunlashda xatolik yuz berdi.")
    } finally {
      setCompletingTest(false)
    }
  }

  // Handle option selection
  const handleOptionSelect = (optionId: number) => {
    if (!currentQuestion) return

    if (currentQuestion.questionType === "SINGLE_CHOICE") {
      setSelectedOptions([optionId])
    } else {
      // For multiple choice, toggle the selection
      if (selectedOptions.includes(optionId)) {
        setSelectedOptions(selectedOptions.filter((id) => id !== optionId))
      } else {
        setSelectedOptions([...selectedOptions, optionId])
      }
    }
  }

  // Initialize test
  useEffect(() => {
    const initializeTest = async () => {
      if (!user || !testId) return

      try {
        setLoading(true)

        // Check if user already has an active test for this test
        const activeTestsResponse = await api.get(`/api/quiz/users/${user.id}/active-tests`)
        const activeTest = activeTestsResponse.data.find((test: any) => test.testId === Number.parseInt(testId))

        if (activeTest) {
          setUserTestId(activeTest.userTestId)
        }
      } catch (error) {
        console.error("Error initializing test:", error)
        setError("Testni yuklashda xatolik yuz berdi.")
      } finally {
        setLoading(false)
      }
    }

    initializeTest()
  }, [testId, user])

  // Load test progress and question when userTestId changes
  useEffect(() => {
    if (userTestId) {
      loadTestProgress()
      loadNextQuestion()
    }
  }, [userTestId, loadTestProgress, loadNextQuestion])

  // Timer effect
  useEffect(() => {
    if (!progress || progress.isCompleted) return

    const timer = setInterval(() => {
      if (progress.remainingSeconds <= 0) {
        clearInterval(timer)
        completeTest()
        return
      }

      setProgress((prev) => (prev ? { ...prev, remainingSeconds: prev.remainingSeconds - 1 } : null))
      setTimeLeft(formatTimeLeft(progress.remainingSeconds - 1))
    }, 1000)

    return () => clearInterval(timer)
  }, [progress])

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
      ) : !userTestId ? (
        <div className="bg-white p-6 rounded-lg shadow-md max-w-md mx-auto">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Testni boshlash</h1>
          <p className="text-gray-600 mb-6">
            Testni boshlashga tayyormisiz? Boshlangandan so'ng, test yakunlanmaguncha vaqt hisoblanadi.
          </p>
          <button
            onClick={startTest}
            disabled={startingTest}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex justify-center items-center"
          >
            {startingTest ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                Boshlanmoqda...
              </>
            ) : (
              "Testni boshlash"
            )}
          </button>
        </div>
      ) : (
        <div className="px-4">
          {/* Test header */}
          {progress && (
            <div className="bg-white p-4 rounded-lg shadow-md mb-4">
              <h1 className="text-xl font-bold text-gray-800 mb-2">{progress.testTitle}</h1>

              {/* Timer and progress */}
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-red-500 mr-1"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="font-medium">{timeLeft}</span>
                </div>
                <div>
                  <span className="text-sm text-gray-600">
                    {progress.answeredQuestions} / {progress.totalQuestions} savollar
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-blue-600 h-2.5 rounded-full"
                  style={{ width: `${progress.progressPercentage}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Question */}
          {currentQuestion ? (
            <div className="bg-white p-4 rounded-lg shadow-md mb-4">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-lg font-medium text-gray-800">
                  Savol {progress?.answeredQuestions ? progress.answeredQuestions + 1 : 1}
                </h2>
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                  {currentQuestion.points} ball
                </span>
              </div>

              <p className="text-gray-700 mb-4">{currentQuestion.questionText}</p>

              <div className="space-y-2 mb-6">
                {currentQuestion.options.map((option) => (
                  <div
                    key={option.optionId}
                    onClick={() => handleOptionSelect(option.optionId)}
                    className={`p-3 border rounded-md cursor-pointer ${selectedOptions.includes(option.optionId)
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-300 hover:border-gray-400"
                      }`}
                  >
                    <div className="flex items-center">
                      {currentQuestion.questionType === "SINGLE_CHOICE" ? (
                        <div
                          className={`w-4 h-4 rounded-full border ${selectedOptions.includes(option.optionId)
                              ? "border-blue-500 bg-blue-500"
                              : "border-gray-400"
                            }`}
                        >
                          {selectedOptions.includes(option.optionId) && (
                            <div className="w-2 h-2 rounded-full bg-white mx-auto mt-0.5"></div>
                          )}
                        </div>
                      ) : (
                        <div
                          className={`w-4 h-4 rounded border ${selectedOptions.includes(option.optionId)
                              ? "border-blue-500 bg-blue-500 flex items-center justify-center"
                              : "border-gray-400"
                            }`}
                        >
                          {selectedOptions.includes(option.optionId) && (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-3 w-3 text-white"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          )}
                        </div>
                      )}
                      <span className="ml-2">{option.optionText}</span>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={submitAnswer}
                disabled={submittingAnswer || selectedOptions.length === 0}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex justify-center items-center disabled:bg-blue-300"
              >
                {submittingAnswer ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                    Yuborilmoqda...
                  </>
                ) : (
                  "Javobni yuborish"
                )}
              </button>
            </div>
          ) : (
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Barcha savollarga javob berdingiz!</h2>
              <p className="text-gray-600 mb-6">Testni yakunlash uchun quyidagi tugmani bosing.</p>
              <button
                onClick={completeTest}
                disabled={completingTest}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md flex justify-center items-center mx-auto"
              >
                {completingTest ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                    Yakunlanmoqda...
                  </>
                ) : (
                  "Testni yakunlash"
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

