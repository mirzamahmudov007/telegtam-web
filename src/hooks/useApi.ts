import { useAppSelector } from "./redux-hooks"
import { selectToken } from "../app/authSlice"
import { createTaskApi } from "../services/api"

// Custom hook to get API instances with the current token
export const useApi = () => {
    const token = useAppSelector(selectToken)

    // Create task API with the current token
    const taskApi = createTaskApi(token)

    return {
        taskApi,
    }
}

