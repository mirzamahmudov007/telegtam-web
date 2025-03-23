"use client"

import type React from "react"

import { useState, useEffect, useCallback, useRef } from "react"
import {
    PlusCircle,
    Clock,
    AlertCircle,
    Loader2,
    CheckCircle,
    X,
    Calendar,
    Filter,
    Search,
    MoreHorizontal,
    GripVertical,
    Trash2,
} from "lucide-react"
import { taskApi } from "./../../services/api"
import { useAppSelector } from "./../../hooks/redux-hooks"
import { selectUser } from "./../../app/authSlice"
import { toast } from "./../../components/ui/use-toast"
import type { Task, TaskInput } from "./../../types"

// Define types for the component state
interface TasksByStatus {
    CREATED: Task[]
    IN_PROGRESS: Task[]
    COMPLETED: Task[]
}

type TaskStatus = "CREATED" | "IN_PROGRESS" | "COMPLETED"

export default function Tasks() {
    const user = useAppSelector(selectUser)
    const [tasks, setTasks] = useState<TasksByStatus>({
        CREATED: [],
        IN_PROGRESS: [],
        COMPLETED: [],
    })
    const [loading, setLoading] = useState<boolean>(true)
    const [newTaskTitle, setNewTaskTitle] = useState<string>("")
    const [newTaskDescription, setNewTaskDescription] = useState<string>("")
    const [newTaskCategory, setNewTaskCategory] = useState<string>("")
    const [newTaskPriority, setNewTaskPriority] = useState<number>(3)
    const [newTaskDueDate, setNewTaskDueDate] = useState<string>("")
    const [showAddForm, setShowAddForm] = useState<boolean>(false)
    const [selectedColumn, setSelectedColumn] = useState<TaskStatus | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [updateLoading, setUpdateLoading] = useState<boolean>(false)
    const [searchQuery, setSearchQuery] = useState<string>("")
    const [filterCategory, setFilterCategory] = useState<string>("")
    const [filterPriority, setFilterPriority] = useState<number | null>(null)
    const [showFilters, setShowFilters] = useState<boolean>(false)
    const [draggedTask, setDraggedTask] = useState<Task | null>(null)
    const [draggedTaskElement, setDraggedTaskElement] = useState<HTMLElement | null>(null)
    const [dragOverColumn, setDragOverColumn] = useState<TaskStatus | null>(null)

    // Refs for touch events
    const touchStartXRef = useRef<number | null>(null)
    const touchStartYRef = useRef<number | null>(null)
    const draggedTaskRef = useRef<Task | null>(null)
    const dragSourceColumnRef = useRef<TaskStatus | null>(null)

    // Fetch tasks from API
    const fetchTasks = useCallback(async () => {
        if (!user) return

        setLoading(true)
        setError(null)
        try {
            // Get all tasks for the user
            const response = await taskApi.getUserTasks(user.id)
            const data = response.data

            // Group tasks by status
            const groupedTasks: TasksByStatus = {
                CREATED: [],
                IN_PROGRESS: [],
                COMPLETED: [],
            }

            data.forEach((task: Task) => {
                if (groupedTasks[task.status as TaskStatus]) {
                    groupedTasks[task.status as TaskStatus].push(task)
                }
            })

            setTasks(groupedTasks)
        } catch (err) {
            console.error("Error fetching tasks:", err)
            setError("Vazifalarni yuklashda xatolik yuz berdi. Iltimos, qayta urinib ko'ring.")
            toast({
                title: "Xatolik",
                description: "Vazifalarni yuklashda xatolik yuz berdi.",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }, [user])

    // Fetch tasks on component mount and when user changes
    useEffect(() => {
        if (user) {
            fetchTasks()
        }

        // Set default due date for new tasks (7 days from now)
        const date = new Date()
        date.setDate(date.getDate() + 7)
        setNewTaskDueDate(date.toISOString().split("T")[0])
    }, [user, fetchTasks])

    // Filter tasks based on search query and filters
    const getFilteredTasks = useCallback(
        (taskList: Task[]) => {
            return taskList.filter((task) => {
                // Search by title or description
                const matchesSearch =
                    searchQuery === "" ||
                    task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()))

                // Filter by category
                const matchesCategory = filterCategory === "" || task.category === filterCategory

                // Filter by priority
                const matchesPriority = filterPriority === null || task.priority === filterPriority

                return matchesSearch && matchesCategory && matchesPriority
            })
        },
        [searchQuery, filterCategory, filterPriority],
    )

    // Handle drag start
    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, task: Task, status: TaskStatus) => {
        // Set data for drag operation
        e.dataTransfer.setData("taskId", task.id.toString())
        e.dataTransfer.setData("sourceStatus", status)

        // Set dragged task state
        setDraggedTask(task)
        setDraggedTaskElement(e.currentTarget)
        dragSourceColumnRef.current = status

        // Add visual feedback
        e.currentTarget.classList.add("dragging")

        // Set drag image (optional)
        const dragImage = document.createElement("div")
        dragImage.textContent = task.title
        dragImage.className = "bg-white p-2 rounded shadow-lg text-sm opacity-90 border border-indigo-500"
        dragImage.style.position = "absolute"
        dragImage.style.top = "-1000px"
        document.body.appendChild(dragImage)
        e.dataTransfer.setDragImage(dragImage, 0, 0)

        // Clean up the drag image element after a short delay
        setTimeout(() => {
            document.body.removeChild(dragImage)
        }, 0)
    }

    // Handle drag over
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>, status: TaskStatus) => {
        e.preventDefault()

        // Add visual feedback for the column
        setDragOverColumn(status)
        e.currentTarget.classList.add("droppable-hover")
    }

    // Handle drag leave
    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        e.currentTarget.classList.remove("droppable-hover")
        setDragOverColumn(null)
    }

    // Handle drop
    const handleDrop = async (e: React.DragEvent<HTMLDivElement>, targetStatus: TaskStatus) => {
        e.preventDefault()

        // Remove visual feedback
        e.currentTarget.classList.remove("droppable-hover")
        if (draggedTaskElement) {
            draggedTaskElement.classList.remove("dragging")
        }

        // Get data from drag operation
        const taskId = Number(e.dataTransfer.getData("taskId"))
        const sourceStatus = e.dataTransfer.getData("sourceStatus") as TaskStatus

        // If dropped in the same column, do nothing
        if (sourceStatus === targetStatus) {
            setDraggedTask(null)
            setDraggedTaskElement(null)
            setDragOverColumn(null)
            return
        }

        // Update task status
        await updateTaskStatus(taskId, sourceStatus, targetStatus)
    }

    // Handle touch start for mobile drag and drop
    const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>, task: Task, status: TaskStatus) => {
        // Store the initial touch position
        const touch = e.touches[0]
        touchStartXRef.current = touch.clientX
        touchStartYRef.current = touch.clientY

        // Store the task being dragged
        draggedTaskRef.current = task
        dragSourceColumnRef.current = status

        // Add visual feedback
        e.currentTarget.classList.add("touch-dragging")
    }

    // Handle touch move
    const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
        if (!draggedTaskRef.current || touchStartXRef.current === null || touchStartYRef.current === null) return

        const touch = e.touches[0]
        const moveX = touch.clientX - touchStartXRef.current
        const moveY = touch.clientY - touchStartYRef.current

        // If the user has moved their finger significantly, prevent scrolling
        if (Math.abs(moveX) > 10 || Math.abs(moveY) > 10) {
            e.preventDefault()
        }

        // Move the element with the finger (optional visual feedback)
        const element = e.currentTarget
        element.style.transform = `translate(${moveX}px, ${moveY}px)`
        element.style.zIndex = "100"

        // Detect which column the finger is over
        const columns = document.querySelectorAll(".kanban-column")
        let targetColumn: Element | null = null

        columns.forEach((column) => {
            const rect = column.getBoundingClientRect()
            if (
                touch.clientX >= rect.left &&
                touch.clientX <= rect.right &&
                touch.clientY >= rect.top &&
                touch.clientY <= rect.bottom
            ) {
                targetColumn = column
                column.classList.add("droppable-hover")
            } else {
                column.classList.remove("droppable-hover")
            }
        })
    }

    // Handle touch end
    const handleTouchEnd = async (e: React.TouchEvent<HTMLDivElement>) => {
        if (!draggedTaskRef.current || !dragSourceColumnRef.current) return

        // Reset the element's position
        e.currentTarget.style.transform = ""
        e.currentTarget.style.zIndex = ""
        e.currentTarget.classList.remove("touch-dragging")

        // Find which column the finger is over
        const touch = e.changedTouches[0]
        const columns = document.querySelectorAll(".kanban-column")
        let targetColumn: Element | null = null
        let targetStatus: TaskStatus | null = null

        columns.forEach((column) => {
            column.classList.remove("droppable-hover")
            const rect = column.getBoundingClientRect()
            if (
                touch.clientX >= rect.left &&
                touch.clientX <= rect.right &&
                touch.clientY >= rect.top &&
                touch.clientY <= rect.bottom
            ) {
                targetColumn = column
                targetStatus = column.getAttribute("data-status") as TaskStatus
            }
        })

        // If dropped on a different column, update the task status
        if (targetStatus && targetStatus !== dragSourceColumnRef.current) {
            await updateTaskStatus(draggedTaskRef.current.id, dragSourceColumnRef.current, targetStatus)
        }

        // Reset touch tracking
        touchStartXRef.current = null
        touchStartYRef.current = null
        draggedTaskRef.current = null
        dragSourceColumnRef.current = null
    }

    // Update task status
    const updateTaskStatus = async (taskId: number, sourceStatus: TaskStatus, targetStatus: TaskStatus) => {
        // Optimistically update UI
        const newTasks = { ...tasks }
        const taskIndex = newTasks[sourceStatus].findIndex((task) => task.id === taskId)

        if (taskIndex === -1) return

        const [movedTask] = newTasks[sourceStatus].splice(taskIndex, 1)
        movedTask.status = targetStatus

        // If moving to completed, set completedAt
        if (targetStatus === "COMPLETED" && !movedTask.completedAt) {
            movedTask.completedAt = new Date().toISOString()
        } else if (targetStatus !== "COMPLETED") {
            // If moving from completed to another status, remove completedAt
            movedTask.completedAt = undefined
        }

        newTasks[targetStatus].push(movedTask)
        setTasks(newTasks)

        // Reset drag state
        setDraggedTask(null)
        setDraggedTaskElement(null)
        setDragOverColumn(null)

        // Update in the backend
        try {
            setUpdateLoading(true)
            await taskApi.updateTaskStatus(taskId, targetStatus)

            // Show success toast
            toast({
                title: "Muvaffaqiyatli",
                description: "Vazifa holati yangilandi.",
            })

            // Refresh tasks to ensure we have the latest data
            fetchTasks()
        } catch (err) {
            console.error("Error updating task status:", err)
            // Revert the optimistic update
            fetchTasks()

            toast({
                title: "Xatolik",
                description: "Vazifa holatini yangilashda xatolik yuz berdi.",
                variant: "destructive",
            })
        } finally {
            setUpdateLoading(false)
        }
    }

    // Handle adding a new task
    const handleAddTask = async () => {
        if (!newTaskTitle.trim() || !selectedColumn || !user) return

        const newTask: TaskInput = {
            title: newTaskTitle,
            description: newTaskDescription || "",
            status: selectedColumn,
            dueDate: `${newTaskDueDate}T00:00:00`,
            priority: Number.parseInt(newTaskPriority.toString()),
            category: newTaskCategory || "Umumiy",
            isImportant: false,
        }

        try {
            setUpdateLoading(true)
            await taskApi.createTask(user.id, newTask)

            // Show success toast
            toast({
                title: "Muvaffaqiyatli",
                description: "Yangi vazifa yaratildi.",
            })

            // Refresh tasks
            fetchTasks()

            // Reset form
            setNewTaskTitle("")
            setNewTaskDescription("")
            setNewTaskCategory("")
            setNewTaskPriority(3)
            setShowAddForm(false)
        } catch (err) {
            console.error("Error creating task:", err)
            toast({
                title: "Xatolik",
                description: "Vazifa yaratishda xatolik yuz berdi.",
                variant: "destructive",
            })
        } finally {
            setUpdateLoading(false)
        }
    }

    // Handle task actions without opening a modal
    const handleDeleteTask = async (taskId: number, event: React.MouseEvent) => {
        event.stopPropagation()

        if (!confirm("Haqiqatan ham bu vazifani o'chirmoqchimisiz?")) {
            return
        }

        try {
            setUpdateLoading(true)
            await taskApi.deleteTask(taskId)

            // Show success toast
            toast({
                title: "Muvaffaqiyatli",
                description: "Vazifa o'chirildi.",
            })

            // Refresh tasks
            fetchTasks()
        } catch (err) {
            console.error("Error deleting task:", err)
            toast({
                title: "Xatolik",
                description: "Vazifani o'chirishda xatolik yuz berdi.",
                variant: "destructive",
            })
        } finally {
            setUpdateLoading(false)
        }
    }

    // Get all unique categories for filtering
    const getAllCategories = useCallback(() => {
        const categories = new Set<string>()
        Object.values(tasks).forEach((taskList) => {
            taskList.forEach((task) => {
                if (task.category) {
                    categories.add(task.category)
                }
            })
        })
        return Array.from(categories)
    }, [tasks])

    const getPriorityColor = (priority: number): string => {
        switch (priority) {
            case 5:
                return "bg-red-500"
            case 4:
                return "bg-orange-500"
            case 3:
                return "bg-yellow-500"
            case 2:
                return "bg-blue-500"
            case 1:
                return "bg-green-500"
            default:
                return "bg-gray-500"
        }
    }

    const getPriorityLabel = (priority: number): string => {
        switch (priority) {
            case 5:
                return "Juda yuqori"
            case 4:
                return "Yuqori"
            case 3:
                return "O'rtacha"
            case 2:
                return "Past"
            case 1:
                return "Juda past"
            default:
                return "Belgilanmagan"
        }
    }

    const isOverdue = (dueDate: string): boolean => {
        return new Date(dueDate) < new Date()
    }

    const formatDate = (dateString: string | undefined): string => {
        if (!dateString) return ""
        const date = new Date(dateString)
        return date.toLocaleDateString("uz-UZ", { year: "numeric", month: "2-digit", day: "2-digit" })
    }

    const getColumnIcon = (status: TaskStatus) => {
        switch (status) {
            case "CREATED":
                return <PlusCircle className="h-4 w-4 text-gray-700" />
            case "IN_PROGRESS":
                return <Clock className="h-4 w-4 text-blue-700" />
            case "COMPLETED":
                return <CheckCircle className="h-4 w-4 text-green-700" />
        }
    }

    const getColumnColor = (status: TaskStatus) => {
        switch (status) {
            case "CREATED":
                return "bg-gray-200"
            case "IN_PROGRESS":
                return "bg-blue-100"
            case "COMPLETED":
                return "bg-green-100"
        }
    }

    const getColumnTitle = (status: TaskStatus) => {
        switch (status) {
            case "CREATED":
                return "Yaratilgan"
            case "IN_PROGRESS":
                return "Jarayonda"
            case "COMPLETED":
                return "Bajarilgan"
        }
    }

    const getColumnBorderColor = (status: TaskStatus) => {
        switch (status) {
            case "CREATED":
                return "border-gray-400"
            case "IN_PROGRESS":
                return "border-blue-400"
            case "COMPLETED":
                return "border-green-400"
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="flex flex-col items-center">
                    <Loader2 className="h-10 w-10 text-indigo-500 animate-spin mb-3" />
                    <p className="text-gray-600 text-sm">Vazifalar yuklanmoqda...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="bg-red-100 p-4 rounded-md text-red-700 max-w-md">
                    <div className="flex items-center mb-2">
                        <AlertCircle className="h-4 w-4 mr-2" />
                        <p className="font-bold text-sm">Xatolik yuz berdi</p>
                    </div>
                    <p className="text-sm">{error}</p>
                    <button
                        onClick={fetchTasks}
                        className="mt-4 bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-md text-sm"
                    >
                        Qayta urinish
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="pt-3 pb-20 bg-gray-50 min-h-screen">
            <div className="container mx-auto px-3">
                {/* Header with search and filters */}
                <div className="bg-white rounded-lg shadow-md p-3 mb-4">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-3">
                        <h1 className="text-xl font-bold text-gray-800">Vazifalarim</h1>
                        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                            <div className="relative flex-grow">
                                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Vazifalarni qidirish..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-8 pr-3 py-1.5 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                                />
                            </div>
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className="flex items-center justify-center px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-sm"
                            >
                                <Filter className="h-3.5 w-3.5 mr-1.5" />
                                Filtrlar
                            </button>
                            <button
                                onClick={() => {
                                    setShowAddForm(true)
                                    setSelectedColumn("CREATED")
                                }}
                                className="flex items-center justify-center px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm"
                            >
                                <PlusCircle className="h-3.5 w-3.5 mr-1.5" />
                                Yangi vazifa
                            </button>
                        </div>
                    </div>

                    {/* Filters */}
                    {showFilters && (
                        <div className="bg-gray-50 p-3 rounded-md mt-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Kategoriya</label>
                                <select
                                    value={filterCategory}
                                    onChange={(e) => setFilterCategory(e.target.value)}
                                    className="w-full p-1.5 border border-gray-300 rounded-md text-sm"
                                >
                                    <option value="">Barcha kategoriyalar</option>
                                    {getAllCategories().map((category) => (
                                        <option key={category} value={category}>
                                            {category}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Muhimlik</label>
                                <select
                                    value={filterPriority || ""}
                                    onChange={(e) => setFilterPriority(e.target.value ? Number(e.target.value) : null)}
                                    className="w-full p-1.5 border border-gray-300 rounded-md text-sm"
                                >
                                    <option value="">Barcha muhimliklar</option>
                                    <option value="5">5 - Juda yuqori</option>
                                    <option value="4">4 - Yuqori</option>
                                    <option value="3">3 - O'rtacha</option>
                                    <option value="2">2 - Past</option>
                                    <option value="1">1 - Juda past</option>
                                </select>
                            </div>
                            <div className="flex items-end">
                                <button
                                    onClick={() => {
                                        setFilterCategory("")
                                        setFilterPriority(null)
                                        setSearchQuery("")
                                    }}
                                    className="w-full p-1.5 border border-gray-300 rounded-md hover:bg-gray-100 text-sm"
                                >
                                    Filtrlarni tozalash
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Add a help tooltip to explain drag-and-drop functionality */}
                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3 mb-4 flex items-start">
                    <div className="bg-indigo-100 p-1.5 rounded-full mr-2">
                        <AlertCircle className="h-4 w-4 text-indigo-600" />
                    </div>
                    <div>
                        <h3 className="font-medium text-indigo-800 mb-1 text-sm">Vazifa holatini o'zgartirish:</h3>
                        <p className="text-xs text-indigo-700">
                            Vazifani bir ustundan boshqasiga sudrab olib o'ting. Vazifani sudrab olish uchun{" "}
                            <GripVertical className="h-3 w-3 inline-block text-indigo-600" /> belgisidan foydalaning.
                        </p>
                    </div>
                </div>

                {updateLoading && (
                    <div className="fixed top-4 right-4 bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-md flex items-center z-50 shadow-md text-xs">
                        <Loader2 className="animate-spin h-3.5 w-3.5 mr-1.5" />
                        Yangilanmoqda...
                    </div>
                )}

                {/* Task statistics */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                    {(["CREATED", "IN_PROGRESS", "COMPLETED"] as TaskStatus[]).map((status) => (
                        <div
                            key={status}
                            className={`bg-white rounded-lg shadow-sm p-2 border-l-3 ${getColumnBorderColor(status)}`}
                        >
                            <div className="flex items-center">
                                {getColumnIcon(status)}
                                <h2 className="ml-1.5 font-bold text-xs">{getColumnTitle(status)}</h2>
                                <div
                                    className={`ml-auto px-2 py-0.5 rounded-full text-xs font-medium ${status === "CREATED" ? "bg-gray-200 text-gray-800" : status === "IN_PROGRESS" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"}`}
                                >
                                    {tasks[status].length}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Kanban board */}
                <div className="flex overflow-x-auto pb-4 px-1 space-x-3">
                    {(["CREATED", "IN_PROGRESS", "COMPLETED"] as TaskStatus[]).map((status) => (
                        <div
                            key={status}
                            className={`flex-shrink-0 w-72 bg-white rounded-lg shadow-md overflow-hidden flex flex-col kanban-column ${dragOverColumn === status ? "droppable-hover" : ""}`}
                            onDragOver={(e) => handleDragOver(e, status)}
                            onDragLeave={handleDragLeave}
                            onDrop={(e) => handleDrop(e, status)}
                            data-status={status}
                        >
                            <div className={`p-2.5 ${getColumnColor(status)} flex items-center`}>
                                <div className="flex items-center">
                                    {getColumnIcon(status)}
                                    <h2 className="ml-1.5 font-bold text-sm">{getColumnTitle(status)}</h2>
                                </div>
                                <div
                                    className={`ml-auto px-2 py-0.5 rounded-full text-xs font-medium ${status === "CREATED"
                                            ? "bg-gray-300 text-gray-800"
                                            : status === "IN_PROGRESS"
                                                ? "bg-blue-200 text-blue-800"
                                                : "bg-green-200 text-green-800"
                                        }`}
                                >
                                    {getFilteredTasks(tasks[status]).length}
                                </div>
                            </div>
                            <div className="p-2 flex-grow overflow-y-auto max-h-[calc(100vh-250px)] scrollbar-thin">
                                {getFilteredTasks(tasks[status]).length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-24 text-gray-400 text-xs">
                                        <div className="mb-1.5">
                                            {status === "CREATED" ? (
                                                <PlusCircle className="h-6 w-6" />
                                            ) : status === "IN_PROGRESS" ? (
                                                <Clock className="h-6 w-6" />
                                            ) : (
                                                <CheckCircle className="h-6 w-6" />
                                            )}
                                        </div>
                                        <p>Vazifalar mavjud emas</p>
                                    </div>
                                ) : (
                                    getFilteredTasks(tasks[status]).map((task) => (
                                        <div
                                            key={`task-${task.id}`}
                                            className={`bg-white p-2.5 rounded-lg shadow-sm mb-2 border-l-3 ${status === "CREATED"
                                                    ? "border-gray-400"
                                                    : status === "IN_PROGRESS"
                                                        ? "border-blue-400"
                                                        : "border-green-400"
                                                } hover:shadow-md transition-all relative task-card`}
                                            draggable="true"
                                            onDragStart={(e) => handleDragStart(e, task, status)}
                                            onDragEnd={() => {
                                                if (draggedTaskElement) {
                                                    draggedTaskElement.classList.remove("dragging")
                                                }
                                                setDraggedTask(null)
                                                setDraggedTaskElement(null)
                                            }}
                                            onTouchStart={(e) => handleTouchStart(e, task, status)}
                                            onTouchMove={handleTouchMove}
                                            onTouchEnd={handleTouchEnd}
                                        >
                                            {/* Drag handle icon */}
                                            <div className="absolute top-2 right-2 cursor-grab drag-handle">
                                                <GripVertical className="h-4 w-4 text-gray-400 hover:text-indigo-500" />
                                            </div>

                                            <div className="flex justify-between items-start mb-1.5 pr-6">
                                                <h3
                                                    className={`font-medium text-gray-800 text-sm ${status === "COMPLETED" ? "line-through" : ""}`}
                                                >
                                                    {task.title}
                                                </h3>
                                                <div className="flex items-center">
                                                    <div
                                                        className={`${getPriorityColor(
                                                            task.priority,
                                                        )} h-5 w-5 rounded-full flex items-center justify-center text-white text-xs font-bold`}
                                                        title={getPriorityLabel(task.priority)}
                                                    >
                                                        {task.priority}
                                                    </div>
                                                    <div className="relative ml-1.5 group">
                                                        <button className="text-gray-400 hover:text-gray-600">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </button>
                                                        <div className="absolute right-0 mt-1 w-32 bg-white shadow-lg rounded-md overflow-hidden z-10 hidden group-hover:block">
                                                            <button
                                                                className="w-full text-left px-3 py-1.5 text-xs hover:bg-gray-100 flex items-center text-gray-700"
                                                                onClick={(e) => handleDeleteTask(task.id, e)}
                                                            >
                                                                <Trash2 className="h-3.5 w-3.5 mr-1.5 text-red-500" />
                                                                O'chirish
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {task.description && (
                                                <p className="text-gray-600 text-xs mb-2 line-clamp-2">{task.description}</p>
                                            )}

                                            <div className="flex flex-wrap gap-1.5 mb-1.5">
                                                {task.category && (
                                                    <span className="bg-gray-100 px-1.5 py-0.5 rounded-full text-xs text-gray-700">
                                                        {task.category}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="flex justify-between items-center text-xs text-gray-500 mt-1.5 pt-1.5 border-t border-gray-100">
                                                <div className="flex items-center">
                                                    <Calendar className="h-3 w-3 mr-1" />
                                                    <span className="text-xs">
                                                        {status === "COMPLETED" && task.completedAt
                                                            ? formatDate(task.completedAt)
                                                            : formatDate(task.dueDate)}
                                                    </span>
                                                </div>

                                                {isOverdue(task.dueDate) && status !== "COMPLETED" && (
                                                    <div className="flex items-center text-red-500 font-medium text-xs">
                                                        <AlertCircle className="h-3 w-3 mr-0.5" />
                                                        <span>Muddati o'tgan</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                            <div className="p-2.5 border-t border-gray-100">
                                <button
                                    onClick={() => {
                                        setShowAddForm(true)
                                        setSelectedColumn(status)
                                    }}
                                    className="w-full p-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-md flex items-center justify-center transition-colors text-sm"
                                >
                                    <PlusCircle className="mr-2 h-4 w-4" />
                                    Vazifa qo'shish
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Add task modal */}
            {showAddForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-xl">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">Yangi vazifa qo'shish</h2>
                            <button onClick={() => setShowAddForm(false)} className="text-gray-500 hover:text-gray-700">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Vazifa nomi *</label>
                                <input
                                    type="text"
                                    value={newTaskTitle}
                                    onChange={(e) => setNewTaskTitle(e.target.value)}
                                    placeholder="Vazifa nomi"
                                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tavsif</label>
                                <textarea
                                    value={newTaskDescription}
                                    onChange={(e) => setNewTaskDescription(e.target.value)}
                                    placeholder="Vazifa tavsifi"
                                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    rows={3}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Kategoriya</label>
                                    <input
                                        type="text"
                                        value={newTaskCategory}
                                        onChange={(e) => setNewTaskCategory(e.target.value)}
                                        placeholder="Kategoriya"
                                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Muhimlik (1-5)</label>
                                    <select
                                        value={newTaskPriority}
                                        onChange={(e) => setNewTaskPriority(Number(e.target.value))}
                                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    >
                                        <option value="1">1 - Past</option>
                                        <option value="2">2 - O'rtacha past</option>
                                        <option value="3">3 - O'rtacha</option>
                                        <option value="4">4 - Yuqori</option>
                                        <option value="5">5 - Juda yuqori</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Bajarish muddati</label>
                                <input
                                    type="date"
                                    value={newTaskDueDate}
                                    onChange={(e) => setNewTaskDueDate(e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end space-x-2 mt-6">
                            <button
                                onClick={() => setShowAddForm(false)}
                                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                            >
                                Bekor qilish
                            </button>
                            <button
                                onClick={handleAddTask}
                                disabled={!newTaskTitle.trim()}
                                className={`px-4 py-2 bg-indigo-600 text-white rounded-md ${!newTaskTitle.trim() ? "opacity-50 cursor-not-allowed" : "hover:bg-indigo-700"}`}
                            >
                                Qo'shish
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

