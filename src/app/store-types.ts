export interface RootState {
    auth: {
        user: any
        token: string | null
        loading: boolean
        error: string | null
        isAuthenticated: boolean
    }
    // Add other state slices here as needed
}