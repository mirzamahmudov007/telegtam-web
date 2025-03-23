import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit"
import { authApi, setApiToken } from "../services/api"
import type { AuthState, User, AuthResponse } from "../types"
import type { RootState } from "./store-types" // Import from store-types instead

// Initial state
const initialState: AuthState = {
    user: null,
    accessToken: null,
    loading: false,
    error: null,
    isAuthenticated: false,
}

// Async thunks
export const loginUser = createAsyncThunk<AuthResponse, string | number, { rejectValue: string }>(
    "auth/login",
    async (telegramId, { rejectWithValue }) => {
        try {
            // Handle case when telegramId might be undefined
            if (!telegramId) {
                alert("No telegramId provided for login")
                return rejectWithValue("No Telegram ID available")
            }
            const response = await authApi.loginUser(telegramId)
            // Update the API token when login is successful
            if (response.data && response.data.accessToken) {
                setApiToken(response.data.accessToken)
            }
            return response.data
        } catch (error: any) {
            console.error("Login error:", error)
            return rejectWithValue(error.response?.data?.message || "Authentication failed")
        }
    },
)

export const logoutUser = createAsyncThunk("auth/logout", async () => {
    // Clear the API token
    setApiToken(null)
    return {}
})
// Auth slice
const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        // Add a reducer to manually set auth state (useful for development)
        setAuthState: (state, action: PayloadAction<{ user: User; token: string }>) => {
            const { user, token } = action.payload
            state.user = user
            state.accessToken = token // ✅ state.token emas, state.accessToken bo'lishi kerak
            state.isAuthenticated = true

            // Update the API token
            setApiToken(token)
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(loginUser.pending, (state) => {
                state.loading = true
                state.error = null
                console.log("Login request pending")
            })
            .addCase(loginUser.fulfilled, (state, action) => {
           
                state.loading = false
                state.user = action.payload
                state.accessToken = action.payload.accessToken 
                state.isAuthenticated = true
            })
            .addCase(loginUser.rejected, (state, action) => {
                console.error("Login failed", action.payload)
                state.loading = false
                state.error = action.payload as string
                state.isAuthenticated = false
            })
            .addCase(logoutUser.fulfilled, (state) => {
                state.user = null
                state.accessToken = null 
                state.isAuthenticated = false
            })
    },
})

// Selectors
export const selectUser = (state: RootState) => state.auth.user
export const selectToken = (state: RootState) => state.auth.accessToken // ✅ state.token emas
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated
export const selectAuthLoading = (state: RootState) => state.auth.loading
export const selectAuthError = (state: RootState) => state.auth.error

export const { setAuthState } = authSlice.actions
export default authSlice.reducer
