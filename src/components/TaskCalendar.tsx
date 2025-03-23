"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../context/AuthContext"
import { taskApi } from "../services/api"
import { ChevronLeft, ChevronRight, Clock, CheckCircle, Loader2, X } from "lucide-react"
import { toast } from "./ui/use-toast"

export default function TaskCalendar() {
    const { user } = useAuth()
    const [tasks, setTasks] = useState([])
    const [loading, setLoading] = useState(true)
    const [currentDate, setCurrentDate] = useState(new Date())
    const [currentView, setCurrentView] = useState("month") // month, week, day
    const [selectedDate, setSelectedDate] = useState(null)
    const [selectedDateTasks, setSelectedDateTasks] = useState([])

    // Fetch tasks
    useEffect(() => {
        const fetchTasks = async () => {
            if (!user) return

            try {
                setLoading(true)
                const response = await taskApi.getUserTasks(user.id)
                const data = response.data || response
                setTasks(data)
            } catch (error) {
                console.error("Error fetching tasks:", error)
                toast({
                    title: "Xatolik",
                    description: "Vazifalarni yuklashda xatolik yuz berdi.",
                    variant: "destructive",
                })
            } finally {
                setLoading(false)
            }
        }

        fetchTasks()
    }, [user])

    // Get days in month
    const getDaysInMonth = (year, month) => {
        return new Date(year, month + 1, 0).getDate()
    }

    // Get first day of month (0 = Sunday, 1 = Monday, etc.)
    const getFirstDayOfMonth = (year, month) => {
        return new Date(year, month, 1).getDay()
    }

    // Format date as YYYY-MM-DD
    const formatDateForComparison = (date) => {
        return date.toISOString().split("T")[0]
    }

    // Check if a date has tasks
    const hasTasksOnDate = (date) => {
        const dateStr = formatDateForComparison(date)
        return tasks.some((task) => {
            const taskDate = new Date(task.dueDate)
            return formatDateForComparison(taskDate) === dateStr
        })
    }

    // Get tasks for a specific date
    const getTasksForDate = (date) => {
        const dateStr = formatDateForComparison(date)
        return tasks.filter((task) => {
            const taskDate = new Date(task.dueDate)
            return formatDateForComparison(taskDate) === dateStr
        })
    }

    // Handle date selection
    const handleDateClick = (date) => {
        setSelectedDate(date)
        setSelectedDateTasks(getTasksForDate(date))
    }

    // Navigate to previous month/week/day
    const navigatePrevious = () => {
        const newDate = new Date(currentDate)
        if (currentView === "month") {
            newDate.setMonth(newDate.getMonth() - 1)
        } else if (currentView === "week") {
            newDate.setDate(newDate.getDate() - 7)
        } else {
            newDate.setDate(newDate.getDate() - 1)
        }
        setCurrentDate(newDate)
    }

    // Navigate to next month/week/day
    const navigateNext = () => {
        const newDate = new Date(currentDate)
        if (currentView === "month") {
            newDate.setMonth(newDate.getMonth() + 1)
        } else if (currentView === "week") {
            newDate.setDate(newDate.getDate() + 7)
        } else {
            newDate.setDate(newDate.getDate() + 1)
        }
        setCurrentDate(newDate)
    }

    // Navigate to today
    const navigateToday = () => {
        setCurrentDate(new Date())
    }

    // Render month view
    const renderMonthView = () => {
        const year = currentDate.getFullYear()
        const month = currentDate.getMonth()
        const daysInMonth = getDaysInMonth(year, month)
        const firstDay = getFirstDayOfMonth(year, month)

        // Create array of day numbers (1-31)
        const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)

        // Add empty cells for days before the first day of the month
        const emptyCells = Array.from({ length: firstDay }, (_, i) => null)
        const allCells = [...emptyCells, ...days]

        // Split into weeks
        const weeks = []
        for (let i = 0; i < allCells.length; i += 7) {
            weeks.push(allCells.slice(i, i + 7))
        }

        return (
            <div className="bg-white rounded-lg shadow-md p-4">
                <div className="grid grid-cols-7 gap-1 mb-2">
                    {["Yak", "Dush", "Sesh", "Chor", "Pay", "Jum", "Shan"].map((day, index) => (
                        <div key={index} className="text-center text-sm font-medium text-gray-500">
                            {day}
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-7 gap-1">
                    {weeks.map((week, weekIndex) =>
                        week.map((day, dayIndex) => {
                            if (day === null) {
                                return <div key={`empty-${weekIndex}-${dayIndex}`} className="h-16 p-1 bg-gray-50"></div>
                            }

                            const date = new Date(year, month, day)
                            const isToday = formatDateForComparison(date) === formatDateForComparison(new Date())
                            const isSelected = selectedDate && formatDateForComparison(date) === formatDateForComparison(selectedDate)
                            const hasTasks = hasTasksOnDate(date)

                            return (
                                <div
                                    key={`day-${day}`}
                                    onClick={() => handleDateClick(date)}
                                    className={`h-16 p-1 border rounded-md cursor-pointer transition-colors ${isToday
                                            ? "bg-blue-50 border-blue-300"
                                            : isSelected
                                                ? "bg-indigo-50 border-indigo-300"
                                                : "hover:bg-gray-50 border-gray-200"
                                        }`}
                                >
                                    <div className="flex justify-between items-start">
                                        <span className={`text-sm font-medium ${isToday ? "text-blue-600" : ""}`}>{day}</span>
                                        {hasTasks && <div className="h-2 w-2 rounded-full bg-indigo-500"></div>}
                                    </div>

                                    {/* Show up to 2 tasks */}
                                    <div className="mt-1 space-y-1 overflow-hidden" style={{ maxHeight: "2.5rem" }}>
                                        {getTasksForDate(date)
                                            .slice(0, 2)
                                            .map((task, index) => (
                                                <div key={index} className="text-xs truncate">
                                                    <span
                                                        className={`inline-block w-2 h-2 rounded-full mr-1 ${task.status === "COMPLETED"
                                                                ? "bg-green-500"
                                                                : task.status === "IN_PROGRESS"
                                                                    ? "bg-blue-500"
                                                                    : "bg-gray-500"
                                                            }`}
                                                    ></span>
                                                    {task.title}
                                                </div>
                                            ))}

                                        {/* Show count if more than 2 tasks */}
                                        {getTasksForDate(date).length > 2 && (
                                            <div className="text-xs text-gray-500">+{getTasksForDate(date).length - 2} ko'proq</div>
                                        )}
                                    </div>
                                </div>
                            )
                        }),
                    )}
                </div>
            </div>
        )
    }

    // Render week view
    const renderWeekView = () => {
        // Get the start of the week (Sunday)
        const startOfWeek = new Date(currentDate)
        startOfWeek.setDate(currentDate.getDate() - currentDate.getDay())

        // Create array of days in the week
        const weekDays = Array.from({ length: 7 }, (_, i) => {
            const date = new Date(startOfWeek)
            date.setDate(startOfWeek.getDate() + i)
            return date
        })

        return (
            <div className="bg-white rounded-lg shadow-md p-4">
                <div className="grid grid-cols-7 gap-2">
                    {weekDays.map((date, index) => {
                        const dayName = ["Yak", "Dush", "Sesh", "Chor", "Pay", "Jum", "Shan"][index]
                        const isToday = formatDateForComparison(date) === formatDateForComparison(new Date())
                        const isSelected = selectedDate && formatDateForComparison(date) === formatDateForComparison(selectedDate)

                        return (
                            <div key={index} className="text-center">
                                <div className="text-sm font-medium text-gray-500">{dayName}</div>
                                <div
                                    onClick={() => handleDateClick(date)}
                                    className={`py-1 px-2 rounded-full cursor-pointer inline-block ${isToday ? "bg-blue-500 text-white" : isSelected ? "bg-indigo-500 text-white" : "hover:bg-gray-100"
                                        }`}
                                >
                                    {date.getDate()}
                                </div>
                            </div>
                        )
                    })}
                </div>

                <div className="mt-4 space-y-2">
                    {weekDays.map((date, index) => {
                        const dateTasks = getTasksForDate(date)
                        if (dateTasks.length === 0) return null

                        return (
                            <div key={index} className="border-l-4 border-indigo-500 pl-2 py-1">
                                <div className="font-medium">
                                    {date.toLocaleDateString("uz-UZ", { weekday: "short", month: "short", day: "numeric" })}
                                </div>
                                <div className="space-y-1 mt-1">
                                    {dateTasks.map((task, taskIndex) => (
                                        <div key={taskIndex} className="flex items-center text-sm">
                                            <span
                                                className={`inline-block w-3 h-3 rounded-full mr-2 ${task.status === "COMPLETED"
                                                        ? "bg-green-500"
                                                        : task.status === "IN_PROGRESS"
                                                            ? "bg-blue-500"
                                                            : "bg-gray-500"
                                                    }`}
                                            ></span>
                                            <span className={task.status === "COMPLETED" ? "line-through text-gray-500" : ""}>
                                                {task.title}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )
                    })}

                    {weekDays.every((date) => getTasksForDate(date).length === 0) && (
                        <div className="text-center py-8 text-gray-500">Bu hafta uchun vazifalar mavjud emas</div>
                    )}
                </div>
            </div>
        )
    }

    // Render day view
    const renderDayView = () => {
        const dateTasks = getTasksForDate(currentDate)

        return (
            <div className="bg-white rounded-lg shadow-md p-4">
                <div className="text-center mb-4">
                    <div className="text-lg font-medium">
                        {currentDate.toLocaleDateString("uz-UZ", { weekday: "long", month: "long", day: "numeric" })}
                    </div>
                </div>

                <div className="space-y-3">
                    {dateTasks.length > 0 ? (
                        dateTasks.map((task, index) => (
                            <div
                                key={index}
                                className={`p-3 rounded-md border-l-4 ${task.status === "COMPLETED"
                                        ? "border-green-500 bg-green-50"
                                        : task.status === "IN_PROGRESS"
                                            ? "border-blue-500 bg-blue-50"
                                            : "border-gray-500 bg-gray-50"
                                    }`}
                            >
                                <div className="flex justify-between items-start">
                                    <h3 className={`font-medium ${task.status === "COMPLETED" ? "line-through text-gray-500" : ""}`}>
                                        {task.title}
                                    </h3>
                                    <div className="flex items-center text-xs">
                                        {task.status === "COMPLETED" ? (
                                            <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                                        ) : (
                                            <Clock className="h-4 w-4 text-gray-500 mr-1" />
                                        )}
                                        <span>
                                            {task.status === "COMPLETED"
                                                ? "Bajarilgan"
                                                : task.status === "IN_PROGRESS"
                                                    ? "Jarayonda"
                                                    : "Yaratilgan"}
                                        </span>
                                    </div>
                                </div>

                                {task.description && <p className="text-sm text-gray-600 mt-1">{task.description}</p>}

                                <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
                                    <span className="bg-gray-200 px-2 py-1 rounded-full">{task.category}</span>
                                    <span>Muhimlik: {task.priority}</span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-8 text-gray-500">Bu kun uchun vazifalar mavjud emas</div>
                    )}
                </div>
            </div>
        )
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
            </div>
        )
    }

    return (
        <div className="pt-4 pb-24">
            <div className="flex justify-between items-center mb-4 px-4">
                <h1 className="text-2xl font-bold text-gray-800">Taqvim</h1>

                <div className="flex space-x-2">
                    <button
                        onClick={() => setCurrentView("month")}
                        className={`px-3 py-1 rounded-md text-sm ${currentView === "month" ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-700"
                            }`}
                    >
                        Oy
                    </button>
                    <button
                        onClick={() => setCurrentView("week")}
                        className={`px-3 py-1 rounded-md text-sm ${currentView === "week" ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-700"
                            }`}
                    >
                        Hafta
                    </button>
                    <button
                        onClick={() => setCurrentView("day")}
                        className={`px-3 py-1 rounded-md text-sm ${currentView === "day" ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-700"
                            }`}
                    >
                        Kun
                    </button>
                </div>
            </div>

            <div className="flex justify-between items-center mb-4 px-4">
                <div className="flex items-center space-x-2">
                    <button onClick={navigatePrevious} className="p-1 rounded-full hover:bg-gray-200">
                        <ChevronLeft className="h-5 w-5" />
                    </button>

                    <button onClick={navigateToday} className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded-md">
                        Bugun
                    </button>

                    <button onClick={navigateNext} className="p-1 rounded-full hover:bg-gray-200">
                        <ChevronRight className="h-5 w-5" />
                    </button>
                </div>

                <div className="font-medium">
                    {currentView === "month" && currentDate.toLocaleDateString("uz-UZ", { month: "long", year: "numeric" })}
                    {currentView === "week" && (
                        <>
                            {new Date(
                                currentDate.getFullYear(),
                                currentDate.getMonth(),
                                currentDate.getDate() - currentDate.getDay(),
                            ).toLocaleDateString("uz-UZ", { day: "numeric", month: "short" })}
                            {" - "}
                            {new Date(
                                currentDate.getFullYear(),
                                currentDate.getMonth(),
                                currentDate.getDate() - currentDate.getDay() + 6,
                            ).toLocaleDateString("uz-UZ", { day: "numeric", month: "short", year: "numeric" })}
                        </>
                    )}
                    {currentView === "day" &&
                        currentDate.toLocaleDateString("uz-UZ", {
                            weekday: "long",
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                        })}
                </div>
            </div>

            {currentView === "month" && renderMonthView()}
            {currentView === "week" && renderWeekView()}
            {currentView === "day" && renderDayView()}

            {/* Selected date tasks */}
            {selectedDate && currentView === "month" && selectedDateTasks.length > 0 && (
                <div className="mt-4 bg-white rounded-lg shadow-md p-4 mx-4">
                    <div className="flex justify-between items-center mb-3">
                        <h2 className="font-medium text-lg">
                            {selectedDate.toLocaleDateString("uz-UZ", { weekday: "long", day: "numeric", month: "long" })}
                        </h2>
                        <button onClick={() => setSelectedDate(null)} className="text-gray-500 hover:text-gray-700">
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    <div className="space-y-2">
                        {selectedDateTasks.map((task, index) => (
                            <div
                                key={index}
                                className={`p-3 rounded-md border-l-4 ${task.status === "COMPLETED"
                                        ? "border-green-500 bg-green-50"
                                        : task.status === "IN_PROGRESS"
                                            ? "border-blue-500 bg-blue-50"
                                            : "border-gray-500 bg-gray-50"
                                    }`}
                            >
                                <div className="flex justify-between items-start">
                                    <h3 className={`font-medium ${task.status === "COMPLETED" ? "line-through text-gray-500" : ""}`}>
                                        {task.title}
                                    </h3>
                                    <div className="flex items-center text-xs">
                                        {task.status === "COMPLETED" ? (
                                            <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                                        ) : (
                                            <Clock className="h-4 w-4 text-gray-500 mr-1" />
                                        )}
                                        <span>
                                            {task.status === "COMPLETED"
                                                ? "Bajarilgan"
                                                : task.status === "IN_PROGRESS"
                                                    ? "Jarayonda"
                                                    : "Yaratilgan"}
                                        </span>
                                    </div>
                                </div>

                                {task.description && <p className="text-sm text-gray-600 mt-1">{task.description}</p>}

                                <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
                                    <span className="bg-gray-200 px-2 py-1 rounded-full">{task.category}</span>
                                    <span>Muhimlik: {task.priority}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

