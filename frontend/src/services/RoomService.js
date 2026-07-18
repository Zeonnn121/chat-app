import { httpClient } from "../config/AxiosHelper"

export const createRoom= async(RoomDetail) => {
    const response = await httpClient.post(`/api/v1/rooms`, RoomDetail, {
        headers : {
            "Content-Type": "text/plain" 
        }
    })
    return response.data
}
export const JoinChatAPI = async(roomId) => {
    const response = await httpClient.get(`/api/v1/rooms/${roomId}`);
    return response.data
}

export const getMessages = async(roomId,size=50,page=0)=>{
    const response = await httpClient.get(`/api/v1/rooms/${roomId}/messages?size=${size}&page=${page}`)
    return response.data
}