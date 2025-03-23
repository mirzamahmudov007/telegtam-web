import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from "axios"
import type { AuthResponse, Task, TaskInput, TaskStatistics } from "../types"

// Create axios instance with base URL
const api: AxiosInstance = axios.create({
  baseURL: "https://tear-wells-dressed-flyer.trycloudflare.com",
  headers: {
    "Content-Type": "application/json",
  },
})

// We'll set up the token in a different way to avoid circular dependencies
let currentToken: string | null = null
// Function to update the token (will be called from auth actions)
export const setApiToken = (token: string | null) => {
  currentToken = token
}

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config: AxiosRequestConfig): AxiosRequestConfig => {
    if (currentToken && config.headers) {
      config.headers.Authorization = `Bearer ${currentToken}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Auth API endpoints
export const authApi = {
  loginUser: async (telegramId: string | number): Promise<AxiosResponse<AuthResponse>> => {
    try {
      

      return await api.get(`/api/webapp/auth?telegramId=${telegramId}`)

    } catch (error) {
      console.error("Login error:", error)
      throw error
    }
  },
}

// Task API endpoints
export const taskApi = {
  // Get all tasks for a user
  getUserTasks: (userId: number): Promise<AxiosResponse<Task[]>> => {
    return api.get(`/api/tasks/user/${userId}`)
  },

  // Get task by ID
  getTaskById: (taskId: number): Promise<AxiosResponse<Task>> => {
    return api.get(`/api/tasks/${taskId}`)
  },

  // Create a new task
  createTask: (userId: number, taskData: TaskInput): Promise<AxiosResponse<Task>> => {
    return api.post(`/api/tasks/user/${userId}`, taskData)
  },

  // Update task status
  updateTaskStatus: (taskId: number, status: "CREATED" | "IN_PROGRESS" | "COMPLETED"): Promise<AxiosResponse<Task>> => {
    return api.patch(`/api/tasks/${taskId}/status/${status}`)
  },

  // Delete a task
  deleteTask: (taskId: number): Promise<AxiosResponse<void>> => {
    return api.delete(`/api/tasks/${taskId}`)
  },

  // Get task statistics
  getTaskStatistics: (userId: number): Promise<AxiosResponse<TaskStatistics>> => {
    return api.get(`/api/tasks/user/${userId}/statistics`)
  },
}

export default api

