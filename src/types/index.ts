// User types
export interface User {
    id: number
    username: string
    firstName: string
    lastName: string
    telegramId: string
    role?: string
    permissions?: string[]
}

// Auth types
export interface AuthState {
    user: User | null
    token: string | null
    loading: boolean
    error: string | null
    isAuthenticated: boolean
}

// Telegram types
export interface TelegramUser {
    id: number
    first_name?: string
    last_name?: string
    username?: string
}

export interface TelegramWebApp {
    ready: () => void
    initDataUnsafe: {
        user?: TelegramUser
        query_id?: string
        auth_date?: string
        hash?: string
    }
}

export interface TelegramWindow extends Window {
    Telegram?: {
        WebApp: TelegramWebApp
    }
}

// API response types
export interface AuthResponse {
    user: User
    token: string
}

// Task types
export interface Task {
    id: number
    title: string
    description: string
    status: "CREATED" | "IN_PROGRESS" | "COMPLETED"
    dueDate: string
    priority: number
    category: string
    isImportant: boolean
    createdAt: string
    completedAt?: string
}

export interface TaskInput {
    title: string
    description: string
    status: "CREATED" | "IN_PROGRESS" | "COMPLETED"
    dueDate: string
    priority: number
    category: string
    isImportant: boolean
}

export interface TaskStatistics {
    total: number
    completed: number
    inProgress: number
    created: number
    overdue: number
}

