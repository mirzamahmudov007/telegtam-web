"use client"

import type React from "react"

import { useState } from "react"
import api from "../../services/api"
import { useNavigate } from "react-router"

interface Option {
    id: number
    text: string
    isCorrect: boolean
}

interface Question {
    id: number
    text: string
    points: number
    type: "SINGLE_CHOICE" | "MULTIPLE_CHOICE"
    options: Option[]
}

interface TestForm {
    title: string
    subject: string
    description: string
    startTime: string
    endTime: string
    durationMinutes: number
    isActive: boolean
    questions: Question[]
}

export default function TestCreate() {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [currentStep, setCurrentStep] = useState(1)
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
    const [user, setUser] = useState({ id: "1" }) // Mock user for demo purposes

    // Initialize form with default values
    const [form, setForm] = useState<TestForm>({
        title: "",
        subject: "",
        description: "",
        startTime: new Date().toISOString().slice(0, 16),
        endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
        durationMinutes: 60,
        isActive: false,
        questions: [
            {
                id: 1,
                text: "",
                points: 1,
                type: "SINGLE_CHOICE",
                options: [
                    { id: 1, text: "", isCorrect: false },
                    { id: 2, text: "", isCorrect: false },
                    { id: 3, text: "", isCorrect: false },
                    { id: 4, text: "", isCorrect: false },
                ],
            },
        ],
    })

    // Handle form input changes
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setForm({
            ...form,
            [name]: value,
        })
    }

    // Handle checkbox changes
    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target
        setForm({
            ...form,
            [name]: checked,
        })
    }

    // Handle question text change
    const handleQuestionTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>, questionIndex: number) => {
        const updatedQuestions = [...form.questions]
        updatedQuestions[questionIndex].text = e.target.value
        setForm({
            ...form,
            questions: updatedQuestions,
        })
    }

    // Handle question type change
    const handleQuestionTypeChange = (e: React.ChangeEvent<HTMLSelectElement>, questionIndex: number) => {
        const updatedQuestions = [...form.questions]
        updatedQuestions[questionIndex].type = e.target.value as "SINGLE_CHOICE" | "MULTIPLE_CHOICE"
        setForm({
            ...form,
            questions: updatedQuestions,
        })
    }

    // Handle question points change
    const handleQuestionPointsChange = (e: React.ChangeEvent<HTMLInputElement>, questionIndex: number) => {
        const updatedQuestions = [...form.questions]
        updatedQuestions[questionIndex].points = Number.parseInt(e.target.value)
        setForm({
            ...form,
            questions: updatedQuestions,
        })
    }

    // Handle option text change
    const handleOptionTextChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        questionIndex: number,
        optionIndex: number,
    ) => {
        const updatedQuestions = [...form.questions]
        updatedQuestions[questionIndex].options[optionIndex].text = e.target.value
        setForm({
            ...form,
            questions: updatedQuestions,
        })
    }

    // Handle option correctness change
    const handleOptionCorrectChange = (questionIndex: number, optionIndex: number) => {
        const updatedQuestions = [...form.questions]
        const question = updatedQuestions[questionIndex]

        // For single choice, uncheck all other options
        if (question.type === "SINGLE_CHOICE") {
            question.options.forEach((option, index) => {
                option.isCorrect = index === optionIndex
            })
        } else {
            // For multiple choice, toggle the current option
            question.options[optionIndex].isCorrect = !question.options[optionIndex].isCorrect
        }

        setForm({
            ...form,
            questions: updatedQuestions,
        })
    }

    // Add a new question
    const addQuestion = () => {
        const newQuestionId = form.questions.length > 0 ? Math.max(...form.questions.map((q) => q.id)) + 1 : 1
        const newQuestion: Question = {
            id: newQuestionId,
            text: "",
            points: 1,
            type: "SINGLE_CHOICE",
            options: [
                { id: 1, text: "", isCorrect: false },
                { id: 2, text: "", isCorrect: false },
                { id: 3, text: "", isCorrect: false },
                { id: 4, text: "", isCorrect: false },
            ],
        }

        setForm({
            ...form,
            questions: [...form.questions, newQuestion],
        })
        setCurrentQuestionIndex(form.questions.length)
    }

    // Remove a question
    const removeQuestion = (questionIndex: number) => {
        if (form.questions.length <= 1) {
            alert("Kamida bitta savol bo'lishi kerak")
            return
        }

        const updatedQuestions = form.questions.filter((_, index) => index !== questionIndex)
        setForm({
            ...form,
            questions: updatedQuestions,
        })

        // Adjust current question index if needed
        if (currentQuestionIndex >= updatedQuestions.length) {
            setCurrentQuestionIndex(updatedQuestions.length - 1)
        }
    }

    // Add an option to a question
    const addOption = (questionIndex: number) => {
        const question = form.questions[questionIndex]
        const newOptionId = question.options.length > 0 ? Math.max(...question.options.map((o) => o.id)) + 1 : 1
        const newOption: Option = {
            id: newOptionId,
            text: "",
            isCorrect: false,
        }

        const updatedQuestions = [...form.questions]
        updatedQuestions[questionIndex].options.push(newOption)

        setForm({
            ...form,
            questions: updatedQuestions,
        })
    }

    // Remove an option from a question
    const removeOption = (questionIndex: number, optionIndex: number) => {
        const question = form.questions[questionIndex]
        if (question.options.length <= 2) {
            alert("Kamida ikkita variant bo'lishi kerak")
            return
        }

        const updatedQuestions = [...form.questions]
        updatedQuestions[questionIndex].options.splice(optionIndex, 1)

        setForm({
            ...form,
            questions: updatedQuestions,
        })
    }

    // Validate the current step only
    const validateCurrentStep = () => {
        if (currentStep === 1) {
            // Basic test info validation for step 1
            if (!form.title.trim()) return "Test sarlavhasi kiritilmagan"
            if (!form.subject.trim()) return "Fan nomi kiritilmagan"
            if (!form.startTime) return "Boshlanish vaqti kiritilmagan"
            if (!form.endTime) return "Tugash vaqti kiritilmagan"
            if (new Date(form.startTime) >= new Date(form.endTime))
                return "Tugash vaqti boshlanish vaqtidan keyin bo'lishi kerak"
            if (form.durationMinutes <= 0) return "Davomiyligi noto'g'ri kiritilgan"
        } else if (currentStep === 2) {
            // Questions validation for step 2
            if (form.questions.length === 0) return "Kamida bitta savol kiritilishi kerak"

            for (let i = 0; i < form.questions.length; i++) {
                const question = form.questions[i]
                if (!question.text.trim()) return `${i + 1}-savol matni kiritilmagan`
                if (question.points <= 0) return `${i + 1}-savol uchun ball noto'g'ri kiritilgan`
                if (question.options.length < 2) return `${i + 1}-savolda kamida ikkita variant bo'lishi kerak`

                // Check if at least one option is marked as correct
                const hasCorrectOption = question.options.some((option) => option.isCorrect)
                if (!hasCorrectOption) return `${i + 1}-savolda kamida bitta to'g'ri javob belgilanishi kerak`

                // Check if all options have text
                for (let j = 0; j < question.options.length; j++) {
                    if (!question.options[j].text.trim()) return `${i + 1}-savol, ${j + 1}-variant matni kiritilmagan`
                }
            }
        }

        return null
    }

    // Validate the entire form
    const validateForm = () => {
        // Basic test info validation
        if (!form.title.trim()) return "Test sarlavhasi kiritilmagan"
        if (!form.subject.trim()) return "Fan nomi kiritilmagan"
        if (!form.startTime) return "Boshlanish vaqti kiritilmagan"
        if (!form.endTime) return "Tugash vaqti kiritilmagan"
        if (new Date(form.startTime) >= new Date(form.endTime))
            return "Tugash vaqti boshlanish vaqtidan keyin bo'lishi kerak"
        if (form.durationMinutes <= 0) return "Davomiyligi noto'g'ri kiritilgan"

        // Questions validation
        if (form.questions.length === 0) return "Kamida bitta savol kiritilishi kerak"

        for (let i = 0; i < form.questions.length; i++) {
            const question = form.questions[i]
            if (!question.text.trim()) return `${i + 1}-savol matni kiritilmagan`
            if (question.points <= 0) return `${i + 1}-savol uchun ball noto'g'ri kiritilgan`
            if (question.options.length < 2) return `${i + 1}-savolda kamida ikkita variant bo'lishi kerak`

            // Check if at least one option is marked as correct
            const hasCorrectOption = question.options.some((option) => option.isCorrect)
            if (!hasCorrectOption) return `${i + 1}-savolda kamida bitta to'g'ri javob belgilanishi kerak`

            // Check if all options have text
            for (let j = 0; j < question.options.length; j++) {
                if (!question.options[j].text.trim()) return `${i + 1}-savol, ${j + 1}-variant matni kiritilmagan`
            }
        }

        return null
    }

    // Submit the form
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        const error = validateForm()
        if (error) {
            alert(error)
            return
        }

        try {
            setLoading(true)

            // Prepare the data for API
            const testData = {
                ...form,
                // Ensure dates are in ISO format
                startTime: new Date(form.startTime).toISOString(),
                endTime: new Date(form.endTime).toISOString(),
            }

            // Send the request to the correct endpoint
            await api.post(`/api/admin/tests?userId=${user?.id}`, testData)

            alert("Test muvaffaqiyatli yaratildi!")
            navigate("/admin/tests")
        } catch (error) {
            console.error("Error creating test:", error)
            alert("Testni yaratishda xatolik yuz berdi.")
        } finally {
            setLoading(false)
        }
    }

    // Navigate to previous step
    const goToPreviousStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1)
        }
    }

    // Navigate to next step
    const goToNextStep = () => {
        const error = validateCurrentStep()
        if (error) {
            alert(error)
            return
        }

        if (currentStep < 2) {
            setCurrentStep(currentStep + 1)
        }
    }

    if (!user) {
        return (
            <div className="pt-4 pb-24">
                <div className="bg-red-100 p-4 rounded-md text-red-700 max-w-md mx-auto">
                    <h2 className="font-bold mb-2">Ruxsat yo&apos;q</h2>
                    <p>Bu sahifani ko&apos;rish uchun tizimga kirishingiz kerak.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="pt-4 pb-24">
            <div className="flex justify-between items-center mb-4 px-4">
                <h1 className="text-2xl font-bold text-gray-800">Yangi test yaratish</h1>
            </div>

            {/* Progress indicator */}
            <div className="px-4 mb-6">
                <div className="flex items-center">
                    <div
                        className={`flex items-center justify-center w-8 h-8 rounded-full ${currentStep >= 1 ? "bg-blue-600 text-white" : "bg-gray-300 text-gray-600"
                            }`}
                    >
                        1
                    </div>
                    <div className={`flex-1 h-1 mx-2 ${currentStep >= 2 ? "bg-blue-600" : "bg-gray-300"}`}></div>
                    <div
                        className={`flex items-center justify-center w-8 h-8 rounded-full ${currentStep >= 2 ? "bg-blue-600 text-white" : "bg-gray-300 text-gray-600"
                            }`}
                    >
                        2
                    </div>
                </div>
                <div className="flex justify-between mt-1 text-xs text-gray-600">
                    <span>Test ma&apos;lumotlari</span>
                    <span>Savollar</span>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="px-4">
                {/* Step 1: Test Information */}
                {currentStep === 1 && (
                    <div className="bg-white rounded-lg shadow-md p-4 mb-4">
                        <h2 className="text-lg font-semibold mb-4">Test ma&apos;lumotlari</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Test sarlavhasi *</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={form.title}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border border-gray-300 rounded-md"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Fan *</label>
                                <input
                                    type="text"
                                    name="subject"
                                    value={form.subject}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border border-gray-300 rounded-md"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tavsif</label>
                                <textarea
                                    name="description"
                                    value={form.description}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border border-gray-300 rounded-md"
                                    rows={3}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Boshlanish vaqti *</label>
                                    <input
                                        type="datetime-local"
                                        name="startTime"
                                        value={form.startTime}
                                        onChange={handleInputChange}
                                        className="w-full p-2 border border-gray-300 rounded-md"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Tugash vaqti *</label>
                                    <input
                                        type="datetime-local"
                                        name="endTime"
                                        value={form.endTime}
                                        onChange={handleInputChange}
                                        className="w-full p-2 border border-gray-300 rounded-md"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Davomiyligi (daqiqada) *</label>
                                <input
                                    type="number"
                                    name="durationMinutes"
                                    value={form.durationMinutes}
                                    onChange={handleInputChange}
                                    min="1"
                                    className="w-full p-2 border border-gray-300 rounded-md"
                                    required
                                />
                            </div>

                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="isActive"
                                    name="isActive"
                                    checked={form.isActive}
                                    onChange={handleCheckboxChange}
                                    className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                                />
                                <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
                                    Faol (Testni darhol faollashtirish)
                                </label>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 2: Questions */}
                {currentStep === 2 && (
                    <div>
                        {/* Question navigation */}
                        <div className="bg-white rounded-lg shadow-md p-4 mb-4">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg font-semibold">Savollar</h2>
                                <button
                                    type="button"
                                    onClick={addQuestion}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm flex items-center"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-4 w-4 mr-1"
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                    Savol qo&apos;shish
                                </button>
                            </div>

                            <div className="flex overflow-x-auto pb-2 mb-4">
                                {form.questions.map((question, index) => (
                                    <button
                                        key={question.id}
                                        type="button"
                                        onClick={() => setCurrentQuestionIndex(index)}
                                        className={`flex-shrink-0 px-3 py-1 mr-2 rounded-md ${currentQuestionIndex === index
                                                ? "bg-blue-600 text-white"
                                                : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                                            }`}
                                    >
                                        Savol {index + 1}
                                    </button>
                                ))}
                            </div>

                            {/* Current question */}
                            {form.questions.length > 0 && (
                                <div className="space-y-4">
                                    <div className="flex justify-between items-start">
                                        <h3 className="font-medium">Savol {currentQuestionIndex + 1}</h3>
                                        <button
                                            type="button"
                                            onClick={() => removeQuestion(currentQuestionIndex)}
                                            className="text-red-600 hover:text-red-800"
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="h-5 w-5"
                                                viewBox="0 0 20 20"
                                                fill="currentColor"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                        </button>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Savol matni *</label>
                                        <textarea
                                            value={form.questions[currentQuestionIndex].text}
                                            onChange={(e) => handleQuestionTextChange(e, currentQuestionIndex)}
                                            className="w-full p-2 border border-gray-300 rounded-md"
                                            rows={3}
                                            required
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Savol turi *</label>
                                            <select
                                                value={form.questions[currentQuestionIndex].type}
                                                onChange={(e) => handleQuestionTypeChange(e, currentQuestionIndex)}
                                                className="w-full p-2 border border-gray-300 rounded-md"
                                            >
                                                <option value="SINGLE_CHOICE">Bitta to&apos;g&apos;ri javob</option>
                                                <option value="MULTIPLE_CHOICE">Bir nechta to&apos;g&apos;ri javob</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Ball *</label>
                                            <input
                                                type="number"
                                                value={form.questions[currentQuestionIndex].points}
                                                onChange={(e) => handleQuestionPointsChange(e, currentQuestionIndex)}
                                                min="1"
                                                className="w-full p-2 border border-gray-300 rounded-md"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex justify-between items-center mb-2">
                                            <label className="block text-sm font-medium text-gray-700">Variantlar *</label>
                                            <button
                                                type="button"
                                                onClick={() => addOption(currentQuestionIndex)}
                                                className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                                            >
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    className="h-4 w-4 mr-1"
                                                    viewBox="0 0 20 20"
                                                    fill="currentColor"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                                Variant qo&apos;shish
                                            </button>
                                        </div>

                                        <div className="space-y-2">
                                            {form.questions[currentQuestionIndex].options.map((option, optionIndex) => (
                                                <div key={option.id} className="flex items-center">
                                                    <div className="flex-1">
                                                        <div className="flex items-center">
                                                            <input
                                                                type={
                                                                    form.questions[currentQuestionIndex].type === "SINGLE_CHOICE" ? "radio" : "checkbox"
                                                                }
                                                                checked={option.isCorrect}
                                                                onChange={() => handleOptionCorrectChange(currentQuestionIndex, optionIndex)}
                                                                className="h-4 w-4 text-blue-600 border-gray-300"
                                                            />
                                                            <input
                                                                type="text"
                                                                value={option.text}
                                                                onChange={(e) => handleOptionTextChange(e, currentQuestionIndex, optionIndex)}
                                                                className="flex-1 ml-2 p-2 border border-gray-300 rounded-md"
                                                                placeholder={`Variant ${optionIndex + 1}`}
                                                                required
                                                            />
                                                        </div>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeOption(currentQuestionIndex, optionIndex)}
                                                        className="ml-2 text-red-600 hover:text-red-800"
                                                    >
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            className="h-5 w-5"
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
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Navigation buttons */}
                <div className="flex justify-between mt-6">
                    {currentStep > 1 ? (
                        <button
                            type="button"
                            onClick={goToPreviousStep}
                            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md"
                        >
                            Orqaga
                        </button>
                    ) : (
                        <div></div>
                    )}

                    {currentStep < 2 ? (
                        <button
                            type="button"
                            onClick={goToNextStep}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
                        >
                            Keyingi
                        </button>
                    ) : (
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md flex items-center"
                        >
                            {loading && (
                                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                            )}
                            Testni yaratish
                        </button>
                    )}
                </div>
            </form>
        </div>
    )
}

