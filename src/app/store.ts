import { configureStore } from "@reduxjs/toolkit"
import authReducer from "./authSlice"
import type { RootState as RootStateType } from "./store-types"


export const store = configureStore({   
    reducer: {
        auth: authReducer,
        // Add other reducers here
    },
})

// Use the type from store-types.ts, but also export the actual type
export type RootState = RootStateType
export type AppDispatch = typeof store.dispatch

