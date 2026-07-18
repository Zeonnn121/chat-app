import { httpClient } from "../config/AxiosHelper"

export const signupAPI = async (username, password) => {
    const response = await httpClient.post(`/api/v1/auth/signup`, { username, password })
    return response.data
}

export const loginAPI = async (username, password) => {
    const response = await httpClient.post(`/api/v1/auth/login`, { username, password })
    return response.data
}
